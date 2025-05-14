
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PricingPreview = () => {
  const calc = usePrintCalculation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect to calculator if no results
  useEffect(() => {
    if (calc.results.length === 0) {
      toast({
        title: "ไม่พบข้อมูลการคำนวณ",
        description: "กรุณาคำนวณราคาก่อนดูใบตีราคา",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [calc.results, navigate, toast]);

  const selectedQuantityIndex = calc.selectedQuantityIndex;
  const result = calc.results[selectedQuantityIndex];
  const breakdown = calc.breakdowns[selectedQuantityIndex];
  const quantity = parseInt(calc.quantities[selectedQuantityIndex]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/");
  };

  if (!result || !breakdown) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ใบตีราคางานพิมพ์</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>กลับไปแก้ไข</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>พิมพ์</span>
            </Button>
          </div>
        </div>

        <div className="print:block" id="print-content">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ข้อมูลงานพิมพ์</CardTitle>
              <CardDescription>รายละเอียดงานพิมพ์และการจัดวาง</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">รายละเอียดงาน</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">ประเภทงาน:</span> {calc.jobType || "ไม่ระบุ"}</p>
                    <p><span className="font-medium">ขนาดงาน:</span> {calc.width} × {calc.height} {calc.sizeUnit}</p>
                    <p><span className="font-medium">จำนวน:</span> {quantity.toLocaleString()} ชิ้น</p>
                    <p><span className="font-medium">จำนวนสี:</span> {calc.colors} สี</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">ข้อมูลกระดาษ</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">ประเภทกระดาษ:</span> {calc.paperType || "ไม่ระบุ"}</p>
                    <p><span className="font-medium">แกรม:</span> {breakdown.grammage || "ไม่ระบุ"}</p>
                    <p><span className="font-medium">การตัด:</span> {breakdown.cutsPerSheet} ครั้งจากกระดาษแผ่นใหญ่</p>
                    <p><span className="font-medium">จำนวนต่อแผ่น:</span> {calc.printPerSheet} ชิ้น</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">ตัวเลือกเสริม</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">การเคลือบ:</span> {breakdown.coatingType || "ไม่มี"}</p>
                    <p><span className="font-medium">พิมพ์พื้น:</span> {breakdown.hasBasePrint ? "มี" : "ไม่มี"}</p>
                    <p><span className="font-medium">ไดคัท:</span> {breakdown.hasDieCut ? "มี" : "ไม่มี"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">จำนวนวัสดุ</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">แผ่นพิมพ์:</span> {breakdown.totalSheets} แผ่น</p>
                    <p><span className="font-medium">แผ่นมาสเตอร์:</span> {breakdown.masterSheetsNeeded} แผ่น</p>
                    <p><span className="font-medium">จำนวนรีม:</span> {breakdown.reamsNeeded.toFixed(3)} รีม</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ต้นทุนและราคา</CardTitle>
              <CardDescription>รายละเอียดต้นทุนและการคำนวณราคา</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">รายการ</TableHead>
                    <TableHead className="text-right">จำนวนเงิน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ค่ากระดาษ</TableCell>
                    <TableCell className="text-right">{formatCurrency(breakdown.paperCost || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ค่าเพลท ({calc.plateType})</TableCell>
                    <TableCell className="text-right">{formatCurrency(breakdown.plateCost || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ค่าหมึก ({calc.colors} สี)</TableCell>
                    <TableCell className="text-right">{formatCurrency(breakdown.inkCost || 0)}</TableCell>
                  </TableRow>
                  {breakdown.hasCoating && (
                    <TableRow>
                      <TableCell className="font-medium">ค่าเคลือบ ({breakdown.coatingType})</TableCell>
                      <TableCell className="text-right">{formatCurrency(breakdown.coatingCost || 0)}</TableCell>
                    </TableRow>
                  )}
                  {breakdown.hasDieCut && (
                    <TableRow>
                      <TableCell className="font-medium">ค่าไดคัท</TableCell>
                      <TableCell className="text-right">{formatCurrency(breakdown.dieCutCost || 0)}</TableCell>
                    </TableRow>
                  )}
                  {breakdown.hasBasePrint && (
                    <TableRow>
                      <TableCell className="font-medium">ค่าพิมพ์พื้น</TableCell>
                      <TableCell className="text-right">{formatCurrency(breakdown.basePrintCost || 0)}</TableCell>
                    </TableRow>
                  )}
                  {breakdown.shippingCost > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">ค่าขนส่ง</TableCell>
                      <TableCell className="text-right">{formatCurrency(breakdown.shippingCost || 0)}</TableCell>
                    </TableRow>
                  )}
                  {breakdown.packagingCost > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">ค่าแพ็คกิ้ง</TableCell>
                      <TableCell className="text-right">{formatCurrency(breakdown.packagingCost || 0)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-medium">ต้นทุนรวม</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(breakdown.baseCost || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">กำไร ({(breakdown.profitMargin * 100).toFixed(0)}%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(breakdown.profit || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold text-blue-700">ราคารวมทั้งสิ้น</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">{formatCurrency(result.totalCost || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ราคาต่อชิ้น</TableCell>
                    <TableCell className="text-right">{formatCurrency(result.unitCost || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ราคาต่อแผ่น</TableCell>
                    <TableCell className="text-right">{(result.totalCost / quantity).toFixed(4)} บาท</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-8 text-sm text-gray-500 border-t pt-4">
                <p>หมายเหตุ: ราคานี้คำนวณตามข้อมูลที่ระบุ อาจมีการเปลี่ยนแปลงตามราคาวัสดุในตลาด</p>
                <p>คำนวณเมื่อ: {new Date().toLocaleString('th-TH')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPreview;
