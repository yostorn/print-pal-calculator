
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RotateCw, Maximize } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface LayoutPreviewProps {
  paperWidth: number;  // Width of paper in inches
  paperHeight: number; // Height of paper in inches
  jobWidth: number;    // Width of job in cm
  jobHeight: number;   // Height of job in cm
  onLayoutChange: (printPerSheet: number) => void;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  paperWidth,
  paperHeight,
  jobWidth,
  jobHeight,
  onLayoutChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detailCanvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState<boolean>(false);
  const [printPerSheet, setPrintPerSheet] = useState<number>(0);
  const [wastePercentage, setWastePercentage] = useState<number>(0);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Convert cm to inches
  const jobWidthInch = jobWidth / 2.54;
  const jobHeightInch = jobHeight / 2.54;
  
  const calculateLayout = () => {
    if (!jobWidth || !jobHeight || !paperWidth || !paperHeight) {
      return { printPerSheet: 0, layout: [], wastePercentage: 0 };
    }
    
    // Try both orientations and use the one that fits more prints
    const portraitCols = Math.floor(paperWidth / jobWidthInch);
    const portraitRows = Math.floor(paperHeight / jobHeightInch);
    const portraitPerSheet = portraitCols * portraitRows;
    
    const landscapeCols = Math.floor(paperWidth / jobHeightInch);
    const landscapeRows = Math.floor(paperHeight / jobWidthInch);
    const landscapePerSheet = landscapeCols * landscapeRows;
    
    // Determine if rotation gives better results
    const shouldRotate = landscapePerSheet > portraitPerSheet;
    
    const layout = [];
    const cols = shouldRotate ? landscapeCols : portraitCols;
    const rows = shouldRotate ? landscapeRows : portraitRows;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        layout.push({
          x: x * (shouldRotate ? jobHeightInch : jobWidthInch),
          y: y * (shouldRotate ? jobWidthInch : jobHeightInch),
          rotated: shouldRotate
        });
      }
    }
    
    // Calculate waste percentage
    const usedArea = layout.length * (shouldRotate ? jobWidthInch * jobHeightInch : jobWidthInch * jobHeightInch);
    const totalArea = paperWidth * paperHeight;
    const wastePercentage = ((totalArea - usedArea) / totalArea) * 100;
    
    return {
      printPerSheet: cols * rows,
      layout,
      wastePercentage: parseFloat(wastePercentage.toFixed(2))
    };
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no dimensions yet, show placeholder
    if (!jobWidth || !jobHeight || !paperWidth || !paperHeight) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('กรุณาระบุขนาดงานและกระดาษ', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Scale factor to fit the paper on canvas
    const scale = Math.min(
      (canvas.width - 40) / paperWidth,
      (canvas.height - 40) / paperHeight
    );
    
    // Draw paper
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(20, 20, paperWidth * scale, paperHeight * scale);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, paperWidth * scale, paperHeight * scale);
    
    // Calculate layout
    const effectiveJobWidth = rotation ? jobHeightInch : jobWidthInch;
    const effectiveJobHeight = rotation ? jobWidthInch : jobHeightInch;
    
    const cols = Math.floor(paperWidth / effectiveJobWidth);
    const rows = Math.floor(paperHeight / effectiveJobHeight);
    
    const totalPrints = cols * rows;
    setPrintPerSheet(totalPrints);
    onLayoutChange(totalPrints);
    
    // Calculate waste percentage
    const usedArea = totalPrints * (effectiveJobWidth * effectiveJobHeight);
    const totalArea = paperWidth * paperHeight;
    const waste = ((totalArea - usedArea) / totalArea) * 100;
    setWastePercentage(parseFloat(waste.toFixed(2)));
    
    // Draw job items
    ctx.fillStyle = '#bfdbfe';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rectX = 20 + (x * effectiveJobWidth * scale);
        const rectY = 20 + (y * effectiveJobHeight * scale);
        const rectWidth = effectiveJobWidth * scale;
        const rectHeight = effectiveJobHeight * scale;
        
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        
        // Add item number
        ctx.fillStyle = '#1e40af';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${y * cols + x + 1}`, 
          rectX + rectWidth / 2, 
          rectY + rectHeight / 2
        );
        ctx.fillStyle = '#bfdbfe';
      }
    }

    // Also update the detailed view if it's open
    if (detailOpen) renderDetailedView();
    
  }, [paperWidth, paperHeight, jobWidth, jobHeight, rotation, onLayoutChange, detailOpen]);
  
  const toggleRotation = () => {
    setRotation(!rotation);
  };

  const renderDetailedView = () => {
    const canvas = detailCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Scale factor to fit the paper on canvas
    const scale = Math.min(
      (canvas.width - 60) / paperWidth,
      (canvas.height - 60) / paperHeight
    );
    
    // Draw paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, 30, paperWidth * scale, paperHeight * scale);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, paperWidth * scale, paperHeight * scale);
    
    // Calculate layout
    const effectiveJobWidth = rotation ? jobHeightInch : jobWidthInch;
    const effectiveJobHeight = rotation ? jobWidthInch : jobHeightInch;
    
    const cols = Math.floor(paperWidth / effectiveJobWidth);
    const rows = Math.floor(paperHeight / effectiveJobHeight);
    
    // Draw job items with more detail
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rectX = 30 + (x * effectiveJobWidth * scale);
        const rectY = 30 + (y * effectiveJobHeight * scale);
        const rectWidth = effectiveJobWidth * scale;
        const rectHeight = effectiveJobHeight * scale;
        
        ctx.fillStyle = y % 2 === 0 ? '#e6f0fd' : '#bfdbfe';
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        
        // Add item number
        ctx.fillStyle = '#1e40af';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${y * cols + x + 1}`, 
          rectX + rectWidth / 2, 
          rectY + rectHeight / 2
        );
      }
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">แบบการวางงาน</CardTitle>
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setDetailOpen(true)}
              >
                <Maximize className="h-4 w-4 mr-1" />
                ขยาย
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>รายละเอียดการวางงาน</DialogTitle>
              </DialogHeader>
              <div className="p-2">
                <div className="mb-4 grid grid-cols-2 gap-4">
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
                <AspectRatio ratio={16/10} className="border">
                  <canvas 
                    ref={detailCanvasRef} 
                    width={800}
                    height={500}
                    className="w-full h-full"
                  />
                </AspectRatio>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-700 mb-1">
              พิมพ์ได้: <strong>{printPerSheet}</strong> ชิ้น/แผ่น
            </p>
            <p className="text-sm text-gray-700">
              เปอร์เซ็นต์ waste: <strong>{wastePercentage}%</strong>
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleRotation}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            หมุน
          </Button>
        </div>
        <div className="border rounded bg-gray-50">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={300} 
            className="w-full h-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutPreview;
