
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  paperType: string;
  paperGrammage: string;
  name: string;
  pricePerKg: number;
}

const SupplierManager = () => {
  const { toast } = useToast();
  const [paperTypes] = useState([
    { id: "art-card", label: "Art Card" },
    { id: "art-paper", label: "Art Paper" },
    { id: "woodfree", label: "Woodfree" },
    { id: "newsprint", label: "Newsprint" }
  ]);

  const [paperGrammages, setPaperGrammages] = useState({
    "art-card": ["210", "230", "250", "300"],
    "art-paper": ["80", "90", "100", "120", "130", "150"],
    "woodfree": ["70", "80", "90", "100"],
    "newsprint": ["45", "48", "52"]
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "1", paperType: "art-card", paperGrammage: "210", name: "Supplier A", pricePerKg: 85 },
    { id: "2", paperType: "art-card", paperGrammage: "210", name: "Supplier B", pricePerKg: 87 },
    { id: "3", paperType: "art-card", paperGrammage: "210", name: "Supplier C", pricePerKg: 86 },
    { id: "4", paperType: "art-paper", paperGrammage: "80", name: "Supplier D", pricePerKg: 47 },
    { id: "5", paperType: "art-paper", paperGrammage: "80", name: "Supplier E", pricePerKg: 46 },
    { id: "6", paperType: "woodfree", paperGrammage: "70", name: "Supplier F", pricePerKg: 39 }
  ]);
  
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id'>>({
    paperType: "",
    paperGrammage: "",
    name: "",
    pricePerKg: 0
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState<string | null>(null);
  const [selectedPaperGrammage, setSelectedPaperGrammage] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (!newSupplier.paperType || !newSupplier.paperGrammage || !newSupplier.name || newSupplier.pricePerKg <= 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุข้อมูลซัพพลายเออร์ให้ครบถ้วน"
      });
      return;
    }

    if (editMode) {
      setSuppliers(suppliers.map(supplier => 
        supplier.id === editId ? { ...supplier, ...newSupplier } : supplier
      ));
      toast({
        title: "แก้ไขซัพพลายเออร์เรียบร้อย",
        description: `ซัพพลายเออร์ "${newSupplier.name}" ถูกอัปเดตแล้ว`
      });
      setEditMode(false);
      setEditId("");
    } else {
      const newId = (suppliers.length + 1).toString();
      setSuppliers([...suppliers, { id: newId, ...newSupplier }]);
      toast({
        title: "เพิ่มซัพพลายเออร์เรียบร้อย",
        description: `ซัพพลายเออร์ "${newSupplier.name}" ถูกเพิ่มแล้ว`
      });
    }
    
    setNewSupplier({
      paperType: "",
      paperGrammage: "",
      name: "",
      pricePerKg: 0
    });
  };

  const handleEdit = (supplier: Supplier) => {
    setNewSupplier({
      paperType: supplier.paperType,
      paperGrammage: supplier.paperGrammage,
      name: supplier.name,
      pricePerKg: supplier.pricePerKg
    });
    setEditMode(true);
    setEditId(supplier.id);
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    toast({
      title: "ลบซัพพลายเออร์เรียบร้อย",
      description: "ซัพพลายเออร์ถูกลบออกจากระบบแล้ว"
    });
  };

  // Filter suppliers based on selections
  let filteredSuppliers = suppliers;
  if (selectedPaperType) {
    filteredSuppliers = filteredSuppliers.filter(supplier => supplier.paperType === selectedPaperType);
  }
  if (selectedPaperGrammage) {
    filteredSuppliers = filteredSuppliers.filter(supplier => supplier.paperGrammage === selectedPaperGrammage);
  }

  // Get available grammages for the selected paper type
  const availableGrammages = newSupplier.paperType ? paperGrammages[newSupplier.paperType as keyof typeof paperGrammages] || [] : [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการซัพพลายเออร์และราคากระดาษ</h2>
          <p className="text-sm text-gray-600 mb-4">
            เพิ่ม แก้ไข หรือลบซัพพลายเออร์และราคากระดาษต่อกิโลกรัม
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <Select 
              value={newSupplier.paperType} 
              onValueChange={(value) => {
                setNewSupplier({...newSupplier, paperType: value, paperGrammage: ""});
              }}
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
            
            <Select 
              value={newSupplier.paperGrammage} 
              onValueChange={(value) => setNewSupplier({...newSupplier, paperGrammage: value})}
              disabled={!newSupplier.paperType}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกแกรมกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                {availableGrammages.map((gram) => (
                  <SelectItem key={gram} value={gram}>{gram} gsm</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="ชื่อซัพพลายเออร์" 
              value={newSupplier.name} 
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
            />
            
            <Input 
              placeholder="ราคา/กก." 
              type="number"
              min="0"
              step="0.01"
              value={newSupplier.pricePerKg || ""} 
              onChange={(e) => setNewSupplier({
                ...newSupplier, 
                pricePerKg: parseFloat(e.target.value) || 0
              })}
            />
            
            <Button onClick={handleAddOrUpdate}>
              {editMode ? "อัปเดต" : "เพิ่ม"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <Select value={selectedPaperType || "all"} onValueChange={(value) => {
              setSelectedPaperType(value === "all" ? null : value);
              setSelectedPaperGrammage(null);
            }}>
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

            <Select 
              value={selectedPaperGrammage || "all"}
              onValueChange={(value) => setSelectedPaperGrammage(value === "all" ? null : value)}
              disabled={!selectedPaperType}
            >
              <SelectTrigger>
                <SelectValue placeholder="กรองตามแกรม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {selectedPaperType && paperGrammages[selectedPaperType as keyof typeof paperGrammages]?.map((gram) => (
                  <SelectItem key={gram} value={gram}>{gram} gsm</SelectItem>
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
              <TableHead>ซัพพลายเออร์</TableHead>
              <TableHead>ราคา/กก. (บาท)</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  {paperTypes.find(type => type.id === supplier.paperType)?.label || supplier.paperType}
                </TableCell>
                <TableCell>{supplier.paperGrammage} gsm</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.pricePerKg}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(supplier.id)}>
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

export default SupplierManager;
