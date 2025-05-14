
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ResultsTableProps {
  results: any[];
  quantities: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  breakdowns: any[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  quantities,
  selectedIndex,
  onSelect,
  breakdowns
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // เพิ่ม console.log เพื่อดูข้อมูลที่ส่งเข้ามาใน component
  console.log("ResultsTable - Received props:", { 
    resultsLength: results.length, 
    quantitiesLength: quantities.length,
    selectedIndex,
    breakdownsLength: breakdowns?.length
  });
  
  // ตรวจสอบสถานะความพร้อมของข้อมูล
  const hasValidData = Array.isArray(results) && results.length > 0;
  
  // ปรับ selectedIndex ให้ถูกต้องถ้าเกินขอบเขตของข้อมูลที่มี
  useEffect(() => {
    if (hasValidData && (selectedIndex >= results.length || selectedIndex < 0)) {
      console.log("Fixing out of bounds selectedIndex");
      onSelect(0); // Reset to first item if out of bounds
    }
  }, [selectedIndex, results, onSelect, hasValidData]);

  if (!hasValidData) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <span className="text-gray-500">ยังไม่มีผลการคำนวณ</span>
      </div>
    );
  }

  const formatPerPieceCost = (cost: number) => {
    return cost.toFixed(4);
  };

  // ตรวจสอบว่าข้อมูลสำหรับดัชนีที่เลือกมีอยู่จริงและแสดงรายละเอียด console log
  const hasValidResult = selectedIndex < results.length && results[selectedIndex];
  const hasValidBreakdown = selectedIndex < breakdowns?.length && breakdowns[selectedIndex];
  
  console.log("ResultsTable - Validation:", { 
    hasValidResult, 
    hasValidBreakdown,
    selectedResult: hasValidResult ? results[selectedIndex] : null,
    selectedBreakdown: hasValidBreakdown ? breakdowns[selectedIndex] : null
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quantities.map((qty, index) => (
          <Button
            key={index}
            variant={selectedIndex === index ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(index)}
            className="min-w-[80px]"
          >
            {qty} ชิ้น
          </Button>
        ))}
      </div>

      {hasValidResult ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">จำนวนพิมพ์:</div>
              <div className="text-sm text-right">{quantities[selectedIndex]} ชิ้น</div>
              
              <div className="text-sm font-medium">ขนาดกระดาษ:</div>
              <div className="text-sm text-right">{results[selectedIndex].paperSize}</div>
              
              <div className="text-sm font-medium">จำนวนต่อแผ่น:</div>
              <div className="text-sm text-right">{results[selectedIndex].printPerSheet} ชิ้น/แผ่น</div>
              
              <div className="text-sm font-medium">จำนวนแผ่นทั้งหมด:</div>
              <div className="text-sm text-right">{results[selectedIndex].sheets.toLocaleString()} แผ่น</div>
              
              <div className="text-sm font-medium">จำนวนแผ่นกระดาษใหญ่:</div>
              <div className="text-sm text-right">{results[selectedIndex].masterSheets.toLocaleString()} แผ่น</div>

              <div className="text-sm font-medium border-t pt-2">ราคารวมทั้งหมด:</div>
              <div className="text-lg font-bold text-green-600 text-right border-t pt-2">
                {formatCurrency(results[selectedIndex].totalCost)}
              </div>

              <div className="text-sm font-medium">ราคาต่อชิ้น:</div>
              <div className="text-sm text-right font-semibold">
                {formatCurrency(results[selectedIndex].unitCost)}
              </div>
              
              <div className="text-sm font-medium">ราคาต่อชิ้น (4 ทศนิยม):</div>
              <div className="text-sm text-right font-medium">
                {formatPerPieceCost(results[selectedIndex].unitCost)} บาท
              </div>
            </div>

            {hasValidBreakdown && (
              <Collapsible 
                open={showDetails}
                onOpenChange={setShowDetails}
                className="mt-4 pt-2 border-t"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full flex justify-between">
                    <span>แสดงรายละเอียดเพิ่มเติม</span>
                    {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">ต้นทุนเพลท:</div>
                    <div className="text-right">{formatCurrency(breakdowns[selectedIndex].plateCost)}</div>
                    
                    <div className="font-medium">ต้นทุนกระดาษ:</div>
                    <div className="text-right">{formatCurrency(breakdowns[selectedIndex].paperCost)}</div>

                    <div className="font-medium">ต้นทุนหมึก:</div>
                    <div className="text-right">{formatCurrency(breakdowns[selectedIndex].inkCost)}</div>

                    {breakdowns[selectedIndex].hasCoating && (
                      <>
                        <div className="font-medium">ต้นทุนเคลือบ:</div>
                        <div className="text-right">{formatCurrency(breakdowns[selectedIndex].coatingCost)}</div>
                      </>
                    )}

                    {breakdowns[selectedIndex].hasDieCut && (
                      <>
                        <div className="font-medium">ต้นทุนไดคัท:</div>
                        <div className="text-right">{formatCurrency(breakdowns[selectedIndex].dieCutCost)}</div>
                      </>
                    )}

                    {breakdowns[selectedIndex].hasBasePrint && (
                      <>
                        <div className="font-medium">ต้นทุนพิมพ์พื้น:</div>
                        <div className="text-right">{formatCurrency(breakdowns[selectedIndex].basePrintCost)}</div>
                      </>
                    )}

                    {breakdowns[selectedIndex].shippingCost > 0 && (
                      <>
                        <div className="font-medium">ค่าขนส่ง:</div>
                        <div className="text-right">{formatCurrency(breakdowns[selectedIndex].shippingCost)}</div>
                      </>
                    )}

                    {breakdowns[selectedIndex].packagingCost > 0 && (
                      <>
                        <div className="font-medium">ค่าบรรจุภัณฑ์:</div>
                        <div className="text-right">{formatCurrency(breakdowns[selectedIndex].packagingCost)}</div>
                      </>
                    )}
                    
                    <div className="font-medium border-t pt-1">ต้นทุนรวม:</div>
                    <div className="text-right font-medium border-t pt-1">{formatCurrency(breakdowns[selectedIndex].baseCost)}</div>
                    
                    <div className="font-medium">กำไร ({(breakdowns[selectedIndex].profitMargin * 100).toFixed(0)}%):</div>
                    <div className="text-right">{formatCurrency(breakdowns[selectedIndex].profit)}</div>
                    
                    <div className="font-medium border-t pt-1">ราคาขายรวม:</div>
                    <div className="text-right font-bold text-green-600 border-t pt-1">
                      {formatCurrency(results[selectedIndex].totalCost)}
                    </div>
                  </div>
                  
                  {breakdowns[selectedIndex].formulaExplanations && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-md text-xs">
                      {breakdowns[selectedIndex].formulaExplanations.paperCostFormula && (
                        <p><span className="font-medium">สูตรคำนวณกระดาษ:</span> {breakdowns[selectedIndex].formulaExplanations.paperCostFormula.explanation}</p>
                      )}
                      <p className="mt-1"><span className="font-medium">ประเภทเพลท:</span> {breakdowns[selectedIndex].plateType} ({formatCurrency(breakdowns[selectedIndex].basePlateCost)})</p>
                      <p className="mt-1"><span className="font-medium">จำนวนตัดกระดาษ:</span> {breakdowns[selectedIndex].cutsPerSheet} ครั้ง</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center p-4 border rounded-md bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-amber-700">ไม่พบข้อมูลการคำนวณ</span>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
