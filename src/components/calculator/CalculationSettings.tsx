
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface CalculationSettingsProps {
  wastage: string;
  onWastageChange: (value: string) => void;
  profitMargin: string;
  onProfitMarginChange: (value: string) => void;
}

const CalculationSettings: React.FC<CalculationSettingsProps> = ({
  wastage,
  onWastageChange,
  profitMargin,
  onProfitMarginChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="wastage">ค่าเผื่อเสีย (แผ่น)</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">จำนวนแผ่นที่เผื่อไว้สำหรับกระดาษเสียระหว่างการผลิต</span>
          </div>
        </div>
        <Input
          id="wastage"
          type="number"
          min="0"
          value={wastage}
          onChange={(e) => onWastageChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="profitMargin">กำไร (%)</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">ระบุเปอร์เซ็นต์กำไรที่ต้องการ</span>
          </div>
        </div>
        <Input
          id="profitMargin"
          type="number"
          min="0"
          max="100"
          value={profitMargin}
          onChange={(e) => onProfitMarginChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default CalculationSettings;
