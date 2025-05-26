
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface PrintsPerSheetAdjustmentProps {
  selectedPaperSize: { width: number; height: number } | null;
  width: string;
  height: string;
  manualPrintCount: string;
  onPrintCountChange: (value: string) => void;
  onIncrementPrintCount: () => void;
  onDecrementPrintCount: () => void;
}

const PrintsPerSheetAdjustment: React.FC<PrintsPerSheetAdjustmentProps> = ({
  selectedPaperSize,
  width,
  height,
  manualPrintCount,
  onPrintCountChange,
  onIncrementPrintCount,
  onDecrementPrintCount
}) => {
  if (!selectedPaperSize || !width || !height) return null;

  return (
    <div className="rounded-md border p-4">
      <div className="mb-2">
        <Label className="text-sm font-medium">จำนวนชิ้นต่อแผ่น</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={onDecrementPrintCount}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input 
          type="number"
          value={manualPrintCount}
          onChange={(e) => onPrintCountChange(e.target.value)}
          className="w-20 text-center"
          min="1"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={onIncrementPrintCount}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div className="text-sm text-green-600 ml-2">
          เรียบร้อย! ชิ้นงานสามารถวางได้ {manualPrintCount} ชิ้นต่อแผ่น
        </div>
      </div>
    </div>
  );
};

export default PrintsPerSheetAdjustment;
