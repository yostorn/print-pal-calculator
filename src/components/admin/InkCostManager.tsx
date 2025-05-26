
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InkCost {
  id: string;
  plate_type: string;
  ink_category: string;
  cost_per_sheet: number;
  minimum_cost: number;
  created_at: string;
  updated_at: string;
}

const InkCostManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InkCost | null>(null);
  const [formData, setFormData] = useState({
    plate_type: "",
    ink_category: "",
    cost_per_sheet: "",
    minimum_cost: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ink costs
  const { data: inkCosts, isLoading } = useQuery({
    queryKey: ['inkCosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ink_costs')
        .select('*')
        .order('plate_type, ink_category');
      
      if (error) throw error;
      return data as InkCost[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<InkCost, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ink_costs')
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inkCosts'] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มค่าหมึกใหม่เรียบร้อยแล้ว"
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถเพิ่มค่าหมึกได้: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<InkCost> & { id: string }) => {
      const { data, error } = await supabase
        .from('ink_costs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inkCosts'] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทค่าหมึกเรียบร้อยแล้ว"
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถอัพเดทค่าหมึกได้: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ink_costs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inkCosts'] });
      toast({
        title: "สำเร็จ",
        description: "ลบค่าหมึกเรียบร้อยแล้ว"
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถลบค่าหมึกได้: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      plate_type: "",
      ink_category: "",
      cost_per_sheet: "",
      minimum_cost: ""
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: InkCost) => {
    setEditingItem(item);
    setFormData({
      plate_type: item.plate_type,
      ink_category: item.ink_category,
      cost_per_sheet: item.cost_per_sheet.toString(),
      minimum_cost: item.minimum_cost.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plate_type || !formData.ink_category || !formData.cost_per_sheet || !formData.minimum_cost) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      plate_type: formData.plate_type,
      ink_category: formData.ink_category,
      cost_per_sheet: parseFloat(formData.cost_per_sheet),
      minimum_cost: parseFloat(formData.minimum_cost)
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>จัดการค่าหมึก</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มค่าหมึก
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "แก้ไขค่าหมึก" : "เพิ่มค่าหมึกใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plate_type">ประเภทเพลท</Label>
                <Select value={formData.plate_type} onValueChange={(value) => setFormData(prev => ({ ...prev, plate_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทเพลท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ตัด 2">ตัด 2</SelectItem>
                    <SelectItem value="ตัด 4">ตัด 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ink_category">ประเภทหมึก</Label>
                <Select value={formData.ink_category} onValueChange={(value) => setFormData(prev => ({ ...prev, ink_category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทหมึก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="หมึกปกติ">หมึกปกติ</SelectItem>
                    <SelectItem value="หมึกตีพื้น">หมึกตีพื้น</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cost_per_sheet">ราคาต่อแผ่น (บาท)</Label>
                <Input
                  id="cost_per_sheet"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_sheet}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_per_sheet: e.target.value }))}
                  placeholder="ราคาต่อแผ่น"
                />
              </div>

              <div>
                <Label htmlFor="minimum_cost">ราคาขั้นต่ำ (บาท)</Label>
                <Input
                  id="minimum_cost"
                  type="number"
                  step="0.01"
                  value={formData.minimum_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_cost: e.target.value }))}
                  placeholder="ราคาขั้นต่ำ"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? "อัพเดท" : "เพิ่ม"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภทเพลท</TableHead>
              <TableHead>ประเภทหมึก</TableHead>
              <TableHead>ราคาต่อแผ่น (บาท)</TableHead>
              <TableHead>ราคาขั้นต่ำ (บาท)</TableHead>
              <TableHead>การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inkCosts?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.plate_type}</TableCell>
                <TableCell>{item.ink_category}</TableCell>
                <TableCell>{item.cost_per_sheet.toFixed(2)}</TableCell>
                <TableCell>{item.minimum_cost.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InkCostManager;
