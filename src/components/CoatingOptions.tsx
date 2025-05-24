
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoatingTypes, fetchCoatingSizes } from "@/services/supabaseService";

interface CoatingOptionsProps {
  selectedCoating: string;
  selectedCoatingSize: string;
  onCoatingChange: (coating: string) => void;
  onCoatingSizeChange: (sizeId: string) => void;
}

const CoatingOptions: React.FC<CoatingOptionsProps> = ({
  selectedCoating,
  selectedCoatingSize,
  onCoatingChange,
  onCoatingSizeChange
}) => {
  // Fetch coating types from database
  const { data: coatingTypes } = useQuery({
    queryKey: ['coatingTypes'],
    queryFn: fetchCoatingTypes
  });

  // Fetch coating sizes based on selected coating type
  const { data: coatingSizes } = useQuery({
    queryKey: ['coatingSizes', selectedCoating],
    queryFn: () => fetchCoatingSizes(selectedCoating),
    enabled: !!selectedCoating && selectedCoating !== "none"
  });

  const handleCoatingChange = (value: string) => {
    onCoatingChange(value);
    // Reset coating size when coating type changes
    if (value === "none") {
      onCoatingSizeChange("");
    }
  };

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
        onValueChange={handleCoatingChange}
        className="gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="coating-none" />
          <Label htmlFor="coating-none" className="text-sm font-normal cursor-pointer">
            ไม่มีการเคลือบ
          </Label>
        </div>
        
        {coatingTypes?.map(coatingType => (
          <div key={coatingType.id} className="flex items-center space-x-2">
            <RadioGroupItem value={coatingType.id} id={`coating-${coatingType.id}`} />
            <Label htmlFor={`coating-${coatingType.id}`} className="text-sm font-normal cursor-pointer">
              {coatingType.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedCoating !== "none" && selectedCoating && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="coatingSize">ขนาดการเคลือบ</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">เลือกขนาดการเคลือบ</span>
            </div>
          </div>
          <Select value={selectedCoatingSize} onValueChange={onCoatingSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกขนาดการเคลือบ" />
            </SelectTrigger>
            <SelectContent>
              {coatingSizes?.map(size => (
                <SelectItem key={size.id} value={size.id}>
                  {size.label} - {size.cost_per_sheet} บาท/แผ่น (ขั้นต่ำ {size.minimum_cost} บาท)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CoatingOptions;
