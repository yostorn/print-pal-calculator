
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface SupplierDropdownProps {
  value: string;
  onChange: (value: string) => void;
  paperType: string;
}

const suppliers: Record<string, { value: string; label: string }[]> = {
  "art-card": [
    { value: "supplier-a", label: "Supplier A" },
    { value: "supplier-b", label: "Supplier B" },
    { value: "supplier-c", label: "Supplier C" }
  ],
  "art-paper": [
    { value: "supplier-a", label: "Supplier A" },
    { value: "supplier-d", label: "Supplier D" },
    { value: "supplier-e", label: "Supplier E" }
  ],
  "woodfree": [
    { value: "supplier-b", label: "Supplier B" },
    { value: "supplier-c", label: "Supplier C" },
    { value: "supplier-f", label: "Supplier F" }
  ],
  "newsprint": [
    { value: "supplier-g", label: "Supplier G" },
    { value: "supplier-h", label: "Supplier H" }
  ]
};

const SupplierDropdown: React.FC<SupplierDropdownProps> = ({ value, onChange, paperType }) => {
  const supplierOptions = paperType ? suppliers[paperType] || [] : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="supplier">Supplier</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">บริษัทผู้จำหน่ายกระดาษ</span>
        </div>
      </div>
      <Select value={value} onValueChange={onChange} disabled={!paperType}>
        <SelectTrigger id="supplier" className="w-full">
          <SelectValue placeholder="เลือก Supplier" />
        </SelectTrigger>
        <SelectContent>
          {supplierOptions.map((supplier) => (
            <SelectItem key={supplier.value} value={supplier.value}>
              {supplier.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SupplierDropdown;
