
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface SizeInputsProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
}

const SizeInputs: React.FC<SizeInputsProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label>ขนาดงาน (ซม.)</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">ระบุขนาดกว้าง × ยาว เป็นหน่วยเซนติเมตร</span>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          value={width}
          onChange={(e) => onWidthChange(e.target.value)}
          placeholder="กว้าง"
          min="0"
          step="0.1"
          className="w-full"
        />
        <span>×</span>
        <Input
          type="number"
          value={height}
          onChange={(e) => onHeightChange(e.target.value)}
          placeholder="ยาว"
          min="0"
          step="0.1"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SizeInputs;
