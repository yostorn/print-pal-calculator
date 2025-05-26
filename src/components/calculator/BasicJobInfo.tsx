
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaperTypeDropdown from "../PaperTypeDropdown";
import PaperGrammageDropdown from "../PaperGrammageDropdown";
import SupplierDropdown from "../SupplierDropdown";
import SizeInputs from "../SizeInputs";

interface BasicJobInfoProps {
  jobType: string;
  onJobTypeChange: (value: string) => void;
  paperType: string;
  onPaperTypeChange: (value: string) => void;
  paperGrammage: string;
  onPaperGrammageChange: (value: string) => void;
  supplier: string;
  onSupplierChange: (value: string) => void;
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onUnitChange: (unit: "cm" | "inch") => void;
  colors: string;
  onColorsChange: (value: string) => void;
  baseColors?: string;
  onBaseColorsChange?: (value: string) => void;
}

const BasicJobInfo: React.FC<BasicJobInfoProps> = ({
  jobType,
  onJobTypeChange,
  paperType,
  onPaperTypeChange,
  paperGrammage,
  onPaperGrammageChange,
  supplier,
  onSupplierChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  onUnitChange,
  colors,
  onColorsChange,
  baseColors = "0",
  onBaseColorsChange
}) => {
  const handleColorsChange = (value: string) => {
    onColorsChange(value);
    // Reset base colors if it exceeds total colors
    if (onBaseColorsChange && parseInt(baseColors) > parseInt(value)) {
      onBaseColorsChange("0");
    }
  };

  const handleBaseColorsChange = (value: string) => {
    if (onBaseColorsChange) {
      // Ensure base colors doesn't exceed total colors
      const maxBaseColors = parseInt(colors) || 0;
      const newBaseColors = Math.min(parseInt(value) || 0, maxBaseColors);
      onBaseColorsChange(newBaseColors.toString());
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jobType">ประเภทงาน</Label>
        <Input
          id="jobType"
          placeholder="เช่น นามบัตร, โบรชัวร์"
          value={jobType}
          onChange={(e) => onJobTypeChange(e.target.value)}
        />
      </div>

      <PaperTypeDropdown
        value={paperType}
        onChange={onPaperTypeChange}
      />

      <PaperGrammageDropdown
        paperType={paperType}
        value={paperGrammage}
        onChange={onPaperGrammageChange}
      />

      <SupplierDropdown
        value={supplier}
        onChange={onSupplierChange}
        paperType={paperType}
      />

      <SizeInputs
        width={width}
        height={height}
        onWidthChange={onWidthChange}
        onHeightChange={onHeightChange}
        onUnitChange={onUnitChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="colors">จำนวนสีทั้งหมด</Label>
          <Select value={colors} onValueChange={handleColorsChange}>
            <SelectTrigger id="colors">
              <SelectValue placeholder="เลือกจำนวนสี" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 สี</SelectItem>
              <SelectItem value="2">2 สี</SelectItem>
              <SelectItem value="3">3 สี</SelectItem>
              <SelectItem value="4">4 สี</SelectItem>
              <SelectItem value="5">5 สี</SelectItem>
              <SelectItem value="6">6 สี</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onBaseColorsChange && (
          <div>
            <Label htmlFor="baseColors">จำนวนสีตีพื้น</Label>
            <Select value={baseColors} onValueChange={handleBaseColorsChange}>
              <SelectTrigger id="baseColors">
                <SelectValue placeholder="เลือกจำนวนสีตีพื้น" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: parseInt(colors) + 1 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} สี
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicJobInfo;
