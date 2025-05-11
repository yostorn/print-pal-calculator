
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RotateCw, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LayoutCanvas from "./LayoutCanvas";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperTypes, fetchPaperSizes } from "@/services/supabaseService";

interface LayoutDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  paperWidth: number;
  paperHeight: number;
  jobWidth: number;
  jobHeight: number;
  rotation: boolean;
  onRotate: () => void;
  printPerSheet: number;
  wastePercentage: number;
}

const LayoutDetailsView: React.FC<LayoutDetailsViewProps> = ({
  isOpen,
  onClose,
  isMobile,
  paperWidth,
  paperHeight,
  jobWidth,
  jobHeight,
  rotation,
  onRotate,
  printPerSheet,
  wastePercentage
}) => {
  // Local state for paper selection within this dialog
  const [paperType, setPaperType] = useState<string>("");
  const [selectedPaperSize, setSelectedPaperSize] = useState<{id: string; name: string; width: number; height: number} | null>(null);
  const [localPaperWidth, setLocalPaperWidth] = useState(paperWidth);
  const [localPaperHeight, setLocalPaperHeight] = useState(paperHeight);
  const [localPrintPerSheet, setLocalPrintPerSheet] = useState(printPerSheet);
  
  // Fetch paper types
  const { data: paperTypes } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });
  
  // Fetch paper sizes based on selected type
  const { data: paperSizes } = useQuery({
    queryKey: ['paperSizes', paperType],
    queryFn: () => fetchPaperSizes(paperType),
    enabled: !!paperType
  });
  
  // Reset local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalPaperWidth(paperWidth);
      setLocalPaperHeight(paperHeight);
      setLocalPrintPerSheet(printPerSheet);
    }
  }, [isOpen, paperWidth, paperHeight, printPerSheet]);
  
  // Update local dimensions when paper size changes
  const handlePaperSizeChange = (sizeId: string) => {
    const size = paperSizes?.find(s => s.id === sizeId);
    if (size) {
      setSelectedPaperSize(size);
      setLocalPaperWidth(size.width);
      setLocalPaperHeight(size.height);
      
      // Recalculate prints per sheet
      const jobWidthInch = jobWidth / 2.54;
      const jobHeightInch = jobHeight / 2.54;
      
      if (rotation) {
        const cols = Math.floor(size.width / jobHeightInch);
        const rows = Math.floor(size.height / jobWidthInch);
        setLocalPrintPerSheet(cols * rows);
      } else {
        const cols = Math.floor(size.width / jobWidthInch);
        const rows = Math.floor(size.height / jobHeightInch);
        setLocalPrintPerSheet(cols * rows);
      }
    }
  };

  const hasSufficientData = !!localPaperWidth && !!localPaperHeight && !!jobWidth && !!jobHeight;

  // Common content for both dialog and sheet
  const DetailsContent = () => (
    <div className="space-y-4">
      {/* Paper Selection Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          เลือกประเภทกระดาษ
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm">ประเภทกระดาษ</label>
            <Select value={paperType} onValueChange={setPaperType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเภทกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                {paperTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm">ขนาดกระดาษ</label>
            <Select 
              value={selectedPaperSize?.id || ""} 
              onValueChange={handlePaperSizeChange}
              disabled={!paperType || !paperSizes || paperSizes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกขนาดกระดาษ" />
              </SelectTrigger>
              <SelectContent>
                {paperSizes?.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} ({size.width}" × {size.height}")
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {!hasSufficientData && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">กรุณาเลือกข้อมูลให้ครบถ้วน</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {!localPaperWidth || !localPaperHeight 
              ? "กรุณาเลือกประเภทกระดาษและขนาดกระดาษก่อน" 
              : "กรุณาระบุขนาดงานให้ครบถ้วน"}
          </AlertDescription>
        </Alert>
      )}
      
      {hasSufficientData && (
        <>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>ขนาดกระดาษ:</strong> {localPaperWidth} x {localPaperHeight} นิ้ว</p>
              <p><strong>ขนาดงาน:</strong> {jobWidth} x {jobHeight} ซม. ({(jobWidth / 2.54).toFixed(2)} x {(jobHeight / 2.54).toFixed(2)} นิ้ว)</p>
              <p><strong>พิมพ์ได้:</strong> {localPrintPerSheet} ชิ้น/แผ่น</p>
            </div>
            <div>
              <p><strong>เปอร์เซ็นต์ waste:</strong> {wastePercentage}%</p>
              <p><strong>วิธีการจัดวางที่ดีที่สุด:</strong> {rotation ? "โดยหมุนใบพิมพ์" : "โดยไม่หมุนใบพิมพ์"}</p>
              <Button onClick={onRotate} size="sm" className="mt-2" variant="outline">
                <RotateCw className="h-4 w-4 mr-2" />
                หมุนงาน
              </Button>
            </div>
          </div>
        </>
      )}

      {isMobile ? (
        <div className="border rounded">
          <LayoutCanvas
            paperWidth={localPaperWidth}
            paperHeight={localPaperHeight}
            jobWidth={jobWidth}
            jobHeight={jobHeight}
            rotation={rotation}
            printPerSheet={localPrintPerSheet}
            detailed
            width={500}
            height={300}
          />
        </div>
      ) : (
        <AspectRatio ratio={16/10} className="border">
          <LayoutCanvas
            paperWidth={localPaperWidth}
            paperHeight={localPaperHeight}
            jobWidth={jobWidth}
            jobHeight={jobHeight}
            rotation={rotation}
            printPerSheet={localPrintPerSheet}
            detailed
            width={800}
            height={500}
          />
        </AspectRatio>
      )}
      
      {hasSufficientData && localPrintPerSheet > 0 && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">การจัดวางงานเรียบร้อย</AlertTitle>
          <AlertDescription className="text-green-700">
            สามารถวางได้ {localPrintPerSheet} ชิ้นต่อแผ่น {rotation ? '(หมุนงาน)' : ''}
          </AlertDescription>
        </Alert>
      )}
      
      {isMobile && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>
            ปิด
          </Button>
        </div>
      )}
    </div>
  );

  // Return dialog for desktop, sheet for mobile
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>รายละเอียดการจัดวางงาน</SheetTitle>
          <SheetDescription>ข้อมูลการจัดวางงานพิมพ์บนกระดาษ</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <DetailsContent />
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>รายละเอียดการจัดวางงาน</DialogTitle>
          <DialogDescription>คุณสามารถเลือกประเภทและขนาดกระดาษในหน้านี้ เพื่อดูการจัดวางงานพิมพ์</DialogDescription>
        </DialogHeader>
        <div className="p-2">
          <DetailsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutDetailsView;
