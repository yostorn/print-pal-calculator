
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperGrammages } from "@/services/supabaseService";

interface PaperGrammageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  paperType: string;
}

const PaperGrammageDropdown: React.FC<PaperGrammageDropdownProps> = ({ value, onChange, paperType }) => {
  // Fetch grammages from database based on selected paper type
  const { data: grammages, isLoading } = useQuery({
    queryKey: ['paperGrammages', paperType],
    queryFn: () => fetchPaperGrammages(paperType),
    enabled: !!paperType
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="paperGrammage">แกรมกระดาษ</Label>
        <div className="tooltip">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="tooltiptext">ความหนาของกระดาษที่วัดเป็นแกรม (gsm - กรัมต่อตารางเมตร)</span>
        </div>
      </div>
      <Select value={value} onValueChange={onChange} disabled={!paperType || isLoading}>
        <SelectTrigger id="paperGrammage" className="w-full">
          <SelectValue placeholder={isLoading ? "กำลังโหลด..." : "เลือกแกรมกระดาษ"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>กำลังโหลดข้อมูล...</SelectItem>
          ) : !paperType ? (
            <SelectItem value="no-paper-type" disabled>โปรดเลือกประเภทกระดาษก่อน</SelectItem>
          ) : grammages && grammages.length > 0 ? (
            grammages.map((grammage) => (
              <SelectItem key={grammage.id} value={grammage.id}>
                {grammage.grammage} gsm
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>ไม่พบข้อมูลแกรมกระดาษ</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaperGrammageDropdown;
