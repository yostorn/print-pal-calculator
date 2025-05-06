
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface PaperTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const paperTypes = [
  { value: "art-card", label: "Art Card" },
  { value: "art-paper", label: "Art Paper" },
  { value: "woodfree", label: "Woodfree" },
  { value: "newsprint", label: "Newsprint" }
];

const PaperTypeDropdown: React.FC<PaperTypeDropdownProps> = ({ value, onChange }) => {
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
          <SelectValue placeholder="เลือกประเภทกระดาษ" />
        </SelectTrigger>
        <SelectContent>
          {paperTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaperTypeDropdown;
