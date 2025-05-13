
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  const handleProfitSliderChange = (values: number[]) => {
    if (values.length > 0) {
      onProfitMarginChange(values[0].toString());
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-medium">ตั้งค่าการคำนวณ</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="wastage">จำนวนเผื่อเสีย (แผ่น)</Label>
          <div className="tooltip">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="tooltiptext">จำนวนกระดาษที่เผื่อไว้สำหรับการเสียระหว่างการพิมพ์</span>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label htmlFor="profitMargin">กำไร (%)</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">เปอร์เซ็นต์กำไรสำหรับราคาขาย</span>
            </div>
          </div>
          <span className="text-sm font-medium">{profitMargin}%</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <Slider
              value={[Number(profitMargin)]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleProfitSliderChange}
            />
          </div>
          <Input
            id="profitMargin"
            type="number"
            min="0"
            max="100"
            value={profitMargin}
            onChange={(e) => onProfitMarginChange(e.target.value)}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
};

export default CalculationSettings;
