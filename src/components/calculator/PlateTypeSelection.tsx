
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PlateTypeSelectionProps {
  plateType: string;
  onPlateTypeChange: (value: string) => void;
}

const PlateTypeSelection: React.FC<PlateTypeSelectionProps> = ({
  plateType,
  onPlateTypeChange
}) => {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-2">
        <Label className="text-sm font-medium">ประเภทเพลท</Label>
      </div>
      <RadioGroup 
        value={plateType} 
        onValueChange={onPlateTypeChange}
        className="flex gap-4"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id="plate-type-2" value="ตัด 2" />
          <Label htmlFor="plate-type-2">ตัด 2</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="plate-type-4" value="ตัด 4" />
          <Label htmlFor="plate-type-4">ตัด 4</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PlateTypeSelection;
