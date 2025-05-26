
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, Upload, Save, X, FileText, Search } from "lucide-react";
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

const ImprovedPaperVariantManager = () => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<PaperVariant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PaperVariant>>({});
  const [filters, setFilters] = useState({
    paperType: "all",
    supplier: "all",
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
    if (filters.paperType !== "all" && variant.paper_type_id !== filters.paperType) return false;
    if (filters.supplier !== "all" && variant.supplier_id !== filters.supplier) return false;
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
      const grammage = allGrammages.find(g => g.id === newVariant.paper_gsm_id);
      const size = allSizes.find(s => s.id === newVariant.paper_size_id);
      
      let pricePerReem = 0;
      if (grammage && size && newVariant.price_per_kg) {
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

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ["paper_type_id", "paper_size_id", "paper_gsm_id", "supplier_id", "sheets_per_pack", "price_per_pack", "price_per_kg"];
    const sampleData = ["<UUID>", "<UUID>", "<UUID>", "<UUID>", "100", "1500.00", "45.00"];
    
    const csvContent = [headers, sampleData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paper_variants_template.csv";
    link.click();
    
    toast({
      title: "ดาวน์โหลดเทมเพลตสำเร็จ",
      description: "ใช้ไฟล์นี้เป็นแม่แบบสำหรับนำเข้าข้อมูล"
    });
  };

  // Get filtered options for cascading dropdowns
  const getFilteredGrammages = (paperTypeId: string) => {
    return allGrammages.filter(g => g.paper_type_id === paperTypeId);
  };

  const getFilteredSizes = (paperTypeId: string) => {
    return allSizes.filter(s => s.paper_type_id === paperTypeId);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      paperType: "all",
      supplier: "all",
      searchName: ""
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Paper Master - จัดการข้อมูลกระดาษ</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                จัดการข้อมูลกระดาษแบบครบวงจร รวมประเภท ขนาด แกรม และราคา
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Template CSV
              </Button>
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowAddForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มรายการใหม่
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manage" className="space-y-4">
            <TabsList>
              <TabsTrigger value="manage">จัดการข้อมูล</TabsTrigger>
              <TabsTrigger value="summary">สรุปข้อมูล</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage" className="space-y-4">
              {/* Advanced Filters */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ประเภทกระดาษ</label>
                        <Select value={filters.paperType} onValueChange={(value) => setFilters(prev => ({ ...prev, paperType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภทกระดาษ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {paperTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ซัพพลายเออร์</label>
                        <Select value={filters.supplier} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกซัพพลายเออร์" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {suppliers.map(supplier => (
                              <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ค้นหา</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="ค้นหาชื่อกระดาษ..."
                            value={filters.searchName}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchName: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      ล้างตัวกรอง
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        แสดง: {filteredVariants.length} รายการ
                      </Badge>
                      <Badge variant="outline">
                        ทั้งหมด: {variants.length} รายการ
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Form */}
              {showAddForm && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">เพิ่มรายการกระดาษใหม่</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ประเภทกระดาษ *</label>
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
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">แกรม *</label>
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
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ขนาด *</label>
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
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ซัพพลายเออร์ *</label>
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">แผ่น/ห่อ</label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={newVariant.sheets_per_pack}
                          onChange={(e) => setNewVariant(prev => ({ ...prev, sheets_per_pack: parseInt(e.target.value) || 100 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ราคา/ห่อ (บาท)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newVariant.price_per_pack}
                          onChange={(e) => setNewVariant(prev => ({ ...prev, price_per_pack: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ราคา/กก. (บาท)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newVariant.price_per_kg}
                          onChange={(e) => setNewVariant(prev => ({ ...prev, price_per_kg: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button onClick={addVariant} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มรายการ
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">ประเภทกระดาษ</TableHead>
                          <TableHead className="font-semibold">ขนาด</TableHead>
                          <TableHead className="font-semibold">แกรม</TableHead>
                          <TableHead className="font-semibold">ซัพพลายเออร์</TableHead>
                          <TableHead className="font-semibold text-center">แผ่น/ห่อ</TableHead>
                          <TableHead className="font-semibold text-right">ราคา/ห่อ</TableHead>
                          <TableHead className="font-semibold text-right">ราคา/กก.</TableHead>
                          <TableHead className="font-semibold text-center">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVariants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8 text-gray-300" />
                                <p>ไม่พบข้อมูลกระดาษ</p>
                                <p className="text-sm">ลองปรับเปลี่ยนตัวกรองหรือเพิ่มข้อมูลใหม่</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredVariants.map((variant) => (
                            <TableRow key={variant.id} className="hover:bg-gray-50">
                              <TableCell>
                                <Badge variant="outline">{variant.paper_type?.label}</Badge>
                              </TableCell>
                              <TableCell>
                                {variant.paper_size ? `${variant.paper_size.name} (${variant.paper_size.width}×${variant.paper_size.height})` : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{variant.paper_grammage?.grammage} gsm</Badge>
                              </TableCell>
                              <TableCell>{variant.supplier?.name}</TableCell>
                              <TableCell className="text-center">
                                {editingId === variant.id ? (
                                  <Input
                                    type="number"
                                    value={editingData.sheets_per_pack || ""}
                                    onChange={(e) => setEditingData(prev => ({ ...prev, sheets_per_pack: parseInt(e.target.value) || 0 }))}
                                    className="w-20 text-center"
                                  />
                                ) : (
                                  variant.sheets_per_pack
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingId === variant.id ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingData.price_per_pack || ""}
                                    onChange={(e) => setEditingData(prev => ({ ...prev, price_per_pack: parseFloat(e.target.value) || 0 }))}
                                    className="w-28 text-right"
                                  />
                                ) : (
                                  <span className="font-medium">฿{variant.price_per_pack.toFixed(2)}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingId === variant.id ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingData.price_per_kg || ""}
                                    onChange={(e) => setEditingData(prev => ({ ...prev, price_per_kg: parseFloat(e.target.value) || 0 }))}
                                    className="w-28 text-right"
                                  />
                                ) : (
                                  variant.price_per_kg ? <span className="font-medium">฿{variant.price_per_kg.toFixed(2)}</span> : <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  {editingId === variant.id ? (
                                    <>
                                      <Button variant="outline" size="sm" onClick={saveEdit}>
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button variant="outline" size="sm" onClick={() => startEdit(variant)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => deleteVariant(variant.id)}>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{variants.length}</div>
                    <p className="text-sm text-gray-600">รายการกระดาษทั้งหมด</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{paperTypes.length}</div>
                    <p className="text-sm text-gray-600">ประเภทกระดาษ</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{suppliers.length}</div>
                    <p className="text-sm text-gray-600">ซัพพลายเออร์</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{filteredVariants.length}</div>
                    <p className="text-sm text-gray-600">รายการที่กรองแล้ว</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>สรุปตามประเภทกระดาษ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paperTypes.map(type => {
                      const count = variants.filter(v => v.paper_type_id === type.id).length;
                      return (
                        <div key={type.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{type.label}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{count} รายการ</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedPaperVariantManager;
