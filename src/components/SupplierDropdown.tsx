
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers } from "@/services/supabaseService";

interface SupplierDropdownProps {
  value: string;
  onChange: (value: string) => void;
  paperType: string;
  onSupplierDataChange?: (supplierData: { id: string; name: string; sheets_per_pack: number } | null) => void;
}

const SupplierDropdown: React.FC<SupplierDropdownProps> = ({ 
  value, 
  onChange, 
  paperType,
  onSupplierDataChange 
}) => {
  // Fetch suppliers from database
  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers
  });
  
  // When supplier list loads or changes, set a default if none is selected
  useEffect(() => {
    if (suppliers && suppliers.length > 0 && !value) {
      const firstSupplier = suppliers[0];
      onChange(firstSupplier.id);
      if (onSupplierDataChange) {
        onSupplierDataChange({
          id: firstSupplier.id,
          name: firstSupplier.name,
          sheets_per_pack: firstSupplier.sheets_per_pack || 100
        });
      }
    }
  }, [suppliers, value, onChange, onSupplierDataChange]);

  const handleSupplierChange = (supplierId: string) => {
    onChange(supplierId);
    
    if (onSupplierDataChange && suppliers) {
      const selectedSupplier = suppliers.find(s => s.id === supplierId);
      if (selectedSupplier) {
        onSupplierDataChange({
          id: selectedSupplier.id,
          name: selectedSupplier.name,
          sheets_per_pack: selectedSupplier.sheets_per_pack || 100
        });
      }
    }
  };

  // Debug log
  console.log("Suppliers data:", suppliers);
  console.log("Current supplier value:", value);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="supplier">Supplier</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">บริษัทผู้จำหน่ายกระดาษ</span>
        </div>
      </div>
      <Select value={value} onValueChange={handleSupplierChange}>
        <SelectTrigger id="supplier" className="w-full">
          <SelectValue placeholder="เลือก Supplier" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>กำลังโหลดข้อมูล...</SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>เกิดข้อผิดพลาด</SelectItem>
          ) : suppliers && suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name} ({supplier.sheets_per_pack || 100} แผ่น/ห่อ)
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>ไม่พบข้อมูล Supplier</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SupplierDropdown;
