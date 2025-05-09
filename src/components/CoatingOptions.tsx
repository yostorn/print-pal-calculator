
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CoatingOption {
  id: string;
  name: string;
  description?: string;
}

interface CoatingOptionsProps {
  selectedCoating: string;
  coatingCost: string;
  onCoatingChange: (coating: string) => void;
  onCoatingCostChange: (cost: string) => void;
}

// Mock data - in production this would come from Supabase
const COATING_OPTIONS: CoatingOption[] = [
  { id: "none", name: "ไม่มีการเคลือบ" },
  { id: "laminate-glossy", name: "Laminate เงา", description: "เคลือบพลาสติกแบบเงาวาว" },
  { id: "laminate-matte", name: "Laminate ด้าน", description: "เคลือบพลาสติกแบบผิวด้าน" },
  { id: "uv-coating", name: "เคลือบ UV", description: "เคลือบยูวี เงาวาว" },
  { id: "spot-uv", name: "Spot UV", description: "เคลือบยูวีเฉพาะจุด" }
];

const CoatingOptions: React.FC<CoatingOptionsProps> = ({
  selectedCoating,
  coatingCost,
  onCoatingChange,
  onCoatingCostChange
}) => {
  // In a real app, you could fetch this from Supabase
  // const { data: coatingOptions } = useQuery({
  //   queryKey: ['coatingOptions'],
  //   queryFn: fetchCoatingOptions
  // });
  
  const coatingOptions = COATING_OPTIONS;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 mb-2">
        <Label>ประเภทการเคลือบ</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">เลือกประเภทการเคลือบผิวกระดาษ</span>
        </div>
      </div>

      <RadioGroup 
        value={selectedCoating} 
        onValueChange={onCoatingChange}
        className="gap-2"
      >
        {coatingOptions.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={`coating-${option.id}`} />
            <Label htmlFor={`coating-${option.id}`} className="text-sm font-normal cursor-pointer">
              {option.name}
              {option.description && (
                <span className="text-gray-500 text-xs ml-1">({option.description})</span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedCoating !== "none" && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="coatingCost">ค่าเคลือบ (บาท/แผ่น)</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">ระบุค่าเคลือบต่อหนึ่งแผ่นกระดาษ</span>
            </div>
          </div>
          <Input 
            id="coatingCost" 
            type="number" 
            min="0"
            step="0.01"
            value={coatingCost} 
            onChange={(e) => onCoatingCostChange(e.target.value)}
            placeholder="ระบุค่าเคลือบต่อแผ่น"
          />
        </div>
      )}
    </div>
  );
};

export default CoatingOptions;
