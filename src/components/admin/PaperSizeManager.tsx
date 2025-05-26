
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperTypes, fetchPaperSizes } from "@/services/supabaseService";

interface PaperSize {
  id: string;
  paper_type_id: string;
  width: number;
  height: number;
  name: string;
}

const PaperSizeManager = () => {
  const { toast } = useToast();
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>([]);
  const [newPaperSize, setNewPaperSize] = useState<Omit<PaperSize, 'id'>>({
    paper_type_id: "",
    width: 0,
    height: 0,
    name: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch paper types from database
  const { data: paperTypes = [] } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });

  // Load paper sizes from database
  const loadPaperSizes = async () => {
    try {
      const data = await fetchPaperSizes();
      setPaperSizes(data);
    } catch (error) {
      console.error("Error loading paper sizes:", error);
      toast({
        title: "ไม่สามารถโหลดข้อมูลขนาดกระดาษได้",
        description: "กรุณาลองอีกครั้งในภายหลัง"
      });
    }
  };

  useEffect(() => {
    loadPaperSizes();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!newPaperSize.paper_type_id || newPaperSize.width <= 0 || newPaperSize.height <= 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุประเภทกระดาษและขนาดที่ถูกต้อง"
      });
      return;
    }

    const sizeName = newPaperSize.name || `${newPaperSize.width}×${newPaperSize.height} นิ้ว`;
    setLoading(true);

    try {
      if (editMode) {
        // Update existing paper size
        const { error } = await supabase
          .from('paper_sizes')
          .update({
            paper_type_id: newPaperSize.paper_type_id,
            width: newPaperSize.width,
            height: newPaperSize.height,
            name: sizeName
          })
          .eq('id', editId);

        if (error) throw error;

        setPaperSizes(paperSizes.map(size => 
          size.id === editId ? { ...size, ...newPaperSize, name: sizeName } : size
        ));
        
        toast({
          title: "แก้ไขขนาดกระดาษเรียบร้อย",
          description: `ขนาดกระดาษ "${sizeName}" ถูกอัปเดตแล้ว`
        });
        
        setEditMode(false);
        setEditId("");
      } else {
        // Add new paper size
        const { data, error } = await supabase
          .from('paper_sizes')
          .insert({
            paper_type_id: newPaperSize.paper_type_id,
            width: newPaperSize.width,
            height: newPaperSize.height,
            name: sizeName
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setPaperSizes([...paperSizes, data[0] as PaperSize]);
          
          toast({
            title: "เพิ่มขนาดกระดาษเรียบร้อย",
            description: `ขนาดกระดาษ "${sizeName}" ถูกเพิ่มแล้ว`
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving paper size:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
      setNewPaperSize({
        paper_type_id: "",
        width: 0,
        height: 0,
        name: ""
      });
    }
  };

  const handleEdit = (size: PaperSize) => {
    setNewPaperSize({
      paper_type_id: size.paper_type_id,
      width: size.width,
      height: size.height,
      name: size.name
    });
    setEditMode(true);
    setEditId(size.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบขนาดกระดาษนี้หรือไม่?")) return;
    
    try {
      setLoading(true);
      
      // Check if this size is referenced by paper variants
      const { data: paperVariants, error: paperVariantsError } = await supabase
        .from('paper_variant')
        .select('id')
        .eq('paper_size_id', id)
        .limit(1);
        
      if (paperVariantsError) throw paperVariantsError;
      
      if (paperVariants && paperVariants.length > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: "ขนาดกระดาษนี้กำลังถูกใช้งานโดยข้อมูลกระดาษ"
        });
        setLoading(false);
        return;
      }
      
      // Delete the paper size
      const { error } = await supabase
        .from('paper_sizes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaperSizes(paperSizes.filter(size => size.id !== id));
      
      toast({
        title: "ลบขนาดกระดาษเรียบร้อย",
        description: "ขนาดกระดาษถูกลบออกจากระบบแล้ว"
      });
    } catch (error: any) {
      console.error("Error deleting paper size:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPaperSizes = selectedPaperType 
    ? paperSizes.filter(size => size.paper_type_id === selectedPaperType)
    : paperSizes;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการขนาดกระดาษ</h2>
          <p className="text-sm text-gray-600 mb-4">
            เพิ่ม แก้ไข หรือลบขนาดกระดาษสำหรับแต่ละประเภทกระดาษ
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <Select 
              value={newPaperSize.paper_type_id} 
              onValueChange={(value) => setNewPaperSize({...newPaperSize, paper_type_id: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                {paperTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="กว้าง (นิ้ว)" 
              type="number"
              min="0"
              step="0.1"
              value={newPaperSize.width || ""}
              onChange={(e) => setNewPaperSize({
                ...newPaperSize, 
                width: parseFloat(e.target.value) || 0
              })}
              disabled={loading}
            />
            
            <Input 
              placeholder="ยาว (นิ้ว)" 
              type="number"
              min="0"
              step="0.1"
              value={newPaperSize.height || ""}
              onChange={(e) => setNewPaperSize({
                ...newPaperSize, 
                height: parseFloat(e.target.value) || 0
              })}
              disabled={loading}
            />
            
            <Input 
              placeholder="ชื่อขนาด (ถ้าไม่ระบุจะใช้ขนาด)" 
              value={newPaperSize.name} 
              onChange={(e) => setNewPaperSize({...newPaperSize, name: e.target.value})}
              disabled={loading}
            />
            
            <Button onClick={handleAddOrUpdate} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> กำลังบันทึก...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> {editMode ? "อัปเดต" : "เพิ่ม"}</>
              )}
            </Button>
          </div>

          <div className="mb-4">
            <Select value={selectedPaperType || "all"} onValueChange={(value) => setSelectedPaperType(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="กรองตามประเภทกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {paperTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภทกระดาษ</TableHead>
              <TableHead>ขนาด (นิ้ว)</TableHead>
              <TableHead>ชื่อขนาด</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPaperSizes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  ยังไม่มีข้อมูลขนาดกระดาษ
                </TableCell>
              </TableRow>
            ) : (
              filteredPaperSizes.map((size) => (
                <TableRow key={size.id}>
                  <TableCell>
                    {paperTypes.find(type => type.id === size.paper_type_id)?.label || size.paper_type_id}
                  </TableCell>
                  <TableCell>{size.width} × {size.height}</TableCell>
                  <TableCell>{size.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEdit(size)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(size.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaperSizeManager;
