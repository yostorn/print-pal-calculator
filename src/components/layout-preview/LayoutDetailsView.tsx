
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RotateCw } from "lucide-react";
import LayoutCanvas from "./LayoutCanvas";

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
  // Common content for both dialog and sheet
  const DetailsContent = () => (
    <div className="space-y-4">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>ขนาดกระดาษ:</strong> {paperWidth} x {paperHeight} นิ้ว</p>
          <p><strong>ขนาดงาน:</strong> {jobWidth} x {jobHeight} ซม. ({(jobWidth / 2.54).toFixed(2)} x {(jobHeight / 2.54).toFixed(2)} นิ้ว)</p>
          <p><strong>พิมพ์ได้:</strong> {printPerSheet} ชิ้น/แผ่น</p>
        </div>
        <div>
          <p><strong>เปอร์เซ็นต์ waste:</strong> {wastePercentage}%</p>
          <p><strong>วิธีการจัดวางที่ดีที่สุด:</strong> {rotation ? "โดยหมุนใบพิมพ์" : "โดยไม่หมุนใบพิมพ์"}</p>
        </div>
      </div>
      {isMobile ? (
        <div className="border rounded">
          <LayoutCanvas
            paperWidth={paperWidth}
            paperHeight={paperHeight}
            jobWidth={jobWidth}
            jobHeight={jobHeight}
            rotation={rotation}
            printPerSheet={printPerSheet}
            detailed
            width={500}
            height={300}
          />
        </div>
      ) : (
        <AspectRatio ratio={16/10} className="border">
          <LayoutCanvas
            paperWidth={paperWidth}
            paperHeight={paperHeight}
            jobWidth={jobWidth}
            jobHeight={jobHeight}
            rotation={rotation}
            printPerSheet={printPerSheet}
            detailed
            width={800}
            height={500}
          />
        </AspectRatio>
      )}
      
      {isMobile && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onRotate} className="mr-2">
            <RotateCw className="h-4 w-4 mr-2" />
            หมุน
          </Button>
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
        </DialogHeader>
        <div className="p-2">
          <DetailsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutDetailsView;
