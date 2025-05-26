
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info, Edit2, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CostItem {
  name: string;
  costs: number[];
  formulas: string[];
  explanations: string[];
  editable: boolean;
}

interface CostBreakdownTableProps {
  quantities: string[];
  breakdowns: any[];
  onCostUpdate: (costName: string, quantityIndex: number, newValue: number) => void;
}

const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
  quantities,
  breakdowns,
  onCostUpdate
}) => {
  const { toast } = useToast();
  const [editingCell, setEditingCell] = useState<{row: string, col: number} | null>(null);
  const [editValue, setEditValue] = useState("");

  // Prepare cost items from breakdowns
  const costItems: CostItem[] = [
    {
      name: "ต้นทุนเพลท",
      costs: breakdowns.map(b => b.plateCost),
      formulas: breakdowns.map(b => `${b.plateType} × ${b.colorNumber} สี`),
      explanations: breakdowns.map(b => `เพลท${b.plateType} ราคา ${formatCurrency(b.basePlateCost)} × จำนวนสี ${b.colorNumber}`),
      editable: true
    },
    {
      name: "ต้นทุนกระดาษ",
      costs: breakdowns.map(b => b.paperCost),
      formulas: breakdowns.map(b => "รีม × ขนาด × แกรม × ราคา"),
      explanations: breakdowns.map(b => b.formulaExplanations?.paperCostFormula?.explanation || "คำนวณจากขนาดกระดาษและจำนวนที่ใช้"),
      editable: true
    },
    {
      name: "ต้นทุนหมึก",
      costs: breakdowns.map(b => b.inkCost),
      formulas: breakdowns.map(b => `หมึกปกติ ${b.normalColors} สี + หมึกตีพื้น ${b.baseColors} สี`),
      explanations: breakdowns.map(b => `หมึกปกติ: ${formatCurrency(b.normalInkCost)} + หมึกตีพื้น: ${formatCurrency(b.baseInkCost)}`),
      editable: true
    },
    ...(breakdowns[0]?.hasCoating ? [{
      name: "ค่าเคลือบ",
      costs: breakdowns.map(b => b.coatingCost),
      formulas: breakdowns.map(b => `${b.coatingType} × จำนวนแผ่น`),
      explanations: breakdowns.map(b => `เคลือบ${b.coatingType} × ${b.totalSheets} แผ่น`),
      editable: true
    }] : []),
    ...(breakdowns[0]?.hasSpotUv ? [{
      name: "ค่า Spot UV",
      costs: breakdowns.map(b => b.spotUvCost),
      formulas: breakdowns.map(b => "ขนาด × จำนวนแผ่น"),
      explanations: breakdowns.map(b => `Spot UV × ${b.totalSheets} แผ่น`),
      editable: true
    }] : []),
    ...(breakdowns[0]?.hasDieCut ? [{
      name: "ค่าไดคัท",
      costs: breakdowns.map(b => b.dieCutCost),
      formulas: breakdowns.map(() => "ค่าคงที่"),
      explanations: breakdowns.map(() => "ค่าไดคัทที่กำหนด"),
      editable: true
    }] : []),
    ...(breakdowns[0]?.hasBasePrint ? [{
      name: "ค่าพิมพ์พื้น",
      costs: breakdowns.map(b => b.basePrintCost),
      formulas: breakdowns.map(() => "ค่าคงที่"),
      explanations: breakdowns.map(() => "ค่าพิมพ์พื้นที่กำหนด"),
      editable: true
    }] : []),
    ...(breakdowns[0]?.shippingCost > 0 ? [{
      name: "ค่าขนส่ง",
      costs: breakdowns.map(b => b.shippingCost),
      formulas: breakdowns.map(() => "ค่าคงที่"),
      explanations: breakdowns.map(() => "ค่าขนส่งที่กำหนด"),
      editable: true
    }] : []),
    ...(breakdowns[0]?.packagingCost > 0 ? [{
      name: "ค่าแพ็คเกจ",
      costs: breakdowns.map(b => b.packagingCost),
      formulas: breakdowns.map(() => "ค่าคงที่"),
      explanations: breakdowns.map(() => "ค่าแพ็คเกจที่กำหนด"),
      editable: true
    }] : []),
    {
      name: "รวมต้นทุน",
      costs: breakdowns.map(b => b.baseCost),
      formulas: breakdowns.map(() => "ผลรวมทั้งหมด"),
      explanations: breakdowns.map(() => "ผลรวมของต้นทุนทั้งหมด"),
      editable: false
    },
    {
      name: "กำไร",
      costs: breakdowns.map(b => b.profit),
      formulas: breakdowns.map(b => `${(b.profitMargin * 100).toFixed(0)}% ของต้นทุน`),
      explanations: breakdowns.map(b => `${(b.profitMargin * 100).toFixed(0)}% × ${formatCurrency(b.baseCost)}`),
      editable: false
    },
    {
      name: "ราคารวม",
      costs: breakdowns.map((b, i) => b.baseCost + b.profit),
      formulas: breakdowns.map(() => "ต้นทุน + กำไร"),
      explanations: breakdowns.map((b) => `${formatCurrency(b.baseCost)} + ${formatCurrency(b.profit)}`),
      editable: false
    }
  ];

  const startEdit = (rowName: string, colIndex: number, currentValue: number) => {
    setEditingCell({ row: rowName, col: colIndex });
    setEditValue(currentValue.toString());
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = (rowName: string, colIndex: number) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      toast({
        title: "ค่าไม่ถูกต้อง",
        description: "กรุณาระบุตัวเลขที่ถูกต้อง",
        variant: "destructive"
      });
      return;
    }

    onCostUpdate(rowName, colIndex, newValue);
    setEditingCell(null);
    setEditValue("");
    
    toast({
      title: "บันทึกเรียบร้อย",
      description: "ค่าใช้จ่ายได้รับการอัพเดทแล้ว"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ตารางสรุปต้นทุนแบบละเอียด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">รายการ</TableHead>
                {quantities.map((qty, index) => (
                  <TableHead key={index} className="text-center min-w-32">
                    {parseInt(qty).toLocaleString()} ชิ้น
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {costItems.map((item, rowIndex) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {quantities.map((_, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {editingCell?.row === item.name && editingCell?.col === colIndex ? (
                          <div className="flex items-center space-x-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-8 text-xs"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveEdit(item.name, colIndex)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm">
                              {formatCurrency(item.costs[colIndex])}
                            </span>
                            {item.editable && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(item.name, colIndex, item.costs[colIndex])}
                                className="h-6 w-6 p-0 ml-1"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 ml-1"
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>วิธีการคำนวณ: {item.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                  <p><strong>สูตร:</strong> {item.formulas[colIndex]}</p>
                                  <p><strong>คำอธิบาย:</strong> {item.explanations[colIndex]}</p>
                                  <p><strong>ผลลัพธ์:</strong> {formatCurrency(item.costs[colIndex])}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdownTable;
