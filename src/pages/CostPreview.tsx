
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import CostBreakdownTable from "@/components/CostBreakdownTable";
import QuoteSummaryForm from "@/components/QuoteSummaryForm";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CostPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from previous page
  const [costData, setCostData] = useState<any>(null);
  const [editedBreakdowns, setEditedBreakdowns] = useState<any[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [paperTypeName, setPaperTypeName] = useState("");
  const [paperGrammageValue, setPaperGrammageValue] = useState("");
  const [supplierName, setSupplierName] = useState("");

  useEffect(() => {
    // Get data from navigation state or localStorage
    const navData = location.state;
    if (navData && navData.results && navData.breakdowns) {
      setCostData(navData);
      setEditedBreakdowns([...navData.breakdowns]);
      fetchDisplayNames(navData);
    } else {
      // Try to get from localStorage as fallback
      const savedData = localStorage.getItem("print_calculator_results");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setCostData(parsed);
          setEditedBreakdowns([...parsed.breakdowns]);
          fetchDisplayNames(parsed);
        } catch (error) {
          console.error("Error parsing saved data:", error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [location.state, navigate]);

  const fetchDisplayNames = async (data: any) => {
    try {
      // Fetch paper type name
      if (data.paperType) {
        const { data: paperTypeData } = await supabase
          .from('paper_types')
          .select('name')
          .eq('id', data.paperType)
          .single();
        if (paperTypeData) setPaperTypeName(paperTypeData.name);
      }

      // Fetch paper grammage value
      if (data.paperGrammage) {
        const { data: grammageData } = await supabase
          .from('paper_grammages')
          .select('grammage')
          .eq('id', data.paperGrammage)
          .single();
        if (grammageData) setPaperGrammageValue(grammageData.grammage);
      }

      // Fetch supplier name
      if (data.supplier) {
        const { data: supplierData } = await supabase
          .from('suppliers')
          .select('name')
          .eq('id', data.supplier)
          .single();
        if (supplierData) setSupplierName(supplierData.name);
      }
    } catch (error) {
      console.error("Error fetching display names:", error);
    }
  };

  const handleCostUpdate = (costName: string, quantityIndex: number, newValue: number) => {
    setEditedBreakdowns(prev => {
      const updated = [...prev];
      const breakdown = { ...updated[quantityIndex] };
      
      // Update the specific cost field
      switch (costName) {
        case "ต้นทุนเพลท":
          breakdown.plateCost = newValue;
          break;
        case "ต้นทุนกระดาษ":
          breakdown.paperCost = newValue;
          break;
        case "ต้นทุนหมึก":
          breakdown.inkCost = newValue;
          break;
        case "ค่าเคลือบ":
          breakdown.coatingCost = newValue;
          break;
        case "ค่า Spot UV":
          breakdown.spotUvCost = newValue;
          break;
        case "ค่าไดคัท":
          breakdown.dieCutCost = newValue;
          break;
        case "ค่าพิมพ์พื้น":
          breakdown.basePrintCost = newValue;
          break;
        case "ค่าขนส่ง":
          breakdown.shippingCost = newValue;
          break;
        case "ค่าแพ็คเกจ":
          breakdown.packagingCost = newValue;
          break;
      }
      
      // Recalculate totals
      breakdown.baseCost = breakdown.plateCost + breakdown.paperCost + breakdown.inkCost + 
                          (breakdown.coatingCost || 0) + (breakdown.spotUvCost || 0) + 
                          (breakdown.dieCutCost || 0) + (breakdown.basePrintCost || 0) + 
                          (breakdown.shippingCost || 0) + (breakdown.packagingCost || 0);
      
      breakdown.profit = breakdown.baseCost * breakdown.profitMargin;
      
      updated[quantityIndex] = breakdown;
      return updated;
    });
  };

  const handleGeneratePDF = (quoteData: {
    customerName: string;
    jobName: string;
    date: Date;
  }) => {
    // Create PDF content
    const pdfContent = {
      ...quoteData,
      costData,
      editedBreakdowns,
      quantities: costData?.quantities || [],
      jobDetails: {
        width: costData?.width,
        height: costData?.height,
        sizeUnit: costData?.sizeUnit,
        colors: costData?.colors,
        paperType: paperTypeName || costData?.paperType,
        paperGrammage: paperGrammageValue || costData?.paperGrammage,
        supplier: supplierName || costData?.supplier,
        plateType: costData?.plateType,
        hasCoating: editedBreakdowns[0]?.hasCoating,
        coatingType: editedBreakdowns[0]?.coatingType,
        hasSpotUv: editedBreakdowns[0]?.hasSpotUv,
        hasDieCut: editedBreakdowns[0]?.hasDieCut,
        hasBasePrint: editedBreakdowns[0]?.hasBasePrint,
        shippingCost: editedBreakdowns[0]?.shippingCost > 0,
        packagingCost: editedBreakdowns[0]?.packagingCost > 0
      }
    };
    
    // Store data for PDF page
    localStorage.setItem("pdf_quote_data", JSON.stringify(pdfContent));
    
    // Navigate to PDF preview page
    navigate('/pdf-preview');
  };

  if (!costData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-medium">กำลังโหลดข้อมูล...</h2>
              <Button onClick={() => navigate('/')}>
                กลับไปยังเครื่องคำนวณ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCosts = editedBreakdowns.map(breakdown => 
    breakdown.baseCost + breakdown.profit
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>กลับไปแก้ไข</span>
          </Button>
          
          <Button onClick={() => setShowQuoteForm(true)} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>สร้างใบเสนอราคา</span>
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ตารางสรุปต้นทุนและราคา</h1>
          <p className="text-gray-600 mt-1">คุณสามารถแก้ไขค่าใช้จ่ายแต่ละรายการได้โดยคลิกที่ไอคอนแก้ไข</p>
        </div>

        {/* Job Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>รายละเอียดงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">ขนาดชิ้นงาน:</span>
                <p className="font-semibold">{costData.width} × {costData.height} {costData.sizeUnit}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">จำนวนสี:</span>
                <p className="font-semibold">{costData.colors} สี</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">ประเภทกระดาษ:</span>
                <p className="font-semibold">{paperTypeName || 'ไม่ระบุ'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">แกรมกระดาษ:</span>
                <p className="font-semibold">{paperGrammageValue} แกรม</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">ซัพพลายเออร์:</span>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">ประเภทเพลท:</span>
                <p className="font-semibold">{costData.plateType}</p>
              </div>
              {editedBreakdowns[0]?.hasCoating && (
                <div>
                  <span className="font-medium text-gray-600">เคลือบ:</span>
                  <p className="font-semibold">{editedBreakdowns[0].coatingType}</p>
                </div>
              )}
              {editedBreakdowns[0]?.hasSpotUv && (
                <div>
                  <span className="font-medium text-gray-600">Spot UV:</span>
                  <p className="font-semibold">มี</p>
                </div>
              )}
              {editedBreakdowns[0]?.hasDieCut && (
                <div>
                  <span className="font-medium text-gray-600">ไดคัท:</span>
                  <p className="font-semibold">มี</p>
                </div>
              )}
              {editedBreakdowns[0]?.hasBasePrint && (
                <div>
                  <span className="font-medium text-gray-600">พิมพ์พื้น:</span>
                  <p className="font-semibold">มี</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <CostBreakdownTable
            quantities={costData.quantities}
            breakdowns={editedBreakdowns}
            onCostUpdate={handleCostUpdate}
          />
          
          {/* Summary Cards for ALL quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {costData.quantities.map((qty: string, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{parseInt(qty).toLocaleString()} ชิ้น</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">ราคารวม:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(totalCosts[index])}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ราคาต่อชิ้น:</span>
                      <span className="text-sm">
                        {formatCurrency(totalCosts[index] / parseInt(qty))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Cost Breakdown for ALL quantities */}
          <div className="space-y-6">
            {costData.quantities.map((qty: string, index: number) => {
              const breakdown = editedBreakdowns[index];
              if (!breakdown) return null;

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>รายละเอียดต้นทุน (สำหรับ {parseInt(qty).toLocaleString()} ชิ้น)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">รายการ</th>
                            <th className="px-4 py-3 text-right font-medium">จำนวน</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="px-4 py-3">ต้นทุนเพลท</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(breakdown.plateCost)}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-4 py-3">ต้นทุนกระดาษ</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(breakdown.paperCost)}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-4 py-3">ต้นทุนหมึก</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(breakdown.inkCost)}</td>
                          </tr>
                          {breakdown.coatingCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่าเคลือบ</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.coatingCost)}</td>
                            </tr>
                          )}
                          {breakdown.spotUvCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่า Spot UV</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.spotUvCost)}</td>
                            </tr>
                          )}
                          {breakdown.dieCutCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่าไดคัท</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.dieCutCost)}</td>
                            </tr>
                          )}
                          {breakdown.basePrintCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่าพิมพ์พื้น</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.basePrintCost)}</td>
                            </tr>
                          )}
                          {breakdown.shippingCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่าขนส่ง</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.shippingCost)}</td>
                            </tr>
                          )}
                          {breakdown.packagingCost > 0 && (
                            <tr className="border-t">
                              <td className="px-4 py-3">ค่าแพ็คเกจ</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(breakdown.packagingCost)}</td>
                            </tr>
                          )}
                          <tr className="border-t bg-gray-50">
                            <td className="px-4 py-3 font-semibold">รวมต้นทุน</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(breakdown.baseCost)}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-4 py-3">กำไร ({(breakdown.profitMargin * 100).toFixed(0)}%)</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(breakdown.profit)}</td>
                          </tr>
                          <tr className="border-t bg-green-50">
                            <td className="px-4 py-3 font-bold text-green-800">ราคารวมทั้งสิ้น</td>
                            <td className="px-4 py-3 text-right font-bold text-green-800">
                              {formatCurrency(totalCosts[index])}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">สร้างใบเสนอราคา</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowQuoteForm(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <QuoteSummaryForm onGeneratePDF={handleGeneratePDF} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostPreview;
