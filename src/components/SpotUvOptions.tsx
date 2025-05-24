
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSpotUvCosts } from "@/services/supabaseService";

interface SpotUvOptionsProps {
  hasSpotUv: boolean;
  selectedSpotUvSize: string;
  onSpotUvChange: (hasSpotUv: boolean) => void;
  onSpotUvSizeChange: (sizeId: string) => void;
}

const SpotUvOptions: React.FC<SpotUvOptionsProps> = ({
  hasSpotUv,
  selectedSpotUvSize,
  onSpotUvChange,
  onSpotUvSizeChange
}) => {
  // Fetch spot UV costs from database
  const { data: spotUvCosts } = useQuery({
    queryKey: ['spotUvCosts'],
    queryFn: fetchSpotUvCosts
  });

  const handleSpotUvChange = (checked: boolean) => {
    onSpotUvChange(checked);
    if (!checked) {
      onSpotUvSizeChange("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 mb-2">
        <Label>Spot UV</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">เคลือบยูวีเฉพาะจุด</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="hasSpotUv"
          checked={hasSpotUv}
          onCheckedChange={handleSpotUvChange}
        />
        <Label htmlFor="hasSpotUv">{hasSpotUv ? "มี" : "ไม่มี"}</Label>
      </div>

      {hasSpotUv && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="spotUvSize">ขนาด Spot UV</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">เลือกขนาด Spot UV</span>
            </div>
          </div>
          <Select value={selectedSpotUvSize} onValueChange={onSpotUvSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกขนาด Spot UV" />
            </SelectTrigger>
            <SelectContent>
              {spotUvCosts?.map(cost => (
                <SelectItem key={cost.id} value={cost.id}>
                  {cost.label} - {cost.cost_per_sheet} บาท/แผ่น (ขั้นต่ำ {cost.minimum_cost} บาท)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default SpotUvOptions;
