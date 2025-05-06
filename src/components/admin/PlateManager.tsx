
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlateCost {
  id: string;
  type: string;
  price: number;
  description: string;
}

const PlateManager = () => {
  const { toast } = useToast();
  const [plateCosts, setPlateCosts] = useState<PlateCost[]>([
    { id: "1", type: "ตัด 2", price: 800, description: "สำหรับกระดาษขนาดใหญ่กว่า 24×35 นิ้ว" },
    { id: "2", type: "ตัด 4", price: 500, description: "สำหรับกระดาษขนาดเล็กกว่าหรือเท่ากับ 24×35 นิ้ว" }
  ]);
  
  const [editingPlate, setEditingPlate] = useState<PlateCost | null>(null);

  const handleEdit = (plate: PlateCost) => {
    setEditingPlate({ ...plate });
  };

  const handleUpdate = () => {
    if (!editingPlate) return;
    
    setPlateCosts(plateCosts.map(plate => 
      plate.id === editingPlate.id ? { ...editingPlate } : plate
    ));
    
    setEditingPlate(null);
    
    toast({
      title: "อัปเดตเรียบร้อย",
      description: "ราคาเพลทถูกอัปเดตแล้ว"
    });
  };

  const handleCancel = () => {
    setEditingPlate(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการราคาเพลท</h2>
          <p className="text-sm text-gray-600 mb-4">
            ตั้งค่าราคาเพลทตามประเภทต่าง ๆ สำหรับการคำนวณ
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภทเพลท</TableHead>
              <TableHead>ราคา (บาท/เพลท)</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plateCosts.map((plate) => (
              <TableRow key={plate.id}>
                <TableCell>{plate.type}</TableCell>
                <TableCell>
                  {editingPlate && editingPlate.id === plate.id ? (
                    <Input 
                      type="number"
                      min="0"
                      value={editingPlate.price}
                      onChange={(e) => setEditingPlate({
                        ...editingPlate,
                        price: parseFloat(e.target.value) || 0
                      })}
                    />
                  ) : (
                    plate.price
                  )}
                </TableCell>
                <TableCell>
                  {editingPlate && editingPlate.id === plate.id ? (
                    <Input 
                      value={editingPlate.description}
                      onChange={(e) => setEditingPlate({
                        ...editingPlate,
                        description: e.target.value
                      })}
                    />
                  ) : (
                    plate.description
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingPlate && editingPlate.id === plate.id ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleUpdate}>บันทึก</Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>ยกเลิก</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => handleEdit(plate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlateManager;
