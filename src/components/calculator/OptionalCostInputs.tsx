
import React from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface OptionalCostInputsProps {
  hasDieCut: boolean;
  onDieCutChange: (value: boolean) => void;
  dieCutCost: string;
  onDieCutCostChange: (value: string) => void;
  hasBasePrint: boolean;
  onBasePrintChange: (value: boolean) => void;
  basePrintCost: string;
  onBasePrintCostChange: (value: string) => void;
  shippingCost: string;
  onShippingCostChange: (value: string) => void;
  packagingCost: string;
  onPackagingCostChange: (value: string) => void;
}

const OptionalCostInputs: React.FC<OptionalCostInputsProps> = ({
  hasDieCut,
  onDieCutChange,
  dieCutCost,
  onDieCutCostChange,
  hasBasePrint,
  onBasePrintChange,
  basePrintCost,
  onBasePrintCostChange,
  shippingCost,
  onShippingCostChange,
  packagingCost,
  onPackagingCostChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="hasDieCut">มีไดคัทหรือไม่</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">เลือกหากต้องการไดคัท</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="hasDieCut"
            checked={hasDieCut}
            onCheckedChange={onDieCutChange}
          />
          <Label htmlFor="hasDieCut">{hasDieCut ? "มี" : "ไม่มี"}</Label>
        </div>
      </div>

      {hasDieCut && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="dieCutCost">ค่าไดคัท (บาท)</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">ระบุค่าไดคัท</span>
            </div>
          </div>
          <Input
            id="dieCutCost"
            type="number"
            min="0"
            value={dieCutCost}
            onChange={(e) => onDieCutCostChange(e.target.value)}
          />
        </div>
      )}

      {/* New base print option */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="hasBasePrint">มีตีพื้นหรือไม่</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">เลือกหากต้องการตีพื้น</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="hasBasePrint"
            checked={hasBasePrint}
            onCheckedChange={onBasePrintChange}
          />
          <Label htmlFor="hasBasePrint">{hasBasePrint ? "มี" : "ไม่มี"}</Label>
        </div>
      </div>

      {hasBasePrint && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="basePrintCost">ค่าตีพื้น (บาท)</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">ระบุค่าตีพื้น</span>
            </div>
          </div>
          <Input
            id="basePrintCost"
            type="number"
            min="0"
            value={basePrintCost}
            onChange={(e) => onBasePrintCostChange(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="shippingCost">ค่าขนส่ง (บาท)</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุค่าขนส่ง</span>
          </div>
        </div>
        <Input
          id="shippingCost"
          type="number"
          min="0"
          value={shippingCost}
          onChange={(e) => onShippingCostChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="packagingCost">ค่าแพคกิ้ง (บาท)</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุค่าแพคกิ้ง</span>
          </div>
        </div>
        <Input
          id="packagingCost"
          type="number"
          min="0"
          value={packagingCost}
          onChange={(e) => onPackagingCostChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default OptionalCostInputs;
