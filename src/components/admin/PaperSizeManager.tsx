
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaperSize {
  id: string;
  paperType: string;
  width: number;
  height: number;
  name: string;
}

const PaperSizeManager = () => {
  const { toast } = useToast();
  const [paperTypes] = useState([
    { id: "art-card", label: "Art Card" },
    { id: "art-paper", label: "Art Paper" },
    { id: "woodfree", label: "Woodfree" },
    { id: "newsprint", label: "Newsprint" }
  ]);
  
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>([
    { id: "1", paperType: "art-card", width: 31, height: 43, name: "31×43 นิ้ว" },
    { id: "2", paperType: "art-card", width: 24, height: 35, name: "24×35 นิ้ว" },
    { id: "3", paperType: "art-paper", width: 31, height: 43, name: "31×43 นิ้ว" },
    { id: "4", paperType: "art-paper", width: 24, height: 35, name: "24×35 นิ้ว" },
    { id: "5", paperType: "woodfree", width: 31, height: 43, name: "31×43 นิ้ว" },
    { id: "6", paperType: "woodfree", width: 24, height: 35, name: "24×35 นิ้ว" },
    { id: "7", paperType: "newsprint", width: 31, height: 43, name: "31×43 นิ้ว" },
    { id: "8", paperType: "newsprint", width: 24, height: 35, name: "24×35 นิ้ว" }
  ]);
  
  const [newPaperSize, setNewPaperSize] = useState<Omit<PaperSize, 'id'>>({
    paperType: "",
    width: 0,
    height: 0,
    name: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (!newPaperSize.paperType || newPaperSize.width <= 0 || newPaperSize.height <= 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุประเภทกระดาษและขนาดที่ถูกต้อง"
      });
      return;
    }

    const sizeName = newPaperSize.name || `${newPaperSize.width}×${newPaperSize.height} นิ้ว`;

    if (editMode) {
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
      const newId = (paperSizes.length + 1).toString();
      setPaperSizes([...paperSizes, { id: newId, ...newPaperSize, name: sizeName }]);
      toast({
        title: "เพิ่มขนาดกระดาษเรียบร้อย",
        description: `ขนาดกระดาษ "${sizeName}" ถูกเพิ่มแล้ว`
      });
    }
    
    setNewPaperSize({
      paperType: "",
      width: 0,
      height: 0,
      name: ""
    });
  };

  const handleEdit = (size: PaperSize) => {
    setNewPaperSize({
      paperType: size.paperType,
      width: size.width,
      height: size.height,
      name: size.name
    });
    setEditMode(true);
    setEditId(size.id);
  };

  const handleDelete = (id: string) => {
    setPaperSizes(paperSizes.filter(size => size.id !== id));
    toast({
      title: "ลบขนาดกระดาษเรียบร้อย",
      description: "ขนาดกระดาษถูกลบออกจากระบบแล้ว"
    });
  };

  const filteredPaperSizes = selectedPaperType 
    ? paperSizes.filter(size => size.paperType === selectedPaperType)
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
              value={newPaperSize.paperType} 
              onValueChange={(value) => setNewPaperSize({...newPaperSize, paperType: value})}
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
            />
            
            <Input 
              placeholder="ชื่อขนาด (ถ้าไม่ระบุจะใช้ขนาด)" 
              value={newPaperSize.name} 
              onChange={(e) => setNewPaperSize({...newPaperSize, name: e.target.value})}
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
              <TableHead>ขนาด (นิ้ว)</TableHead>
              <TableHead>ชื่อขนาด</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPaperSizes.map((size) => (
              <TableRow key={size.id}>
                <TableCell>
                  {paperTypes.find(type => type.id === size.paperType)?.label || size.paperType}
                </TableCell>
                <TableCell>{size.width} × {size.height}</TableCell>
                <TableCell>{size.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(size)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(size.id)}>
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

export default PaperSizeManager;
