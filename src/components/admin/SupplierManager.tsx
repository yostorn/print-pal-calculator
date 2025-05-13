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

interface Supplier {
  id: string;
  paperType: string;
  paperGrammage: string;
  name: string;
  pricePerKg: number;
  paperTypeName?: string;  // Added for display purposes
  paperGrammageName?: string;  // Added for display purposes
}

interface PaperType {
  id: string;
  name: string;
  label: string;
}

interface PaperGrammage {
  id: string;
  grammage: string;
  label: string;
  paper_type_id: string;
}

const SupplierManager = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch paper types
  const { data: paperTypes = [] } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });

  // Fetch paper grammages for the selected paper type
  const { data: paperGrammages = [] } = useQuery({
    queryKey: ['paperGrammages', newSupplier.paperType],
    queryFn: () => fetchPaperGrammages(newSupplier.paperType),
    enabled: !!newSupplier.paperType
  });

  // This query gets all grammages for display purposes
  const { data: allPaperGrammages = [] } = useQuery({
    queryKey: ['allPaperGrammages'],
    queryFn: () => fetchPaperGrammages(),
  });

  // Load suppliers from Supabase
  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('paper_prices')
        .select(`
          id,
          price_per_kg,
          paper_type_id,
          paper_grammage_id,
          supplier_id,
          suppliers:supplier_id(id, name)
        `)
        .order('price_per_kg');
      
      if (error) throw error;

      if (data) {
        // Transform data to match our supplier interface
        const formattedSuppliers = await Promise.all(data.map(async (item) => {
          // Get paper type details
          const paperType = paperTypes.find(type => type.id === item.paper_type_id);
          
          // Get grammage details - use the allPaperGrammages array
          const grammage = allPaperGrammages.find(g => g.id === item.paper_grammage_id);
          
          return {
            id: item.id,
            paperType: item.paper_type_id || "",
            paperGrammage: item.paper_grammage_id || "",
            name: item.suppliers ? (item.suppliers as any).name : "",
            pricePerKg: item.price_per_kg,
            paperTypeName: paperType?.label || item.paper_type_id || "",
            paperGrammageName: grammage?.grammage ? `${grammage.grammage} gsm` : item.paper_grammage_id || ""
          };
        }));
        
        setSuppliers(formattedSuppliers);
      }
      
      setIsInitialLoading(false);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast({
        title: "ไม่สามารถโหลดข้อมูลซัพพลายเออร์ได้",
        description: "กรุณาลองอีกครั้งในภายหลัง"
      });
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [paperTypes, allPaperGrammages]);

  const handleAddOrUpdate = async () => {
    if (!newSupplier.paperType || !newSupplier.paperGrammage || !newSupplier.name || newSupplier.pricePerKg <= 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุข้อมู���ซัพพลายเออร์ให้ครบถ้วน"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if supplier exists or create a new one
      let supplierId = "";
      const { data: existingSuppliers, error: supplierError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('name', newSupplier.name)
        .limit(1);

      if (supplierError) throw supplierError;

      if (existingSuppliers && existingSuppliers.length > 0) {
        supplierId = existingSuppliers[0].id;
      } else {
        // Create new supplier
        const { data: newSupplierData, error: newSupplierError } = await supabase
          .from('suppliers')
          .insert({ name: newSupplier.name })
          .select('id')
          .single();

        if (newSupplierError) throw newSupplierError;
        supplierId = newSupplierData.id;
      }

      if (editMode) {
        // Update existing price
        const { error: updateError } = await supabase
          .from('paper_prices')
          .update({ 
            paper_type_id: newSupplier.paperType,
            paper_grammage_id: newSupplier.paperGrammage,
            supplier_id: supplierId,
            price_per_kg: newSupplier.pricePerKg
          })
          .eq('id', editId);

        if (updateError) throw updateError;
        
        // Update local state
        setSuppliers(suppliers.map(supplier => 
          supplier.id === editId ? { 
            ...supplier, 
            paperType: newSupplier.paperType,
            paperGrammage: newSupplier.paperGrammage,
            name: newSupplier.name,
            pricePerKg: newSupplier.pricePerKg 
          } : supplier
        ));
        
        toast({
          title: "แก้ไขข้อมูลราคากระดาษเรียบร้อย",
          description: `ราคากระดาษของ "${newSupplier.name}" ถูกอัปเดตแล้ว`
        });
        
        setEditMode(false);
        setEditId("");
      } else {
        // Check if this combination already exists
        const { data: existingPrices, error: checkError } = await supabase
          .from('paper_prices')
          .select('id')
          .eq('paper_type_id', newSupplier.paperType)
          .eq('paper_grammage_id', newSupplier.paperGrammage)
          .eq('supplier_id', supplierId)
          .limit(1);
          
        if (checkError) throw checkError;
        
        if (existingPrices && existingPrices.length > 0) {
          toast({
            title: "ข้อมูลซ้ำ",
            description: "มีข้อมูลราคากระดาษนี้อยู่แล้ว กรุณาแก้ไขข้อมูลที่มีอยู่แทน"
          });
          setLoading(false);
          return;
        }
        
        // Add new price
        const { data: newPrice, error: insertError } = await supabase
          .from('paper_prices')
          .insert({
            paper_type_id: newSupplier.paperType,
            paper_grammage_id: newSupplier.paperGrammage,
            supplier_id: supplierId,
            price_per_kg: newSupplier.pricePerKg
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Add to local state
        const newSupplierEntry: Supplier = {
          id: newPrice.id,
          paperType: newPrice.paper_type_id || "",
          paperGrammage: newPrice.paper_grammage_id || "",
          name: newSupplier.name,
          pricePerKg: newPrice.price_per_kg
        };
        
        setSuppliers([...suppliers, newSupplierEntry]);
        
        toast({
          title: "เพิ่มข้อมูลราคากระดาษเรียบร้อย",
          description: `ราคากระดาษของ "${newSupplier.name}" ถูกเพิ่มแล้ว`
        });
      }
    } catch (error: any) {
      console.error("Error saving supplier data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
      setNewSupplier({
        paperType: "",
        paperGrammage: "",
        name: "",
        pricePerKg: 0
      });
    }
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

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('paper_prices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
      
      toast({
        title: "ลบข้อมูลราคากระดาษเรียบร้อย",
        description: "ข้อมูลราคากระดาษถูกลบออกจากระบบแล้ว"
      });
    } catch (error: any) {
      console.error("Error deleting supplier data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
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
  const availableGrammages = paperGrammages.filter(
    grammage => grammage.paper_type_id === newSupplier.paperType
  );

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
                  <SelectItem key={gram.id} value={gram.id}>{gram.grammage} gsm</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="ชื่อซัพพลายเออร์" 
              value={newSupplier.name} 
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
              disabled={loading}
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
              disabled={loading}
            />
            
            <Button onClick={handleAddOrUpdate} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> กำลังบันทึก...</>
              ) : (
                <>{editMode ? "อัปเดต" : "เพิ่ม"}</>
              )}
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
                {selectedPaperType && paperGrammages
                  .filter(gram => gram.paper_type_id === selectedPaperType)
                  .map((gram) => (
                    <SelectItem key={gram.id} value={gram.id}>{gram.grammage} gsm</SelectItem>
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
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  ยังไม่มีข้อมูลราคากระดาษ
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => {
                return (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.paperTypeName}</TableCell>
                    <TableCell>{supplier.paperGrammageName}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.pricePerKg}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(supplier)} disabled={loading}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(supplier.id)} disabled={loading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SupplierManager;
