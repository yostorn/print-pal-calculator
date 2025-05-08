
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SizeInputsProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onUnitChange?: (unit: "cm" | "inch") => void;
}

const SizeInputs: React.FC<SizeInputsProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onUnitChange
}) => {
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [internalWidth, setInternalWidth] = useState(width);
  const [internalHeight, setInternalHeight] = useState(height);

  // Convert between cm and inches when unit changes
  useEffect(() => {
    if (unit === "cm") {
      // Convert from inches to cm if needed
      if (width && !isNaN(parseFloat(width)) && parseFloat(width) > 0 && parseFloat(width) < 50) {
        setInternalWidth((parseFloat(width) * 2.54).toFixed(2));
        onWidthChange((parseFloat(width) * 2.54).toFixed(2));
      }
      if (height && !isNaN(parseFloat(height)) && parseFloat(height) > 0 && parseFloat(height) < 50) {
        setInternalHeight((parseFloat(height) * 2.54).toFixed(2));
        onHeightChange((parseFloat(height) * 2.54).toFixed(2));
      }
    } else {
      // Convert from cm to inches
      if (width && !isNaN(parseFloat(width)) && parseFloat(width) > 0) {
        setInternalWidth((parseFloat(width) / 2.54).toFixed(2));
        onWidthChange((parseFloat(width) / 2.54).toFixed(2));
      }
      if (height && !isNaN(parseFloat(height)) && parseFloat(height) > 0) {
        setInternalHeight((parseFloat(height) / 2.54).toFixed(2));
        onHeightChange((parseFloat(height) / 2.54).toFixed(2));
      }
    }
    
    // Notify parent about unit change if handler exists
    if (onUnitChange) {
      onUnitChange(unit);
    }
  }, [unit]);

  const handleWidthChange = (value: string) => {
    setInternalWidth(value);
    onWidthChange(value);
  };

  const handleHeightChange = (value: string) => {
    setInternalHeight(value);
    onHeightChange(value);
  };

  const handleUnitChange = (value: "cm" | "inch") => {
    if (value) setUnit(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label>ขนาดงาน</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุขนาดกว้าง × ยาว</span>
          </div>
        </div>
        <ToggleGroup 
          type="single" 
          value={unit} 
          onValueChange={handleUnitChange} 
          className="border rounded-md"
        >
          <ToggleGroupItem value="cm" className="px-2 py-1 text-xs">
            ซม.
          </ToggleGroupItem>
          <ToggleGroupItem value="inch" className="px-2 py-1 text-xs">
            นิ้ว
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          value={internalWidth}
          onChange={(e) => handleWidthChange(e.target.value)}
          placeholder="กว้าง"
          min="0"
          step="0.1"
          className="w-full"
        />
        <span>×</span>
        <Input
          type="number"
          value={internalHeight}
          onChange={(e) => handleHeightChange(e.target.value)}
          placeholder="ยาว"
          min="0"
          step="0.1"
          className="w-full"
        />
        <span className="text-sm text-gray-500">{unit === "cm" ? "ซม." : "นิ้ว"}</span>
      </div>
    </div>
  );
};

export default SizeInputs;
