
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

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
  return (
    <div className="space-y-3">
      {quantities.map((qty, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder={`จำนวนที่ ${index + 1}`}
            type="number"
            min="1"
            value={qty}
            onChange={(e) => onUpdateQuantity(index, e.target.value)}
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
