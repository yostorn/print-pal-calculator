import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchPaperTypes } from "@/services/supabaseService";

interface PaperType {
  id: string;
  name: string;
  label: string;
}

const PaperTypeManager = () => {
  const { toast } = useToast();
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [newPaperType, setNewPaperType] = useState({ name: "", label: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch paper types from Supabase
  const loadPaperTypes = async () => {
    try {
      const data = await fetchPaperTypes();
      setPaperTypes(data);
      setIsInitialLoading(false);
    } catch (error) {
      console.error("Error loading paper types:", error);
      toast({
        title: "ไม่สามารถโหลดประเภทกระดาษได้",
        description: "กรุณาลองอีกครั้งในภายหลัง"
      });
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadPaperTypes();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!newPaperType.name || !newPaperType.label) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุทั้งชื่อและป้ายกำกับ"
      });
      return;
    }

    setLoading(true);

    try {
      if (editMode) {
        // Update existing paper type
        const { error } = await supabase
          .from('paper_types')
          .update({ name: newPaperType.name, label: newPaperType.label })
          .eq('id', editId);

        if (error) throw error;

        setPaperTypes(paperTypes.map(type => 
          type.id === editId ? { ...type, name: newPaperType.name, label: newPaperType.label } : type
        ));
        
        toast({
          title: "แก้ไขประเภทกระดาษเรียบร้อย",
          description: `ประเภทกระดาษ "${newPaperType.label}" ถูกอัปเดตแล้ว`
        });
        
        setEditMode(false);
        setEditId("");
      } else {
        // Instead of creating a custom ID, let Supabase generate a UUID
        // and just provide the name and label fields
        const { data, error } = await supabase
          .from('paper_types')
          .insert({ name: newPaperType.name, label: newPaperType.label })
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPaperTypes([...paperTypes, data[0] as PaperType]);
          
          toast({
            title: "เพิ่มประเภทกระดาษเรียบร้อย",
            description: `ประเภทกระดาษ "${newPaperType.label}" ถูกเพิ่มแล้ว`
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving paper type:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
      setNewPaperType({ name: "", label: "" });
    }
  };

  const handleEdit = (type: PaperType) => {
    setNewPaperType({ name: type.name, label: type.label });
    setEditMode(true);
    setEditId(type.id);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Check if this paper type is referenced by other tables
      const { data: paperSizes, error: paperSizesError } = await supabase
        .from('paper_sizes')
        .select('id')
        .eq('paper_type_id', id)
        .limit(1);
        
      if (paperSizesError) throw paperSizesError;
      
      if (paperSizes && paperSizes.length > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: "ประเภทกระดาษนี้กำลังถูกใช้งานโดยข้อมูลขนาดกระดาษ"
        });
        setLoading(false);
        return;
      }
      
      const { data: paperGrammages, error: paperGrammagesError } = await supabase
        .from('paper_grammages')
        .select('id')
        .eq('paper_type_id', id)
        .limit(1);
        
      if (paperGrammagesError) throw paperGrammagesError;
      
      if (paperGrammages && paperGrammages.length > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: "ประเภทกระดาษนี้กำลังถูกใช้งานโดยข้อมูลแกรมกระดาษ"
        });
        setLoading(false);
        return;
      }
      
      // Delete the paper type
      const { error } = await supabase
        .from('paper_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaperTypes(paperTypes.filter(type => type.id !== id));
      
      toast({
        title: "ลบประเภทกระดาษเรียบร้อย",
        description: "ประเภทกระดาษถูกลบออกจากระบบแล้ว"
      });
    } catch (error: any) {
      console.error("Error deleting paper type:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการประเภทกระดาษ</h2>
          <p className="text-sm text-gray-600 mb-4">
            เพิ่ม แก้ไข หรือลบประเภทกระดาษที่ใช้ในระบบ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="ชื่อ (ภาษาอังกฤษ)" 
              value={newPaperType.name} 
              onChange={(e) => setNewPaperType({...newPaperType, name: e.target.value})}
              disabled={loading}
            />
            <Input 
              placeholder="ป้ายกำกับ (สำหรับแสดงผล)" 
              value={newPaperType.label} 
              onChange={(e) => setNewPaperType({...newPaperType, label: e.target.value})}
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
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ป้ายกำกับ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paperTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  ยังไม่มีข้อมูลประเภทกระดาษ
                </TableCell>
              </TableRow>
            ) : (
              paperTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.id}</TableCell>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEdit(type)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(type.id)}
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

export default PaperTypeManager;
