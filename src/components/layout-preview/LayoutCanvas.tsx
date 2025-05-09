
import React, { useRef, useEffect } from "react";

interface LayoutCanvasProps {
  paperWidth: number;
  paperHeight: number;
  jobWidth: number;
  jobHeight: number;
  rotation: boolean;
  printPerSheet: number;
  detailed?: boolean;
  width?: number;
  height?: number;
}

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  paperWidth,
  paperHeight,
  jobWidth,
  jobHeight,
  rotation,
  printPerSheet,
  detailed = false,
  width = detailed ? 800 : 400,
  height = detailed ? 500 : 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If paper dimensions aren't set yet or job dimensions aren't set, show placeholder
    if (!paperWidth || !paperHeight || !jobWidth || !jobHeight) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(!paperWidth || !paperHeight ? 'กรุณาเลือกประเภทกระดาษ' : 'กรุณาระบุขนาดงาน', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Scale factor to fit the paper on canvas
    const padding = detailed ? 30 : 20;
    const scale = Math.min(
      (canvas.width - padding * 2) / paperWidth,
      (canvas.height - padding * 2) / paperHeight
    );
    
    // Draw paper
    ctx.fillStyle = detailed ? '#ffffff' : '#f3f4f6';
    ctx.fillRect(padding, padding, paperWidth * scale, paperHeight * scale);
    ctx.strokeStyle = detailed ? '#000000' : '#d1d5db';
    ctx.lineWidth = detailed ? 2 : 1;
    ctx.strokeRect(padding, padding, paperWidth * scale, paperHeight * scale);
    
    // Calculate layout
    const jobWidthInch = jobWidth / 2.54;
    const jobHeightInch = jobHeight / 2.54;
    const effectiveJobWidth = rotation ? jobHeightInch : jobWidthInch;
    const effectiveJobHeight = rotation ? jobWidthInch : jobHeightInch;
    
    const cols = Math.floor(paperWidth / effectiveJobWidth);
    const rows = Math.floor(paperHeight / effectiveJobHeight);
    
    // Draw job items
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rectX = padding + (x * effectiveJobWidth * scale);
        const rectY = padding + (y * effectiveJobHeight * scale);
        const rectWidth = effectiveJobWidth * scale;
        const rectHeight = effectiveJobHeight * scale;
        
        // Set different colors for detailed view
        if (detailed) {
          ctx.fillStyle = y % 2 === 0 ? '#e6f0fd' : '#bfdbfe';
        } else {
          ctx.fillStyle = '#bfdbfe';
        }
        
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = detailed ? 1.5 : 2;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        
        // Add item number
        ctx.fillStyle = '#1e40af';
        ctx.font = detailed ? '14px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${y * cols + x + 1}`, 
          rectX + rectWidth / 2, 
          rectY + rectHeight / 2
        );
        
        // Reset fill style for next item
        if (detailed) {
          ctx.fillStyle = y % 2 === 0 ? '#e6f0fd' : '#bfdbfe';
        } else {
          ctx.fillStyle = '#bfdbfe';
        }
      }
    }
  }, [paperWidth, paperHeight, jobWidth, jobHeight, rotation, printPerSheet, detailed, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="w-full h-auto"
    />
  );
};

export default LayoutCanvas;
