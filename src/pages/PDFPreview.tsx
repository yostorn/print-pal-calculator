
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const PDFPreview = () => {
  const navigate = useNavigate();
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("pdf_quote_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setQuoteData(parsed);
      } catch (error) {
        console.error("Error parsing PDF data:", error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // For now, just trigger print which can be saved as PDF
    window.print();
  };

  if (!quoteData) {
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

  const totalCosts = quoteData.editedBreakdowns.map((breakdown: any) => 
    breakdown.baseCost + breakdown.profit
  );

  // Prepare cost items for table display
  const costItems = [
    {
      name: "ต้นทุนเพลท",
      values: quoteData.editedBreakdowns.map((b: any) => b.plateCost || 0)
    },
    {
      name: "ต้นทุนกระดาษ",
      values: quoteData.editedBreakdowns.map((b: any) => b.paperCost || 0)
    },
    {
      name: "ต้นทุนหมึก",
      values: quoteData.editedBreakdowns.map((b: any) => b.inkCost || 0)
    },
    ...(quoteData.editedBreakdowns[0]?.coatingCost > 0 ? [{
      name: "ค่าเคลือบ",
      values: quoteData.editedBreakdowns.map((b: any) => b.coatingCost || 0)
    }] : []),
    ...(quoteData.editedBreakdowns[0]?.spotUvCost > 0 ? [{
      name: "ค่า Spot UV",
      values: quoteData.editedBreakdowns.map((b: any) => b.spotUvCost || 0)
    }] : []),
    ...(quoteData.editedBreakdowns[0]?.dieCutCost > 0 ? [{
      name: "ค่าไดคัท",
      values: quoteData.editedBreakdowns.map((b: any) => b.dieCutCost || 0)
    }] : []),
    ...(quoteData.editedBreakdowns[0]?.basePrintCost > 0 ? [{
      name: "ค่าพิมพ์พื้น",
      values: quoteData.editedBreakdowns.map((b: any) => b.basePrintCost || 0)
    }] : []),
    ...(quoteData.editedBreakdowns[0]?.shippingCost > 0 ? [{
      name: "ค่าขนส่ง",
      values: quoteData.editedBreakdowns.map((b: any) => b.shippingCost || 0)
    }] : []),
    ...(quoteData.editedBreakdowns[0]?.packagingCost > 0 ? [{
      name: "ค่าแพ็คเกจ",
      values: quoteData.editedBreakdowns.map((b: any) => b.packagingCost || 0)
    }] : []),
    {
      name: "รวมต้นทุน",
      values: quoteData.editedBreakdowns.map((b: any) => b.baseCost || 0),
      isSubtotal: true
    },
    {
      name: "กำไร",
      values: quoteData.editedBreakdowns.map((b: any) => b.profit || 0),
      showPercentage: true
    },
    {
      name: "ราคารวมทั้งสิ้น",
      values: totalCosts,
      isTotal: true
    }
  ];

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print controls - hidden when printing */}
      <div className="print:hidden bg-gray-50 py-4 px-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>พิมพ์</span>
            </Button>
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>ดาวน์โหลด PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-6">
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ใบเสนอราคา</h1>
          <p className="text-lg text-gray-600">Print Pal Calculator</p>
        </div>

        {/* Quote Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 print:mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">ข้อมูลลูกค้า</h2>
            <div className="space-y-1">
              <p><strong>ชื่อลูกค้า:</strong> {quoteData.customerName}</p>
              <p><strong>ชื่องาน:</strong> {quoteData.jobName}</p>
              <p><strong>วันที่:</strong> {format(new Date(quoteData.date), "dd MMMM yyyy", { locale: th })}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">รายละเอียดงาน</h2>
            <div className="space-y-1">
              <p><strong>ขนาดชิ้นงาน:</strong> {quoteData.jobDetails.width} × {quoteData.jobDetails.height} {quoteData.jobDetails.sizeUnit}</p>
              <p><strong>จำนวนสี:</strong> {quoteData.jobDetails.colors} สี</p>
              <p><strong>ประเภทกระดาษ:</strong> {quoteData.jobDetails.paperType || 'ไม่ระบุ'}</p>
              <p><strong>แกรมกระดาษ:</strong> {quoteData.jobDetails.paperGrammage} แกรม</p>
              <p><strong>ซัพพลายเออร์:</strong> {quoteData.jobDetails.supplier}</p>
              <p><strong>ประเภทเพลท:</strong> {quoteData.jobDetails.plateType}</p>
              {quoteData.jobDetails.hasCoating && (
                <p><strong>เคลือบ:</strong> {quoteData.jobDetails.coatingType}</p>
              )}
              {quoteData.jobDetails.hasSpotUv && (
                <p><strong>Spot UV:</strong> มี</p>
              )}
              {quoteData.jobDetails.hasDieCut && (
                <p><strong>ไดคัท:</strong> มี</p>
              )}
              {quoteData.jobDetails.hasBasePrint && (
                <p><strong>พิมพ์พื้น:</strong> มี</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary Table for ALL quantities */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-lg font-semibold mb-4">สรุปราคาตามปริมาณ</h2>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">ปริมาณ</TableHead>
                  <TableHead className="text-right font-medium">ราคารวม</TableHead>
                  <TableHead className="text-right font-medium">ราคาต่อชิ้น</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteData.quantities.map((qty: string, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{parseInt(qty).toLocaleString()} ชิ้น</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(totalCosts[index])}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalCosts[index] / parseInt(qty))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Detailed Cost Breakdown as Single Table */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-lg font-semibold mb-4">รายละเอียดต้นทุน</h2>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">รายการ</TableHead>
                  {quoteData.quantities.map((qty: string, index: number) => (
                    <TableHead key={index} className="text-right font-medium">
                      {parseInt(qty).toLocaleString()} ชิ้น
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {costItems.map((item, itemIndex) => (
                  <TableRow 
                    key={itemIndex} 
                    className={
                      item.isSubtotal ? "bg-gray-50 font-medium" :
                      item.isTotal ? "bg-green-50 font-bold text-green-800" :
                      ""
                    }
                  >
                    <TableCell className={item.isTotal ? "font-bold text-green-800" : "font-medium"}>
                      {item.name}
                      {item.showPercentage && quoteData.editedBreakdowns[0] && 
                        ` (${(quoteData.editedBreakdowns[0].profitMargin * 100).toFixed(0)}%)`
                      }
                    </TableCell>
                    {item.values.map((value: number, valueIndex: number) => (
                      <TableCell 
                        key={valueIndex} 
                        className={`text-right ${
                          item.isTotal ? "font-bold text-green-800" : 
                          item.isSubtotal ? "font-semibold" : ""
                        }`}
                      >
                        {formatCurrency(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-12 print:mt-8">
          <p>ใบเสนอราคานี้มีอายุ 7 วัน นับจากวันที่ออกเอกสาร</p>
          <p className="mt-1">สร้างโดย Print Pal Calculator - ระบบคำนวณราคางานพิมพ์ Offset</p>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
