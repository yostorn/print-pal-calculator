
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Printer, Download } from "lucide-react";

const PricingPreview = () => {
  const calc = usePrintCalculation();
  const navigate = useNavigate();
  
  // If no results, redirect back to calculator
  React.useEffect(() => {
    if (calc.results.length === 0) {
      navigate('/');
    }
  }, [calc.results, navigate]);

  const selectedResult = calc.results[calc.selectedQuantityIndex];
  const selectedBreakdown = calc.breakdowns[calc.selectedQuantityIndex];
  
  const handlePrint = () => {
    window.print();
  };

  if (!selectedResult || !selectedBreakdown) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-medium">ไม่พบข้อมูลการคำนวณ</h2>
              <p className="text-gray-500">กรุณาทำการคำนวณราคาก่อน</p>
              <Button asChild className="mt-4">
                <Link to="/">กลับไปยังเครื่องคำนวณ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPerPieceCost = (cost: number) => {
    return cost.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 print:bg-white print:py-2">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>กลับไปแก้ไข</span>
            </Link>
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>พิมพ์</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>ดาวน์โหลด PDF</span>
            </Button>
          </div>
        </div>
        
        <div className="mb-8 print:mb-4">
          <h1 className="text-3xl font-bold text-gray-900">ใบเสนอราคา</h1>
          <p className="text-gray-600 mt-1">วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>
        
        <Card className="mb-6 print:shadow-none print:border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">รายละเอียดทั่วไป</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">ประเภทงาน:</span> {calc.jobType || "ไม่ระบุ"}</p>
                  <p><span className="font-medium">ขนาดชิ้นงาน:</span> {calc.width} × {calc.height} {calc.sizeUnit}</p>
                  <p><span className="font-medium">จำนวน:</span> {calc.quantities[calc.selectedQuantityIndex]} ชิ้น</p>
                  <p><span className="font-medium">จำนวนสี:</span> {calc.colors}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">รายละเอียดกระดาษ</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">ขนาดกระดาษ:</span> {selectedResult.paperSize}</p>
                  <p><span className="font-medium">จำนวนชิ้นต่อแผ่น:</span> {selectedResult.printPerSheet} ชิ้น</p>
                  <p><span className="font-medium">จำนวนแผ่น:</span> {selectedResult.sheets.toLocaleString()} แผ่น</p>
                  <p><span className="font-medium">แผ่นกระดาษใหญ่:</span> {selectedResult.masterSheets.toLocaleString()} แผ่น</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6 print:shadow-none print:border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">รายละเอียดต้นทุน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">ต้นทุนเพลท ({selectedBreakdown.plateType})</td>
                      <td className="py-1 text-right">{formatCurrency(selectedBreakdown.plateCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">ต้นทุนกระดาษ</td>
                      <td className="py-1 text-right">{formatCurrency(selectedBreakdown.paperCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">ต้นทุนหมึก</td>
                      <td className="py-1 text-right">{formatCurrency(selectedBreakdown.inkCost)}</td>
                    </tr>
                    {selectedBreakdown.hasCoating && (
                      <tr>
                        <td className="py-1 font-medium">ค่าเคลือบ ({selectedBreakdown.coatingType})</td>
                        <td className="py-1 text-right">{formatCurrency(selectedBreakdown.coatingCost)}</td>
                      </tr>
                    )}
                    {selectedBreakdown.hasDieCut && (
                      <tr>
                        <td className="py-1 font-medium">ค่าไดคัท</td>
                        <td className="py-1 text-right">{formatCurrency(selectedBreakdown.dieCutCost)}</td>
                      </tr>
                    )}
                    {selectedBreakdown.hasBasePrint && (
                      <tr>
                        <td className="py-1 font-medium">ค่าพิมพ์พื้น</td>
                        <td className="py-1 text-right">{formatCurrency(selectedBreakdown.basePrintCost)}</td>
                      </tr>
                    )}
                    {selectedBreakdown.shippingCost > 0 && (
                      <tr>
                        <td className="py-1 font-medium">ค่าขนส่ง</td>
                        <td className="py-1 text-right">{formatCurrency(selectedBreakdown.shippingCost)}</td>
                      </tr>
                    )}
                    {selectedBreakdown.packagingCost > 0 && (
                      <tr>
                        <td className="py-1 font-medium">ค่าแพ็คเกจ</td>
                        <td className="py-1 text-right">{formatCurrency(selectedBreakdown.packagingCost)}</td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td className="py-2 font-medium">ต้นทุนรวม</td>
                      <td className="py-2 text-right">{formatCurrency(selectedBreakdown.baseCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">กำไร ({(selectedBreakdown.profitMargin * 100).toFixed(0)}%)</td>
                      <td className="py-1 text-right">{formatCurrency(selectedBreakdown.profit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-lg font-semibold">ราคารวมทั้งสิ้น</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedResult.totalCost)}</div>
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t">
                <div className="text-sm">ราคาต่อชิ้น</div>
                <div className="text-sm font-medium">{formatCurrency(selectedResult.unitCost)}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">ราคาต่อชิ้น (4 ทศนิยม)</div>
                <div className="text-sm">{formatPerPieceCost(selectedResult.unitCost)} บาท</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6 print:shadow-none print:border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">รายละเอียดการคำนวณ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium">ชนิดกระดาษ:</div>
                <p className="text-gray-600 mt-1">
                  กระดาษขนาด {selectedResult.paperSize} แกรม {selectedBreakdown.grammage} g/m²
                </p>
              </div>
              
              <div>
                <div className="font-medium">การตัดกระดาษ:</div>
                <p className="text-gray-600 mt-1">
                  {selectedBreakdown.formulaExplanations.cutsPerSheetFormula.explanation}
                </p>
              </div>
              
              <div>
                <div className="font-medium">จำนวนพิมพ์ต่อแผ่น:</div>
                <p className="text-gray-600 mt-1">
                  สามารถวางงานได้ {selectedResult.printPerSheet} ชิ้นต่อแผ่น
                </p>
              </div>
              
              <div>
                <div className="font-medium">รายละเอียดการคำนวณต้นทุนกระดาษ:</div>
                <p className="text-gray-600 mt-1">
                  {selectedBreakdown.formulaExplanations.paperCostFormula.explanation}
                </p>
              </div>
              
              <div>
                <div className="font-medium">ต้นทุนการพิมพ์:</div>
                <p className="text-gray-600 mt-1">
                  จำนวนสี {selectedBreakdown.colorNumber} สี × {selectedBreakdown.inkCostPerColor} บาท × {selectedBreakdown.totalSheets} แผ่น = {formatCurrency(selectedBreakdown.inkCost)}
                </p>
              </div>
              
              <div>
                <div className="font-medium">เผื่อเสีย:</div>
                <p className="text-gray-600 mt-1">
                  {selectedBreakdown.wastage} แผ่น
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-xs text-gray-500 text-center mt-8 print:mt-4">
          <p>ใบเสนอราคานี้มีอายุ 7 วัน นับจากวันที่ออกเอกสาร</p>
          <p>© 2025 Print Pal Calculator - ระบบคำนวณราคางานพิมพ์ Offset</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPreview;
