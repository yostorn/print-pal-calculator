
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface PaperGrammageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  paperType: string;
}

const paperGrammages: Record<string, { value: string; label: string }[]> = {
  "art-card": [
    { value: "210", label: "210 gsm" },
    { value: "230", label: "230 gsm" },
    { value: "250", label: "250 gsm" },
    { value: "300", label: "300 gsm" }
  ],
  "art-paper": [
    { value: "80", label: "80 gsm" },
    { value: "90", label: "90 gsm" },
    { value: "100", label: "100 gsm" },
    { value: "120", label: "120 gsm" },
    { value: "130", label: "130 gsm" },
    { value: "150", label: "150 gsm" }
  ],
  "woodfree": [
    { value: "70", label: "70 gsm" },
    { value: "80", label: "80 gsm" },
    { value: "90", label: "90 gsm" },
    { value: "100", label: "100 gsm" }
  ],
  "newsprint": [
    { value: "45", label: "45 gsm" },
    { value: "48", label: "48 gsm" },
    { value: "52", label: "52 gsm" }
  ]
};

const PaperGrammageDropdown: React.FC<PaperGrammageDropdownProps> = ({ value, onChange, paperType }) => {
  const grammageOptions = paperType ? paperGrammages[paperType] || [] : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="paperGrammage">แกรมกระดาษ</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">ความหนาของกระดาษที่วัดเป็นแกรม (gsm - กรัมต่อตารางเมตร)</span>
        </div>
      </div>
      <Select value={value} onValueChange={onChange} disabled={!paperType}>
        <SelectTrigger id="paperGrammage" className="w-full">
          <SelectValue placeholder="เลือกแกรมกระดาษ" />
        </SelectTrigger>
        <SelectContent>
          {grammageOptions.map((grammage) => (
            <SelectItem key={grammage.value} value={grammage.value}>
              {grammage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaperGrammageDropdown;
