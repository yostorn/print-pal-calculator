
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";

export interface AdditionalCost {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

interface AdditionalCostsManagerProps {
  additionalCosts: AdditionalCost[];
  onCostsChange: (costs: AdditionalCost[]) => void;
  className?: string;
}

const AdditionalCostsManager: React.FC<AdditionalCostsManagerProps> = ({
  additionalCosts,
  onCostsChange,
  className
}) => {
  const [newCost, setNewCost] = useState({
    name: "",
    cost: "",
    description: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCost = () => {
    if (!newCost.name || !newCost.cost) return;

    const cost: AdditionalCost = {
      id: Date.now().toString(),
      name: newCost.name,
      cost: parseFloat(newCost.cost),
      description: newCost.description
    };

    onCostsChange([...additionalCosts, cost]);
    setNewCost({ name: "", cost: "", description: "" });
  };

  const updateCost = (id: string, updatedCost: Partial<AdditionalCost>) => {
    const updated = additionalCosts.map(cost => 
      cost.id === id ? { ...cost, ...updatedCost } : cost
    );
    onCostsChange(updated);
    setEditingId(null);
  };

  const removeCost = (id: string) => {
    onCostsChange(additionalCosts.filter(cost => cost.id !== id));
  };

  const getTotalAdditionalCosts = () => {
    return additionalCosts.reduce((total, cost) => total + cost.cost, 0);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">ค่าใช้จ่ายอื่นๆ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new cost form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="ชื่อรายการ"
            value={newCost.name}
            onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="จำนวนเงิน"
            value={newCost.cost}
            onChange={(e) => setNewCost({ ...newCost, cost: e.target.value })}
          />
          <Input
            placeholder="หมายเหตุ (ไม่บังคับ)"
            value={newCost.description}
            onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
          />
          <Button onClick={addCost} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            เพิ่ม
          </Button>
        </div>

        {/* List of additional costs */}
        {additionalCosts.length > 0 && (
          <div className="space-y-2">
            <Label className="font-medium">รายการค่าใช้จ่ายเพิ่มเติม:</Label>
            {additionalCosts.map((cost) => (
              <div key={cost.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                {editingId === cost.id ? (
                  <>
                    <Input
                      className="flex-1"
                      defaultValue={cost.name}
                      onBlur={(e) => updateCost(cost.id, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      className="w-24"
                      defaultValue={cost.cost}
                      onBlur={(e) => updateCost(cost.id, { cost: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      className="flex-1"
                      defaultValue={cost.description}
                      onBlur={(e) => updateCost(cost.id, { description: e.target.value })}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      เสร็จ
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{cost.name}</div>
                      {cost.description && (
                        <div className="text-sm text-gray-500">{cost.description}</div>
                      )}
                    </div>
                    <div className="w-24 text-right font-medium">
                      ฿{cost.cost.toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingId(cost.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeCost(cost.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            
            {/* Total */}
            <div className="flex justify-end pt-2 border-t">
              <div className="text-lg font-semibold">
                รวมค่าใช้จ่ายเพิ่มเติม: ฿{getTotalAdditionalCosts().toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {additionalCosts.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            ยังไม่มีค่าใช้จ่ายเพิ่มเติม
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalCostsManager;
