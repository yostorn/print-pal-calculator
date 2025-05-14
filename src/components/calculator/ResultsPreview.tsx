
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import LayoutPreview from "../layout-preview/LayoutPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResultsTable from "../ResultsTable";

interface ResultsPreviewProps {
  selectedPaperSize: { width: number; height: number } | null;
  showPreview: boolean;
  width: string;
  height: string;
  printPerSheet: number;
  onLayoutChange: (perSheet: number) => void;
  quantities: string[];
  results: any[];
  selectedQuantityIndex: number;
  onSelectQuantity: (index: number) => void;
  breakdowns: any[];
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({
  selectedPaperSize,
  showPreview,
  width,
  height,
  printPerSheet,
  onLayoutChange,
  quantities,
  results,
  selectedQuantityIndex,
  onSelectQuantity,
  breakdowns,
}) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <CardTitle className="text-lg font-semibold">ตัวอย่างการจัดวางงาน</CardTitle>
        
        {showPreview && selectedPaperSize && width && height ? (
          <div className="space-y-4">
            <LayoutPreview
              paperWidth={selectedPaperSize.width}
              paperHeight={selectedPaperSize.height}
              jobWidth={parseFloat(width)}
              jobHeight={parseFloat(height)}
              onLayoutChange={onLayoutChange}
              printPerSheet={printPerSheet}
            />
            
            <div className="text-sm text-center text-green-600 font-medium">
              สามารถวางงานได้ {printPerSheet} ชิ้นต่อแผ่น
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded-md border">
            <span className="text-gray-400 text-sm">
              กรุณากรอกข้อมูลงาน และเลือกขนาดกระดาษเพื่อแสดงการจัดวาง
            </span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="font-semibold">ผลการคำนวณ</h3>
            <ScrollArea className="h-[250px]">
              <ResultsTable 
                results={results} 
                quantities={quantities} 
                selectedIndex={selectedQuantityIndex}
                onSelect={onSelectQuantity}
                breakdowns={breakdowns}
              />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsPreview;
