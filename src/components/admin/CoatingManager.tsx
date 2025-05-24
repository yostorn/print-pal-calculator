
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchCoatingTypes, fetchCoatingSizes, fetchSpotUvCosts } from "@/services/supabaseService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

const CoatingManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Coating Types
  const { data: coatingTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ['coatingTypes'],
    queryFn: fetchCoatingTypes
  });

  // Coating Sizes
  const { data: coatingSizes, isLoading: loadingSizes } = useQuery({
    queryKey: ['coatingSizes'],
    queryFn: () => fetchCoatingSizes()
  });

  // Spot UV Costs
  const { data: spotUvCosts, isLoading: loadingSpotUv } = useQuery({
    queryKey: ['spotUvCosts'],
    queryFn: fetchSpotUvCosts
  });

  // States for forms
  const [newCoatingSize, setNewCoatingSize] = useState({
    coating_type_id: "",
    width: "",
    height: "",
    label: "",
    cost_per_sheet: "",
    minimum_cost: ""
  });

  const [newSpotUvCost, setNewSpotUvCost] = useState({
    width: "",
    height: "",
    label: "",
    cost_per_sheet: "",
    minimum_cost: ""
  });

  // Add coating size mutation
  const addCoatingSizeMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('coating_sizes')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coatingSizes'] });
      toast({ title: "เพิ่มขนาดการเคลือบเรียบร้อย" });
      setNewCoatingSize({
        coating_type_id: "",
        width: "",
        height: "",
        label: "",
        cost_per_sheet: "",
        minimum_cost: ""
      });
    },
    onError: (error) => {
      toast({ 
        title: "เกิดข้อผิดพลาด", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Add spot UV cost mutation
  const addSpotUvCostMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('spot_uv_costs')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotUvCosts'] });
      toast({ title: "เพิ่มขนาด Spot UV เรียบร้อย" });
      setNewSpotUvCost({
        width: "",
        height: "",
        label: "",
        cost_per_sheet: "",
        minimum_cost: ""
      });
    },
    onError: (error) => {
      toast({ 
        title: "เกิดข้อผิดพลาด", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete coating size mutation
  const deleteCoatingSizeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coating_sizes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coatingSizes'] });
      toast({ title: "ลบขนาดการเคลือบเรียบร้อย" });
    }
  });

  // Delete spot UV cost mutation
  const deleteSpotUvCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('spot_uv_costs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotUvCosts'] });
      toast({ title: "ลบขนาด Spot UV เรียบร้อย" });
    }
  });

  const handleAddCoatingSize = () => {
    if (!newCoatingSize.coating_type_id || !newCoatingSize.width || !newCoatingSize.height || 
        !newCoatingSize.label || !newCoatingSize.cost_per_sheet || !newCoatingSize.minimum_cost) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    addCoatingSizeMutation.mutate({
      coating_type_id: newCoatingSize.coating_type_id,
      width: parseFloat(newCoatingSize.width),
      height: parseFloat(newCoatingSize.height),
      label: newCoatingSize.label,
      cost_per_sheet: parseFloat(newCoatingSize.cost_per_sheet),
      minimum_cost: parseFloat(newCoatingSize.minimum_cost)
    });
  };

  const handleAddSpotUvCost = () => {
    if (!newSpotUvCost.width || !newSpotUvCost.height || !newSpotUvCost.label || 
        !newSpotUvCost.cost_per_sheet || !newSpotUvCost.minimum_cost) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    addSpotUvCostMutation.mutate({
      width: parseFloat(newSpotUvCost.width),
      height: parseFloat(newSpotUvCost.height),
      label: newSpotUvCost.label,
      cost_per_sheet: parseFloat(newSpotUvCost.cost_per_sheet),
      minimum_cost: parseFloat(newSpotUvCost.minimum_cost)
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="coating-sizes" className="w-full">
        <TabsList>
          <TabsTrigger value="coating-sizes">ขนาดการเคลือบ</TabsTrigger>
          <TabsTrigger value="spot-uv-costs">ขนาด Spot UV</TabsTrigger>
        </TabsList>
        
        <TabsContent value="coating-sizes">
          <Card>
            <CardHeader>
              <CardTitle>จัดการขนาดการเคลือบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new coating size form */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded">
                <div>
                  <Label>ประเภทการเคลือบ</Label>
                  <Select 
                    value={newCoatingSize.coating_type_id} 
                    onValueChange={(value) => setNewCoatingSize({...newCoatingSize, coating_type_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {coatingTypes?.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ความกว้าง (นิ้ว)</Label>
                  <Input 
                    type="number" 
                    value={newCoatingSize.width}
                    onChange={(e) => setNewCoatingSize({...newCoatingSize, width: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ความยาว (นิ้ว)</Label>
                  <Input 
                    type="number" 
                    value={newCoatingSize.height}
                    onChange={(e) => setNewCoatingSize({...newCoatingSize, height: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ชื่อขนาด</Label>
                  <Input 
                    value={newCoatingSize.label}
                    onChange={(e) => setNewCoatingSize({...newCoatingSize, label: e.target.value})}
                    placeholder="เช่น 10×15 นิ้ว"
                  />
                </div>
                <div>
                  <Label>ราคาต่อแผ่น (บาท)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={newCoatingSize.cost_per_sheet}
                    onChange={(e) => setNewCoatingSize({...newCoatingSize, cost_per_sheet: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ราคาขั้นต่ำ (บาท)</Label>
                  <Input 
                    type="number" 
                    value={newCoatingSize.minimum_cost}
                    onChange={(e) => setNewCoatingSize({...newCoatingSize, minimum_cost: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={handleAddCoatingSize} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มขนาดการเคลือบ
                  </Button>
                </div>
              </div>

              {/* List of coating sizes */}
              <div className="space-y-2">
                {coatingSizes?.map((size) => {
                  const coatingType = coatingTypes?.find(t => t.id === size.coating_type_id);
                  return (
                    <div key={size.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <strong>{coatingType?.label}</strong> - {size.label}
                        <div className="text-sm text-gray-600">
                          {size.cost_per_sheet} บาท/แผ่น, ขั้นต่ำ {size.minimum_cost} บาท
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCoatingSizeMutation.mutate(size.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spot-uv-costs">
          <Card>
            <CardHeader>
              <CardTitle>จัดการขนาด Spot UV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new spot UV cost form */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded">
                <div>
                  <Label>ความกว้าง (นิ้ว)</Label>
                  <Input 
                    type="number" 
                    value={newSpotUvCost.width}
                    onChange={(e) => setNewSpotUvCost({...newSpotUvCost, width: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ความยาว (นิ้ว)</Label>
                  <Input 
                    type="number" 
                    value={newSpotUvCost.height}
                    onChange={(e) => setNewSpotUvCost({...newSpotUvCost, height: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ชื่อขนาด</Label>
                  <Input 
                    value={newSpotUvCost.label}
                    onChange={(e) => setNewSpotUvCost({...newSpotUvCost, label: e.target.value})}
                    placeholder="เช่น 10×15 นิ้ว"
                  />
                </div>
                <div>
                  <Label>ราคาต่อแผ่น (บาท)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={newSpotUvCost.cost_per_sheet}
                    onChange={(e) => setNewSpotUvCost({...newSpotUvCost, cost_per_sheet: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ราคาขั้นต่ำ (บาท)</Label>
                  <Input 
                    type="number" 
                    value={newSpotUvCost.minimum_cost}
                    onChange={(e) => setNewSpotUvCost({...newSpotUvCost, minimum_cost: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={handleAddSpotUvCost} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มขนาด Spot UV
                  </Button>
                </div>
              </div>

              {/* List of spot UV costs */}
              <div className="space-y-2">
                {spotUvCosts?.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <strong>Spot UV</strong> - {cost.label}
                      <div className="text-sm text-gray-600">
                        {cost.cost_per_sheet} บาท/แผ่น, ขั้นต่ำ {cost.minimum_cost} บาท
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSpotUvCostMutation.mutate(cost.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoatingManager;
