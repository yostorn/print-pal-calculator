
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import LayoutPreview from "../layout-preview/LayoutPreview";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Ruler, RefreshCcw } from "lucide-react";

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

  // Force a recalculation of the layout
  const handleForceCalculation = () => {
    if (hasPaperDimensions && hasJobDimensions) {
      // Call onLayoutChange directly to trigger a recalculation
      const jobWidthInch = parseFloat(width) / (sizeUnit === "cm" ? 2.54 : 1);
      const jobHeightInch = parseFloat(height) / (sizeUnit === "cm" ? 2.54 : 1);
      
      if (paperSize) {
        const cols = Math.floor(paperSize.width / jobWidthInch);
        const rows = Math.floor(paperSize.height / jobHeightInch);
        const calculated = cols * rows;
        
        console.log("Forcing layout calculation:", {
          paperWidth: paperSize.width,
          paperHeight: paperSize.height,
          jobWidthInch,
          jobHeightInch,
          cols,
          rows,
          calculated
        });
        
        onLayoutChange(calculated > 0 ? calculated : 0);
      }
    }
  };

  // Component to render the layout details dialog/sheet content
  const LayoutDetailsContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            ข้อมูลขนาด
          </h3>
          {!hasPaperDimensions && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>กรุณาเลือกประเภทกระดาษ</AlertTitle>
              <AlertDescription>
                เลือกประเภทและแกรมกระดาษก่อนเพื่อดูขนาดกระดาษ
              </AlertDescription>
            </Alert>
          )}
          
          {!hasJobDimensions && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>กรุณาระบุขนาดงาน</AlertTitle>
              <AlertDescription>
                ใส่ขนาดกว้างและยาวของงานที่ต้องการพิมพ์
              </AlertDescription>
            </Alert>
          )}
          
          {hasPaperDimensions && (
            <div className="text-sm space-y-1">
              <p><span className="font-medium">ขนาดกระดาษ:</span> {paperSize.width} × {paperSize.height} นิ้ว</p>
              <Badge variant="outline" className="bg-blue-50">
                {paperSize.width * paperSize.height} ตารางนิ้ว
              </Badge>
            </div>
          )}
          
          {hasJobDimensions && (
            <div className="text-sm space-y-1 mt-3">
              <p><span className="font-medium">ขนาดงาน:</span> {width} × {height} {sizeUnit}</p>
              <p className="text-xs text-gray-500">
                ({(parseFloat(width) / (sizeUnit === "cm" ? 2.54 : 1)).toFixed(2)} × {(parseFloat(height) / (sizeUnit === "cm" ? 2.54 : 1)).toFixed(2)} นิ้ว)
              </p>
            </div>
          )}
          
          {allDimensionsProvided && (
            <div className="mt-4">
              <Button 
                onClick={handleForceCalculation}
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                คำนวณการจัดวางใหม่
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            สถานะการจัดวาง
          </h3>
          
          {allDimensionsProvided && (
            <>
              <p className="text-lg font-bold">
                {printPerSheet > 0 ? `${printPerSheet} ชิ้นต่อแผ่น` : "รอการคำนวณ..."}
              </p>
              
              {printPerSheet > 0 ? (
                <Alert className="mt-3 bg-green-50 text-green-700 border-green-200">
                  <AlertTitle>เรียบร้อย!</AlertTitle>
                  <AlertDescription>การจัดวางงานที่ดีที่สุดคือ {printPerSheet} ชิ้นต่อแผ่น</AlertDescription>
                </Alert>
              ) : (
                <Alert className="mt-3 bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertTitle>กำลังคำนวณ</AlertTitle>
                  <AlertDescription>หากไม่พบการจัดวางที่เหมาะสม กรุณาตรวจสอบขนาดงานและกระดาษอีกครั้ง</AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          {!allDimensionsProvided && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>ข้อมูลไม่ครบถ้วน</AlertTitle>
              <AlertDescription>
                กรุณาตรวจสอบว่าได้เลือกข้อมูลกระดาษและขนาดงานครบถ้วน
              </AlertDescription>
            </Alert>
          )}
        </div>
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
