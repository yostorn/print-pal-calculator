
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface PaperSizeSelectionProps {
  paperType: string;
  paperSizes: any[] | undefined;
  isLoadingPaperSizes: boolean;
  paperSizesError: any;
  selectedPaperSize: { width: number; height: number } | null;
  onPaperSizeChange: (sizeId: string) => void;
}

const PaperSizeSelection: React.FC<PaperSizeSelectionProps> = ({
  paperType,
  paperSizes,
  isLoadingPaperSizes,
  paperSizesError,
  selectedPaperSize,
  onPaperSizeChange
}) => {
  if (!paperType) return null;

  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor="paperSize" className="text-sm font-medium">
          ขนาดกระดาษ
        </Label>
        {!selectedPaperSize && !isLoadingPaperSizes && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> กรุณาเลือกขนาดกระดาษ
          </span>
        )}
      </div>
      
      {isLoadingPaperSizes ? (
        <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md"></div>
      ) : paperSizesError ? (
        <div className="text-sm text-red-500">ไม่สามารถโหลดขนาดกระดาษได้ ({paperSizesError.message})</div>
      ) : (
        <Select 
          onValueChange={onPaperSizeChange}
          value={paperSizes?.find(s => 
            selectedPaperSize && 
            s.width === selectedPaperSize.width && 
            s.height === selectedPaperSize.height
          )?.id}
        >
          <SelectTrigger id="paperSize" className="w-full">
            <SelectValue placeholder="เลือกขนาดกระดาษ" />
          </SelectTrigger>
          <SelectContent>
            {paperSizes && paperSizes.length > 0 ? (
              paperSizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name} ({size.width}&quot; × {size.height}&quot;)
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-sizes" disabled>
                ไม่พบขนาดกระดาษ
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
      
      {selectedPaperSize && (
        <p className="mt-2 text-sm text-green-600">
          กระดาษขนาด {selectedPaperSize.width}&quot; × {selectedPaperSize.height}&quot;
        </p>
      )}
    </div>
  );
};

export default PaperSizeSelection;
