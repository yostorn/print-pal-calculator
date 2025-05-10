
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import LayoutPreview from "../layout-preview/LayoutPreview";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface LayoutDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paperSize: { width: number; height: number } | null;
  width: string;
  height: string;
  sizeUnit: "cm" | "inch";
  printPerSheet: number;
  onLayoutChange: (perSheet: number) => void;
}

const LayoutDetailsDialog: React.FC<LayoutDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  paperSize,
  width,
  height,
  sizeUnit,
  printPerSheet,
  onLayoutChange
}) => {
  const isMobile = useIsMobile();

  // Validate that we have all required dimensions
  const hasPaperDimensions = paperSize && paperSize.width > 0 && paperSize.height > 0;
  const hasJobDimensions = parseFloat(width || "0") > 0 && parseFloat(height || "0") > 0;
  const allDimensionsProvided = hasPaperDimensions && hasJobDimensions;
  
  // Debug information to help troubleshoot validation issues
  console.log("LayoutDetailsDialog rendering with:", { 
    paperSize, 
    width, 
    height, 
    sizeUnit,
    printPerSheet,
    hasPaperDimensions,
    hasJobDimensions,
    allDimensionsProvided
  });

  // Component to render the layout details dialog/sheet content
  const LayoutDetailsContent = () => (
    <div className="space-y-4">
      {!allDimensionsProvided && (
        <Alert variant="destructive">
          <AlertTitle>กรุณากรอกข้อมูลให้ครบ</AlertTitle>
          <AlertDescription>
            {!hasPaperDimensions && "กรุณาเลือกประเภทกระดาษ"}
            {!hasPaperDimensions && !hasJobDimensions && " และ "}
            {!hasJobDimensions && "กรุณาระบุขนาดงาน"}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {paperSize ? (
          <>
            <h3 className="font-medium">ขนาดกระดาษ</h3>
            <p>{paperSize.width} × {paperSize.height} นิ้ว</p>
            
            <h3 className="font-medium mt-4">ขนาดงาน</h3>
            <p>{width} × {height} {sizeUnit}</p>
            
            <h3 className="font-medium mt-4">จำนวนชิ้นต่อแผ่น</h3>
            <p className="text-lg font-bold">{printPerSheet > 0 ? printPerSheet : "รอการคำนวณ..."} ชิ้นต่อแผ่น</p>
            
            {printPerSheet > 0 && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                เรียบร้อย! การจัดวางงานที่ดีที่สุดคือ {printPerSheet} ชิ้นต่อแผ่น
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
            กรุณาเลือกประเภทกระดาษและระบุขนาดงานเพื่อดูการจัดวาง
          </div>
        )}
      </div>
      
      {paperSize && (
        <div className="border rounded-md p-4">
          <LayoutPreview 
            paperWidth={paperSize.width} 
            paperHeight={paperSize.height}
            jobWidth={parseFloat(width || "0") || 0}
            jobHeight={parseFloat(height || "0") || 0}
            onLayoutChange={onLayoutChange}
          />
        </div>
      )}
    </div>
  );

  // Return dialog for desktop, sheet for mobile
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>รายละเอียดการจัดวางงาน</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <LayoutDetailsContent />
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>รายละเอียดการจัดวางงาน</DialogTitle>
        </DialogHeader>
        <LayoutDetailsContent />
      </DialogContent>
    </Dialog>
  );
};

export default LayoutDetailsDialog;
