
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
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
  onUnitChange: (value: "cm" | "inch") => void;
  colors: string;
  onColorsChange: (value: string) => void;
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
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="jobType">ประเภทงาน</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุประเภทของงานพิมพ์</span>
          </div>
        </div>
        <Input
          id="jobType"
          placeholder="ระบุประเภทงาน"
          value={jobType}
          onChange={(e) => onJobTypeChange(e.target.value)}
        />
      </div>

      <PaperTypeDropdown value={paperType} onChange={onPaperTypeChange} />

      <PaperGrammageDropdown
        value={paperGrammage}
        onChange={onPaperGrammageChange}
        paperType={paperType}
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

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="colors">จำนวนสีพิมพ์</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุจำนวนสีที่ใช้ในการพิมพ์</span>
          </div>
        </div>
        <Input
          id="colors"
          type="number"
          min="1"
          value={colors}
          onChange={(e) => onColorsChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default BasicJobInfo;
