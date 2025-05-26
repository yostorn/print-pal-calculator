
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
import { fetchPaperTypes, fetchPaperGrammages } from "@/services/supabaseService";

interface PaperGrammage {
  id: string;
  paper_type_id: string;
  grammage: string;
  label: string;
}

const PaperGrammageManager = () => {
  const { toast } = useToast();
  const [paperGrammages, setPaperGrammages] = useState<PaperGrammage[]>([]);
  const [newPaperGrammage, setNewPaperGrammage] = useState<Omit<PaperGrammage, 'id'>>({
    paper_type_id: "",
    grammage: "",
    label: ""
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

  // Load paper grammages from database
  const loadPaperGrammages = async () => {
    try {
      const data = await fetchPaperGrammages();
      setPaperGrammages(data);
    } catch (error) {
      console.error("Error loading paper grammages:", error);
      toast({
        title: "ไม่สามารถโหลดข้อมูลแกรมกระดาษได้",
        description: "กรุณาลองอีกครั้งในภายหลัง"
      });
    }
  };

  useEffect(() => {
    loadPaperGrammages();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!newPaperGrammage.paper_type_id || !newPaperGrammage.grammage) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุประเภทกระดาษและแกรมกระดาษ"
      });
      return;
    }

    const gramLabel = newPaperGrammage.label || `${newPaperGrammage.grammage} gsm`;
    setLoading(true);

    try {
      if (editMode) {
        // Update existing paper grammage
        const { error } = await supabase
          .from('paper_grammages')
          .update({
            paper_type_id: newPaperGrammage.paper_type_id,
            grammage: newPaperGrammage.grammage,
            label: gramLabel
          })
          .eq('id', editId);

        if (error) throw error;

        setPaperGrammages(paperGrammages.map(gram => 
          gram.id === editId ? { ...gram, ...newPaperGrammage, label: gramLabel } : gram
        ));
        
        toast({
          title: "แก้ไขแกรมกระดาษเรียบร้อย",
          description: `แกรมกระดาษ "${gramLabel}" ถูกอัปเดตแล้ว`
        });
        
        setEditMode(false);
        setEditId("");
      } else {
        // Add new paper grammage
        const { data, error } = await supabase
          .from('paper_grammages')
          .insert({
            paper_type_id: newPaperGrammage.paper_type_id,
            grammage: newPaperGrammage.grammage,
            label: gramLabel
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setPaperGrammages([...paperGrammages, data[0] as PaperGrammage]);
          
          toast({
            title: "เพิ่มแกรมกระดาษเรียบร้อย",
            description: `แกรมกระดาษ "${gramLabel}" ถูกเพิ่มแล้ว`
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving paper grammage:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
      setNewPaperGrammage({
        paper_type_id: "",
        grammage: "",
        label: ""
      });
    }
  };

  const handleEdit = (grammage: PaperGrammage) => {
    setNewPaperGrammage({
      paper_type_id: grammage.paper_type_id,
      grammage: grammage.grammage,
      label: grammage.label
    });
    setEditMode(true);
    setEditId(grammage.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบแกรมกระดาษนี้หรือไม่?")) return;
    
    try {
      setLoading(true);
      
      // Check if this grammage is referenced by paper variants
      const { data: paperVariants, error: paperVariantsError } = await supabase
        .from('paper_variant')
        .select('id')
        .eq('paper_gsm_id', id)
        .limit(1);
        
      if (paperVariantsError) throw paperVariantsError;
      
      if (paperVariants && paperVariants.length > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: "แกรมกระดาษนี้กำลังถูกใช้งานโดยข้อมูลกระดาษ"
        });
        setLoading(false);
        return;
      }
      
      // Delete the paper grammage
      const { error } = await supabase
        .from('paper_grammages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaperGrammages(paperGrammages.filter(gram => gram.id !== id));
      
      toast({
        title: "ลบแกรมกระดาษเรียบร้อย",
        description: "แกรมกระดาษถูกลบออกจากระบบแล้ว"
      });
    } catch (error: any) {
      console.error("Error deleting paper grammage:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPaperGrammages = selectedPaperType 
    ? paperGrammages.filter(gram => gram.paper_type_id === selectedPaperType)
    : paperGrammages;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการแกรมกระดาษ</h2>
          <p className="text-sm text-gray-600 mb-4">
            เพิ่ม แก้ไข หรือลบแกรมกระดาษสำหรับแต่ละประเภท
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Select 
              value={newPaperGrammage.paper_type_id} 
              onValueChange={(value) => setNewPaperGrammage({...newPaperGrammage, paper_type_id: value})}
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
              placeholder="แกรม (gsm)" 
              value={newPaperGrammage.grammage} 
              onChange={(e) => setNewPaperGrammage({...newPaperGrammage, grammage: e.target.value})}
              disabled={loading}
            />
            
            <Input 
              placeholder="ป้ายกำกับ (ถ้าไม่ระบุจะใช้แกรม)" 
              value={newPaperGrammage.label} 
              onChange={(e) => setNewPaperGrammage({...newPaperGrammage, label: e.target.value})}
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
              <TableHead>แกรม</TableHead>
              <TableHead>ป้ายกำกับ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPaperGrammages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  ยังไม่มีข้อมูลแกรมกระดาษ
                </TableCell>
              </TableRow>
            ) : (
              filteredPaperGrammages.map((gram) => (
                <TableRow key={gram.id}>
                  <TableCell>
                    {paperTypes.find(type => type.id === gram.paper_type_id)?.label || gram.paper_type_id}
                  </TableCell>
                  <TableCell>{gram.grammage}</TableCell>
                  <TableCell>{gram.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEdit(gram)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(gram.id)}
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

export default PaperGrammageManager;
