
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

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
  const [rotation, setRotation] = useState<boolean>(false);
  const [printPerSheet, setPrintPerSheet] = useState<number>(0);
  
  // Convert cm to inches
  const jobWidthInch = jobWidth / 2.54;
  const jobHeightInch = jobHeight / 2.54;
  
  const calculateLayout = () => {
    if (!jobWidth || !jobHeight || !paperWidth || !paperHeight) {
      return { printPerSheet: 0, layout: [] };
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
    
    return {
      printPerSheet: cols * rows,
      layout
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
    
  }, [paperWidth, paperHeight, jobWidth, jobHeight, rotation, onLayoutChange]);
  
  const toggleRotation = () => {
    setRotation(!rotation);
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">แบบการวางงาน</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">พิมพ์ได้: <strong>{printPerSheet}</strong> ชิ้น/แผ่น</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleRotation}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              หมุน
            </Button>
          </div>
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
