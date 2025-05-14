
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
  if (results.length === 0) {
    return null;
  }

  const formatPerPieceCost = (cost: number) => {
    return cost.toFixed(4);
  };

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

      {results[selectedIndex] && (
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
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultsTable;
