
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaperType {
  id: string;
  name: string;
  label: string;
}

const PaperTypeManager = () => {
  const { toast } = useToast();
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([
    { id: "art-card", name: "art-card", label: "Art Card" },
    { id: "art-paper", name: "art-paper", label: "Art Paper" },
    { id: "woodfree", name: "woodfree", label: "Woodfree" },
    { id: "newsprint", name: "newsprint", label: "Newsprint" }
  ]);
  
  const [newPaperType, setNewPaperType] = useState({ name: "", label: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const handleAddOrUpdate = () => {
    if (!newPaperType.name || !newPaperType.label) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุทั้งชื่อและป้ายกำกับ"
      });
      return;
    }

    if (editMode) {
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
      const newId = newPaperType.name.toLowerCase().replace(/\s+/g, '-');
      setPaperTypes([...paperTypes, { id: newId, name: newPaperType.name, label: newPaperType.label }]);
      toast({
        title: "เพิ่มประเภทกระดาษเรียบร้อย",
        description: `ประเภทกระดาษ "${newPaperType.label}" ถูกเพิ่มแล้ว`
      });
    }
    setNewPaperType({ name: "", label: "" });
  };

  const handleEdit = (type: PaperType) => {
    setNewPaperType({ name: type.name, label: type.label });
    setEditMode(true);
    setEditId(type.id);
  };

  const handleDelete = (id: string) => {
    setPaperTypes(paperTypes.filter(type => type.id !== id));
    toast({
      title: "ลบประเภทกระดาษเรียบร้อย",
      description: "ประเภทกระดาษถูกลบออกจากระบบแล้ว"
    });
  };

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
            />
            <Input 
              placeholder="ป้ายกำกับ (สำหรับแสดงผล)" 
              value={newPaperType.label} 
              onChange={(e) => setNewPaperType({...newPaperType, label: e.target.value})}
            />
            <Button onClick={handleAddOrUpdate}>
              <Plus className="h-4 w-4 mr-2" />
              {editMode ? "อัปเดต" : "เพิ่ม"}
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
            {paperTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.label}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(type.id)}>
                      <Trash2 className="h-4 w-4" />
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

export default PaperTypeManager;
