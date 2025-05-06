
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaperGrammage {
  id: string;
  paperType: string;
  grammage: string;
  label: string;
}

const PaperGrammageManager = () => {
  const { toast } = useToast();
  const [paperTypes] = useState([
    { id: "art-card", label: "Art Card" },
    { id: "art-paper", label: "Art Paper" },
    { id: "woodfree", label: "Woodfree" },
    { id: "newsprint", label: "Newsprint" }
  ]);
  
  const [paperGrammages, setPaperGrammages] = useState<PaperGrammage[]>([
    { id: "1", paperType: "art-card", grammage: "210", label: "210 gsm" },
    { id: "2", paperType: "art-card", grammage: "230", label: "230 gsm" },
    { id: "3", paperType: "art-card", grammage: "250", label: "250 gsm" },
    { id: "4", paperType: "art-card", grammage: "300", label: "300 gsm" },
    { id: "5", paperType: "art-paper", grammage: "80", label: "80 gsm" },
    { id: "6", paperType: "art-paper", grammage: "90", label: "90 gsm" },
    { id: "7", paperType: "art-paper", grammage: "100", label: "100 gsm" },
    { id: "8", paperType: "art-paper", grammage: "120", label: "120 gsm" }
  ]);
  
  const [newPaperGrammage, setNewPaperGrammage] = useState<Omit<PaperGrammage, 'id'>>({
    paperType: "",
    grammage: "",
    label: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (!newPaperGrammage.paperType || !newPaperGrammage.grammage) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุประเภทกระดาษและแกรมกระดาษ"
      });
      return;
    }

    const gramLabel = newPaperGrammage.label || `${newPaperGrammage.grammage} gsm`;

    if (editMode) {
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
      const newId = (paperGrammages.length + 1).toString();
      setPaperGrammages([...paperGrammages, { id: newId, ...newPaperGrammage, label: gramLabel }]);
      toast({
        title: "เพิ่มแกรมกระดาษเรียบร้อย",
        description: `แกรมกระดาษ "${gramLabel}" ถูกเพิ่มแล้ว`
      });
    }
    
    setNewPaperGrammage({
      paperType: "",
      grammage: "",
      label: ""
    });
  };

  const handleEdit = (grammage: PaperGrammage) => {
    setNewPaperGrammage({
      paperType: grammage.paperType,
      grammage: grammage.grammage,
      label: grammage.label
    });
    setEditMode(true);
    setEditId(grammage.id);
  };

  const handleDelete = (id: string) => {
    setPaperGrammages(paperGrammages.filter(gram => gram.id !== id));
    toast({
      title: "ลบแกรมกระดาษเรียบร้อย",
      description: "แกรมกระดาษถูกลบออกจากระบบแล้ว"
    });
  };

  const filteredPaperGrammages = selectedPaperType 
    ? paperGrammages.filter(gram => gram.paperType === selectedPaperType)
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
              value={newPaperGrammage.paperType} 
              onValueChange={(value) => setNewPaperGrammage({...newPaperGrammage, paperType: value})}
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
            />
            
            <Input 
              placeholder="ป้ายกำกับ (ถ้าไม่ระบุจะใช้แกรม)" 
              value={newPaperGrammage.label} 
              onChange={(e) => setNewPaperGrammage({...newPaperGrammage, label: e.target.value})}
            />
            
            <Button onClick={handleAddOrUpdate}>
              {editMode ? "อัปเดต" : "เพิ่ม"}
            </Button>
          </div>

          <div className="mb-4">
            <Select value={selectedPaperType || ""} onValueChange={(value) => setSelectedPaperType(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="กรองตามประเภทกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทั้งหมด</SelectItem>
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
            {filteredPaperGrammages.map((gram) => (
              <TableRow key={gram.id}>
                <TableCell>
                  {paperTypes.find(type => type.id === gram.paperType)?.label || gram.paperType}
                </TableCell>
                <TableCell>{gram.grammage}</TableCell>
                <TableCell>{gram.label}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(gram)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(gram.id)}>
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

export default PaperGrammageManager;
