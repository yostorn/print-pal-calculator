
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface QuantityInputsProps {
  quantities: string[];
  onAddQuantity: () => void;
  onRemoveQuantity: (index: number) => void;
  onUpdateQuantity: (index: number, value: string) => void;
}

const QuantityInputs: React.FC<QuantityInputsProps> = ({
  quantities,
  onAddQuantity,
  onRemoveQuantity,
  onUpdateQuantity,
}) => {
  // Ensure valid quantity inputs
  const handleQuantityChange = (index: number, value: string) => {
    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');
    onUpdateQuantity(index, cleanValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">ระบุจำนวนที่ต้องการพิมพ์</Label>
      {quantities.map((qty, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder={`จำนวนที่ ${index + 1}`}
            type="number"
            min="1"
            value={qty}
            onChange={(e) => handleQuantityChange(index, e.target.value)}
            className={!qty ? "border-yellow-400 focus:ring-yellow-500" : ""}
          />
          {quantities.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onRemoveQuantity(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          {index === quantities.length - 1 && quantities.length < 3 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuantityInputs;
