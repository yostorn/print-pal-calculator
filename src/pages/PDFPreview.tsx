
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <p><strong>ประเภทเพลท:</strong> {quoteData.jobDetails.plateType}</p>
            </div>
          </div>
        </div>

        {/* Cost Summary Table */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-lg font-semibold mb-4">สรุปราคาตามปริมาณ</h2>
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ปริมาณ</th>
                  <th className="px-4 py-3 text-right font-medium">ราคารวม</th>
                  <th className="px-4 py-3 text-right font-medium">ราคาต่อชิ้น</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.quantities.map((qty: string, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">{parseInt(qty).toLocaleString()} ชิ้น</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(totalCosts[index])}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(totalCosts[index] / parseInt(qty))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Cost Breakdown for first quantity */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-lg font-semibold mb-4">รายละเอียดต้นทุน (สำหรับ {parseInt(quoteData.quantities[0]).toLocaleString()} ชิ้น)</h2>
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
                  <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].plateCost)}</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">ต้นทุนกระดาษ</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].paperCost)}</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">ต้นทุนหมึก</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].inkCost)}</td>
                </tr>
                {quoteData.editedBreakdowns[0].coatingCost > 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3">ค่าเคลือบ</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].coatingCost)}</td>
                  </tr>
                )}
                {quoteData.editedBreakdowns[0].spotUvCost > 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3">ค่า Spot UV</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].spotUvCost)}</td>
                  </tr>
                )}
                {quoteData.editedBreakdowns[0].dieCutCost > 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3">ค่าไดคัท</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].dieCutCost)}</td>
                  </tr>
                )}
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-3 font-semibold">รวมต้นทุน</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(quoteData.editedBreakdowns[0].baseCost)}</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">กำไร ({(quoteData.editedBreakdowns[0].profitMargin * 100).toFixed(0)}%)</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(quoteData.editedBreakdowns[0].profit)}</td>
                </tr>
                <tr className="border-t bg-green-50">
                  <td className="px-4 py-3 font-bold text-green-800">ราคารวมทั้งสิ้น</td>
                  <td className="px-4 py-3 text-right font-bold text-green-800">
                    {formatCurrency(totalCosts[0])}
                  </td>
                </tr>
              </tbody>
            </table>
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
