
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Download, Upload, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperTypes, fetchPaperGrammages, fetchPaperSizes, fetchSuppliers } from "@/services/supabaseService";

interface PaperVariant {
  id: string;
  paper_type_id: string;
  paper_size_id: string;
  paper_gsm_id: string;
  supplier_id: string;
  sheets_per_pack: number;
  price_per_pack: number;
  price_per_kg?: number;
  price_per_ream?: number;
  paper_type?: { label: string };
  paper_size?: { name: string; width: number; height: number };
  paper_grammage?: { grammage: string };
  supplier?: { name: string };
}

const PaperVariantManager = () => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<PaperVariant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PaperVariant>>({});
  const [filters, setFilters] = useState({
    paperType: "",
    supplier: "",
    searchName: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    paper_type_id: "",
    paper_size_id: "",
    paper_gsm_id: "",
    supplier_id: "",
    sheets_per_pack: 100,
    price_per_pack: 0,
    price_per_kg: 0
  });

  // Fetch all reference data
  const { data: paperTypes = [] } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });

  const { data: allGrammages = [] } = useQuery({
    queryKey: ['allPaperGrammages'],
    queryFn: () => fetchPaperGrammages()
  });

  const { data: allSizes = [] } = useQuery({
    queryKey: ['allPaperSizes'],
    queryFn: () => fetchPaperSizes()
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers
  });

  // Load paper variants
  const loadVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('paper_variant')
        .select(`
          *,
          paper_types:paper_type_id(label),
          paper_sizes:paper_size_id(name, width, height),
          paper_grammages:paper_gsm_id(grammage),
          suppliers:supplier_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setVariants(data || []);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast({
        title: "ไม่สามารถโหลดข้อมูลได้",
        description: "กรุณาลองอีกครั้งในภายหลัง"
      });
    }
  };

  useEffect(() => {
    loadVariants();
  }, []);

  // Filter variants based on current filters
  const filteredVariants = variants.filter(variant => {
    if (filters.paperType && variant.paper_type_id !== filters.paperType) return false;
    if (filters.supplier && variant.supplier_id !== filters.supplier) return false;
    if (filters.searchName && !variant.paper_type?.label.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
    return true;
  });

  // Handle inline editing
  const startEdit = (variant: PaperVariant) => {
    setEditingId(variant.id);
    setEditingData({
      sheets_per_pack: variant.sheets_per_pack,
      price_per_pack: variant.price_per_pack,
      price_per_kg: variant.price_per_kg
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from('paper_variant')
        .update(editingData)
        .eq('id', editingId);
      
      if (error) throw error;
      
      toast({
        title: "อัปเดตสำเร็จ",
        description: "ข้อมูลถูกบันทึกแล้ว"
      });
      
      setEditingId(null);
      setEditingData({});
      loadVariants();
    } catch (error) {
      console.error("Error updating variant:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้"
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Handle adding new variant
  const addVariant = async () => {
    try {
      // Calculate price per ream if not provided
      const grammage = allGrammages.find(g => g.id === newVariant.paper_gsm_id);
      const size = allSizes.find(s => s.id === newVariant.paper_size_id);
      
      let pricePerReem = 0;
      if (grammage && size && newVariant.price_per_kg) {
        // Calculate price per ream (500 sheets)
        pricePerReem = (newVariant.price_per_kg * parseFloat(grammage.grammage) * (size.width * size.height) / 1000000) * 500;
      }

      const { error } = await supabase
        .from('paper_variant')
        .insert({
          ...newVariant,
          price_per_ream: pricePerReem
        });
      
      if (error) throw error;
      
      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "รายการกระดาษใหม่ถูกเพิ่มแล้ว"
      });
      
      setShowAddForm(false);
      setNewVariant({
        paper_type_id: "",
        paper_size_id: "",
        paper_gsm_id: "",
        supplier_id: "",
        sheets_per_pack: 100,
        price_per_pack: 0,
        price_per_kg: 0
      });
      loadVariants();
    } catch (error: any) {
      console.error("Error adding variant:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message?.includes('unique') ? "มีข้อมูลนี้อยู่แล้วในระบบ" : "ไม่สามารถเพิ่มข้อมูลได้"
      });
    }
  };

  // Handle delete
  const deleteVariant = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการนี้หรือไม่?")) return;
    
    try {
      const { error } = await supabase
        .from('paper_variant')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "ลบสำเร็จ",
        description: "รายการถูกลบแล้ว"
      });
      
      loadVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้"
      });
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ["ประเภทกระดาษ", "ขนาด", "แกรม", "ซัพพลายเออร์", "แผ่น/ห่อ", "ราคา/ห่อ", "ราคา/กก."];
    const rows = filteredVariants.map(variant => [
      variant.paper_type?.label || "",
      variant.paper_size ? `${variant.paper_size.name} (${variant.paper_size.width}x${variant.paper_size.height})` : "",
      variant.paper_grammage?.grammage || "",
      variant.supplier?.name || "",
      variant.sheets_per_pack,
      variant.price_per_pack,
      variant.price_per_kg || ""
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paper_variants.csv";
    link.click();
    
    toast({
      title: "ส่งออกสำเร็จ",
      description: "ไฟล์ CSV ถูกดาวน์โหลดแล้ว"
    });
  };

  // Get filtered options for cascading dropdowns
  const getFilteredGrammages = (paperTypeId: string) => {
    return allGrammages.filter(g => g.paper_type_id === paperTypeId);
  };

  const getFilteredSizes = (paperTypeId: string) => {
    return allSizes.filter(s => s.paper_type_id === paperTypeId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>จัดการกระดาษ (Paper Master)</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select value={filters.paperType} onValueChange={(value) => setFilters(prev => ({ ...prev, paperType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="กรองตามประเภทกระดาษ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ทั้งหมด</SelectItem>
              {paperTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.supplier} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="กรองตามซัพพลายเออร์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ทั้งหมด</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="ค้นหาชื่อกระดาษ..."
            value={filters.searchName}
            onChange={(e) => setFilters(prev => ({ ...prev, searchName: e.target.value }))}
          />
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Select value={newVariant.paper_type_id} onValueChange={(value) => setNewVariant(prev => ({ ...prev, paper_type_id: value, paper_gsm_id: "", paper_size_id: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทกระดาษ" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newVariant.paper_gsm_id} onValueChange={(value) => setNewVariant(prev => ({ ...prev, paper_gsm_id: value }))} disabled={!newVariant.paper_type_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกแกรม" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredGrammages(newVariant.paper_type_id).map(gram => (
                      <SelectItem key={gram.id} value={gram.id}>{gram.grammage} gsm</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newVariant.paper_size_id} onValueChange={(value) => setNewVariant(prev => ({ ...prev, paper_size_id: value }))} disabled={!newVariant.paper_type_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกขนาด" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredSizes(newVariant.paper_type_id).map(size => (
                      <SelectItem key={size.id} value={size.id}>{size.name} ({size.width}x{size.height})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newVariant.supplier_id} onValueChange={(value) => setNewVariant(prev => ({ ...prev, supplier_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกซัพพลายเออร์" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  type="number"
                  placeholder="แผ่น/ห่อ"
                  value={newVariant.sheets_per_pack}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, sheets_per_pack: parseInt(e.target.value) || 100 }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="ราคา/ห่อ"
                  value={newVariant.price_per_pack}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, price_per_pack: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="ราคา/กก."
                  value={newVariant.price_per_kg}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, price_per_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addVariant}>เพิ่มรายการ</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>ยกเลิก</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Master Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภทกระดาษ</TableHead>
              <TableHead>ขนาด</TableHead>
              <TableHead>แกรม</TableHead>
              <TableHead>ซัพพลายเออร์</TableHead>
              <TableHead>แผ่น/ห่อ</TableHead>
              <TableHead>ราคา/ห่อ</TableHead>
              <TableHead>ราคา/กก.</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลกระดาษ
                </TableCell>
              </TableRow>
            ) : (
              filteredVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>{variant.paper_type?.label}</TableCell>
                  <TableCell>
                    {variant.paper_size ? `${variant.paper_size.name} (${variant.paper_size.width}x${variant.paper_size.height})` : ""}
                  </TableCell>
                  <TableCell>{variant.paper_grammage?.grammage} gsm</TableCell>
                  <TableCell>{variant.supplier?.name}</TableCell>
                  <TableCell>
                    {editingId === variant.id ? (
                      <Input
                        type="number"
                        value={editingData.sheets_per_pack || ""}
                        onChange={(e) => setEditingData(prev => ({ ...prev, sheets_per_pack: parseInt(e.target.value) || 0 }))}
                        className="w-20"
                      />
                    ) : (
                      variant.sheets_per_pack
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variant.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editingData.price_per_pack || ""}
                        onChange={(e) => setEditingData(prev => ({ ...prev, price_per_pack: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    ) : (
                      `฿${variant.price_per_pack.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variant.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editingData.price_per_kg || ""}
                        onChange={(e) => setEditingData(prev => ({ ...prev, price_per_kg: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    ) : (
                      variant.price_per_kg ? `฿${variant.price_per_kg.toFixed(2)}` : "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === variant.id ? (
                        <>
                          <Button variant="outline" size="icon" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="icon" onClick={() => startEdit(variant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteVariant(variant.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="text-sm text-gray-500 text-center">
          แสดง {filteredVariants.length} จาก {variants.length} รายการทั้งหมด
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperVariantManager;
