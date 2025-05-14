
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Info, Calculator } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ResultsTableProps {
  quantities: string[];
  results: any[];
  onSelectQuantity?: (index: number) => void;
  selectedQuantityIndex?: number;
  onViewLayoutDetails?: () => void;
  breakdowns?: any[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  quantities, 
  results, 
  onSelectQuantity,
  selectedQuantityIndex = 0,
  onViewLayoutDetails,
  breakdowns = []
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  
  if (!results.length) {
    return null;
  }

  const renderFormulaExplanation = (formula: string, explanation: string) => {
    return (
      <div className="space-y-1">
        <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
          {formula}
        </div>
        <div className="text-xs text-gray-600">
          {explanation}
        </div>
      </div>
    );
  };

  const renderCalculationBreakdown = (result: any, breakdown?: any) => {
    if (!breakdown) return null;
    
    return (
      <div className="space-y-2 text-sm p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">สรุป</TabsTrigger>
            <TabsTrigger value="formulas">สูตรคำนวณ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-2 mt-2">
            <h3 className="font-medium mb-2">รายละเอียดการคำนวณ</h3>
            
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">แผ่นพิมพ์:</span>
                <span>{breakdown.totalSheets} แผ่น</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">แผ่นมาสเตอร์:</span>
                <span>{breakdown.masterSheetsNeeded} แผ่น</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">จำนวนรีม:</span>
                <span>{breakdown.reamsNeeded.toFixed(2)} รีม</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">กระดาษเผื่อเสีย:</span>
                <span>{breakdown.wastage} แผ่น</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ราคากระดาษต่อแผ่น:</span>
                <span>{formatCurrency(breakdown.sheetCost || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่ากระดาษทั้งหมด:</span>
                <span>{formatCurrency(breakdown.paperCost || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ประเภทเพลท:</span>
                <span>{breakdown.plateType}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่าเพลท:</span>
                <span>{formatCurrency(breakdown.plateCost || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">จำนวนสี:</span>
                <span>{breakdown.colorNumber} สี</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่าหมึกต่อสี:</span>
                <span>{formatCurrency(breakdown.inkCostPerColor || 0.5)} ต่อสี</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่าหมึกทั้งหมด:</span>
                <span>{formatCurrency(breakdown.inkCost || 0)}</span>
              </div>
              {breakdown.hasCoating && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-600">ค่าเคลือบ:</span>
                  <span>{formatCurrency(breakdown.coatingCost || 0)}</span>
                </div>
              )}
              {breakdown.hasDieCut && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-600">ค่าไดคัท:</span>
                  <span>{formatCurrency(breakdown.dieCutCost || 0)}</span>
                </div>
              )}
              {breakdown.hasBasePrint && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-600">ค่าพิมพ์พื้น:</span>
                  <span>{formatCurrency(breakdown.basePrintCost || 0)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่าขนส่ง:</span>
                <span>{formatCurrency(breakdown.shippingCost || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">ค่าแพ็คกิ้ง:</span>
                <span>{formatCurrency(breakdown.packagingCost || 0)}</span>
              </div>
              <div className="border-t pt-1 grid grid-cols-2 gap-1">
                <span className="text-gray-600 font-medium">ต้นทุนรวม:</span>
                <span>{formatCurrency(breakdown.baseCost || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-gray-600">กำไร ({(breakdown.profitMargin * 100).toFixed(0)}%):</span>
                <span>{formatCurrency(breakdown.profit || 0)}</span>
              </div>
              <div className="border-t pt-1 grid grid-cols-2 gap-1">
                <span className="text-gray-600 font-medium">ราคารวม:</span>
                <span className="font-bold">{formatCurrency(result.totalCost || 0)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="formulas" className="space-y-4 mt-2">
            <h3 className="font-medium">สูตรคำนวณที่ใช้</h3>
            
            {breakdown.formulaExplanations && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-1">ราคากระดาษ</Badge>
                  {renderFormulaExplanation(
                    breakdown.formulaExplanations.paperCostFormula.formula,
                    breakdown.formulaExplanations.paperCostFormula.explanation
                  )}
                </div>
                
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-1">การเลือกเพลท</Badge>
                  {renderFormulaExplanation(
                    breakdown.formulaExplanations.plateTypeFormula.formula,
                    breakdown.formulaExplanations.plateTypeFormula.explanation
                  )}
                </div>
                
                <div className="space-y-1 mt-2">
                  <div className="text-xs font-medium">ตัวแปรที่ใช้ในการคำนวณ:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span><code>conversion_factor</code>:</span>
                    <span>{breakdown.conversionFactor}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span><code>grammage</code>:</span>
                    <span>{breakdown.grammage} gsm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span><code>price_per_kg</code>:</span>
                    <span>{formatCurrency(breakdown.pricePerKg || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">ผลลัพธ์การคำนวณ</CardTitle>
          <div className="flex gap-2">
            {onViewLayoutDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewLayoutDetails}
              >
                <Eye className="h-4 w-4 mr-2" /> ดูการจัดวางงาน
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>จำนวน</TableHead>
              <TableHead>ราคาต่อชิ้น</TableHead>
              <TableHead>ราคารวม</TableHead>
              <TableHead>แผ่นพิมพ์</TableHead>
              <TableHead className="w-[50px]">รายละเอียด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow 
                key={index} 
                className={onSelectQuantity ? "cursor-pointer hover:bg-gray-100" : ""}
                data-state={selectedQuantityIndex === index ? "selected" : undefined}
                onClick={onSelectQuantity ? () => onSelectQuantity(index) : undefined}
              >
                <TableCell className={selectedQuantityIndex === index ? "font-bold" : ""}>
                  {parseInt(quantities[index]).toLocaleString()} ชิ้น
                </TableCell>
                <TableCell>{formatCurrency(result.unitCost)}</TableCell>
                <TableCell>{formatCurrency(result.totalCost)}</TableCell>
                <TableCell>{result.sheets} แผ่น</TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Calculator className="h-4 w-4 text-blue-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96">
                            {renderCalculationBreakdown(result, breakdowns?.[index])}
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ดูรายละเอียดการคำนวณ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {onSelectQuantity && (
          <div className="mt-3 text-sm text-gray-500">
            คลิกที่แถวเพื่อดูรายละเอียดต้นทุน
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
