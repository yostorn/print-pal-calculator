
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperTypes } from "@/services/supabaseService";

interface PaperTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const PaperTypeDropdown: React.FC<PaperTypeDropdownProps> = ({ value, onChange }) => {
  // Fetch paper types from database
  const { data: paperTypes, isLoading, error } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="paperType">ประเภทกระดาษ</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">เลือกประเภทกระดาษที่ต้องการใช้ในการพิมพ์</span>
        </div>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="paperType" className="w-full">
          <SelectValue placeholder={isLoading ? "กำลังโหลด..." : "เลือกประเภทกระดาษ"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>กำลังโหลดข้อมูล...</SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>เกิดข้อผิดพลาด</SelectItem>
          ) : paperTypes && paperTypes.length > 0 ? (
            paperTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>ไม่พบข้อมูล</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaperTypeDropdown;
