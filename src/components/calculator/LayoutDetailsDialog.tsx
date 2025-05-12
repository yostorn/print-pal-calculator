import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import LayoutPreview from "../layout-preview/LayoutPreview";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Ruler, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperTypes, fetchPaperSizes } from "@/services/supabaseService";

interface LayoutDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paperSize: { width: number; height: number } | null;
  width: string;
  height: string;
  sizeUnit: "cm" | "inch";
  printPerSheet: number;
  onLayoutChange: (perSheet: number) => void;
  onPaperTypeChange?: (paperType: string) => void;
  onPaperSizeChange?: (paperSize: { width: number; height: number }) => void;
}

const LayoutDetailsDialog: React.FC<LayoutDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  paperSize,
  width,
  height,
  sizeUnit,
  printPerSheet,
  onLayoutChange,
  onPaperTypeChange,
  onPaperSizeChange
}) => {
  const isMobile = useIsMobile();
  
  // Local state for paper selection within this dialog
  const [selectedPaperType, setSelectedPaperType] = useState<string>("");
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [localPaperSize, setLocalPaperSize] = useState<{ width: number; height: number } | null>(paperSize);

  // Validate that we have all required dimensions
  const hasPaperDimensions = localPaperSize && localPaperSize.width > 0 && localPaperSize.height > 0;
  const hasJobDimensions = parseFloat(width || "0") > 0 && parseFloat(height || "0") > 0;
  const allDimensionsProvided = hasPaperDimensions && hasJobDimensions;
  
  // Fetch paper types
  const { data: paperTypes } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });
  
  // Fetch paper sizes based on selected type
  const { data: paperSizes, isLoading: isLoadingPaperSizes } = useQuery({
    queryKey: ['paperSizes', selectedPaperType],
    queryFn: () => fetchPaperSizes(selectedPaperType),
    enabled: !!selectedPaperType
  });

  // Debug logs to trace data flow
  useEffect(() => {
    console.log("LayoutDetailsDialog - selectedPaperType:", selectedPaperType);
    console.log("LayoutDetailsDialog - paperSizes:", paperSizes);
  }, [selectedPaperType, paperSizes]);

  // Reset local paper size when dialog opens and external paperSize changes
  useEffect(() => {
    if (isOpen) {
      setLocalPaperSize(paperSize);
      
      // If we don't have a paper size yet, make sure the user knows they need to select one
      if (!paperSize || !paperSize.width || !paperSize.height) {
        console.log("No paper size provided to dialog, user needs to select one");
      }
    }
  }, [isOpen, paperSize]);

  // Handle paper type selection
  const handlePaperTypeChange = (value: string) => {
    console.log("Paper type changed in dialog to:", value);
    setSelectedPaperType(value);
    setSelectedSizeId(""); // Reset size selection when type changes
    
    if (onPaperTypeChange) {
      onPaperTypeChange(value);
    }
  };

  // Handle paper size selection
  const handlePaperSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    
    const size = paperSizes?.find(s => s.id === sizeId);
    if (size) {
      const newPaperSize = {
        width: size.width,
        height: size.height
      };
      
      console.log("Selected paper size in dialog:", newPaperSize);
      setLocalPaperSize(newPaperSize);
      
      // Call parent callback to update paper size
      if (onPaperSizeChange) {
        onPaperSizeChange(newPaperSize);
      }
      
      // Force recalculation of layout
      handleForceCalculation(newPaperSize);
    }
  };
  
  // Debug information to help troubleshoot validation issues
  console.log("LayoutDetailsDialog rendering with:", { 
    paperSize, 
    localPaperSize,
    width, 
    height, 
    sizeUnit,
    printPerSheet,
    hasPaperDimensions,
    hasJobDimensions,
    allDimensionsProvided,
    selectedPaperType,
    selectedSizeId,
    paperSizes
  });

  // Force a recalculation of the layout
  const handleForceCalculation = (customPaperSize = localPaperSize) => {
    if (!customPaperSize || !width || !height) return;
    
    console.log("Forcing layout calculation with:", { customPaperSize, width, height });
    
    // Call onLayoutChange directly to trigger a recalculation
    const jobWidthInch = parseFloat(width) / (sizeUnit === "cm" ? 2.54 : 1);
    const jobHeightInch = parseFloat(height) / (sizeUnit === "cm" ? 2.54 : 1);
    
    // Try both orientations
    const cols = Math.floor(customPaperSize.width / jobWidthInch);
    const rows = Math.floor(customPaperSize.height / jobHeightInch);
    const normalLayout = cols * rows;
    
    const rotatedCols = Math.floor(customPaperSize.width / jobHeightInch);
    const rotatedRows = Math.floor(customPaperSize.height / jobWidthInch);
    const rotatedLayout = rotatedCols * rotatedRows;
    
    // Use the better layout
    const calculated = Math.max(normalLayout, rotatedLayout);
    
    console.log("Layout calculation results:", {
      normal: { cols, rows, total: normalLayout },
      rotated: { cols: rotatedCols, rows: rotatedRows, total: rotatedLayout },
      calculated
    });
    
    onLayoutChange(calculated > 0 ? calculated : 0);
  };

  // Component to render the layout details dialog/sheet content
  function LayoutDetailsContent() {
    return (
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
              <Select value={selectedPaperType} onValueChange={handlePaperTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกประเภทกระดาษ" />
                </SelectTrigger>
                <SelectContent>
                  {paperTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm">ขนาดกระดาษ</label>
              <Select 
                value={selectedSizeId}
                onValueChange={handlePaperSizeChange}
                disabled={!selectedPaperType || isLoadingPaperSizes}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingPaperSizes ? "กำลังโหลด..." : "เลือกขนาดกระดาษ"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPaperSizes ? (
                    <SelectItem value="loading" disabled>กำลังโหลดข้อมูล...</SelectItem>
                  ) : paperSizes && paperSizes.length > 0 ? (
                    paperSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} ({size.width}" × {size.height}")
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-sizes" disabled>ไม่พบขนาดกระดาษ</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {localPaperSize && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">
                เลือกกระดาษเรียบร้อยแล้ว
              </AlertTitle>
              <AlertDescription className="text-green-700">
                กระดาษขนาด {localPaperSize.width}" × {localPaperSize.height}" พร้อมสำหรับการคำนวณ
              </AlertDescription>
            </Alert>
          )}
        </div>

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
                  เลือกประเภทและขนาดกระดาษก่อนเพื่อดูขนาดกระดาษ
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
                <p><span className="font-medium">ขนาดกระดาษ:</span> {localPaperSize.width} × {localPaperSize.height} นิ้ว</p>
                <Badge variant="outline" className="bg-blue-50">
                  {localPaperSize.width * localPaperSize.height} ตารางนิ้ว
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
                  onClick={() => handleForceCalculation()}
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
        
        {localPaperSize && (
          <div className="border rounded-md p-4">
            <LayoutPreview 
              paperWidth={localPaperSize.width} 
              paperHeight={localPaperSize.height}
              jobWidth={parseFloat(width || "0") || 0}
              jobHeight={parseFloat(height || "0") || 0}
              onLayoutChange={onLayoutChange}
            />
          </div>
        )}
      </div>
    );
  }

  // Return dialog for desktop, sheet for mobile
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>รายละเอียดการจัดวางงาน</SheetTitle>
          <SheetDescription>คุณสามารถตรวจสอบรายละเอียดการจัดวางงานพิมพ์บนกระดาษ</SheetDescription>
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
          <DialogDescription>คุณสามารถตรวจสอบรายละเอียดการจัดวางงานพิมพ์บนกระดาษ</DialogDescription>
        </DialogHeader>
        <LayoutDetailsContent />
      </DialogContent>
    </Dialog>
  );
};

export default LayoutDetailsDialog;
