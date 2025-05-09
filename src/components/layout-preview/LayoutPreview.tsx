
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw, Eye } from "lucide-react";
import { calculateLayout, getLayoutDescription, getSuitablePaperSizes } from "@/utils/layoutCalculations";
import LayoutCanvas from "./LayoutCanvas";
import LayoutDetailsView from "./LayoutDetailsView";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutPreviewProps {
  paperWidth: number;  // Width of paper in inches
  paperHeight: number; // Height of paper in inches
  jobWidth: number;    // Width of job in cm
  jobHeight: number;   // Height of job in cm
  onLayoutChange: (printPerSheet: number) => void;
  paperSizes?: { id: string; name: string; width: number; height: number }[];
  onPaperSizeChange?: (sizeId: string) => void;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  paperWidth,
  paperHeight,
  jobWidth,
  jobHeight,
  onLayoutChange,
  paperSizes,
  onPaperSizeChange
}) => {
  const isMobile = useIsMobile();
  const [rotation, setRotation] = useState<boolean>(false);
  const [printPerSheet, setPrintPerSheet] = useState<number>(0);
  const [wastePercentage, setWastePercentage] = useState<number>(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [suitableSizes, setSuitableSizes] = useState<any[]>([]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  
  const computeLayout = useCallback(() => {
    console.log("Computing layout with:", { paperWidth, paperHeight, jobWidth, jobHeight });
    const result = calculateLayout(paperWidth, paperHeight, jobWidth, jobHeight);
    
    // Set state with calculation results
    setPrintPerSheet(result.printPerSheet);
    setWastePercentage(result.wastePercentage);
    setRotation(result.shouldRotate);
    
    // Notify parent component about the layout change
    onLayoutChange(result.printPerSheet);
    
    return result;
  }, [paperWidth, paperHeight, jobWidth, jobHeight, onLayoutChange]);
  
  // Find suitable paper sizes for the job
  useEffect(() => {
    if (paperSizes && paperSizes.length > 0 && jobWidth && jobHeight) {
      const suitable = getSuitablePaperSizes(paperSizes, jobWidth, jobHeight);
      setSuitableSizes(suitable);
      
      // If we found suitable sizes and there's an onPaperSizeChange handler,
      // suggest the most efficient size
      if (suitable.length > 0 && onPaperSizeChange) {
        setSelectedSizeIndex(0);
        // Only call onPaperSizeChange when we actually have new data
        onPaperSizeChange(suitable[0].id);
      }
    }
  }, [paperSizes, jobWidth, jobHeight, onPaperSizeChange]);
  
  useEffect(() => {
    console.log("LayoutPreview useEffect triggered with:", { paperWidth, paperHeight, jobWidth, jobHeight });
    if (paperWidth && paperHeight && jobWidth && jobHeight) {
      computeLayout();
    } else {
      // Reset values if we don't have all dimensions
      setPrintPerSheet(0);
      setWastePercentage(0);
      onLayoutChange(0);
    }
  }, [paperWidth, paperHeight, jobWidth, jobHeight, computeLayout, onLayoutChange]);
  
  const toggleRotation = () => {
    setRotation(!rotation);
    // Recalculate with manually toggled rotation
    const jobWidthInch = jobWidth / 2.54;
    const jobHeightInch = jobHeight / 2.54;
    const effectiveJobWidth = !rotation ? jobHeightInch : jobWidthInch;
    const effectiveJobHeight = !rotation ? jobWidthInch : jobHeightInch;
    
    const cols = Math.floor(paperWidth / effectiveJobWidth);
    const rows = Math.floor(paperHeight / effectiveJobHeight);
    const totalPrints = cols * rows;
    
    setPrintPerSheet(totalPrints);
    onLayoutChange(totalPrints);
    
    // Recalculate waste percentage
    const usedArea = totalPrints * (effectiveJobWidth * effectiveJobHeight);
    const totalArea = paperWidth * paperHeight;
    const waste = ((totalArea - usedArea) / totalArea) * 100;
    setWastePercentage(parseFloat(waste.toFixed(2)));
  };

  const handleOpenDetails = () => {
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Function to handle changing paper size selection from the suggestions
  const handleChangePaperSize = (index: number) => {
    if (suitableSizes && suitableSizes.length > index) {
      setSelectedSizeIndex(index);
      if (onPaperSizeChange) {
        onPaperSizeChange(suitableSizes[index].id);
      }
    }
  };

  const hasSufficientData = !!paperWidth && !!paperHeight && !!jobWidth && !!jobHeight;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">แบบการวางงาน</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={toggleRotation}
              disabled={!hasSufficientData}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              หมุน
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenDetails}
              disabled={!hasSufficientData}
            >
              <Eye className="h-4 w-4 mr-1" />
              ดูรายละเอียด
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-1">
            พิมพ์ได้: <strong>{printPerSheet || 0}</strong> ชิ้น/แผ่น
          </p>
          <p className="text-sm text-gray-700">
            เปอร์เซ็นต์ waste: <strong>{wastePercentage || 0}%</strong>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {getLayoutDescription(jobWidth, jobHeight, paperWidth, paperHeight, printPerSheet, rotation)}
          </p>

          {/* Paper Size Suggestions */}
          {suitableSizes.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-700">ขนาดกระดาษแนะนำ:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suitableSizes.slice(0, 3).map((size, index) => (
                  <Button 
                    key={size.id} 
                    size="sm"
                    variant={selectedSizeIndex === index ? "default" : "outline"}
                    onClick={() => handleChangePaperSize(index)}
                    className="text-xs"
                  >
                    {size.name} ({size.printPerSheet} ชิ้น, waste {size.wastePercentage}%)
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border rounded bg-gray-50">
          <LayoutCanvas 
            paperWidth={paperWidth} 
            paperHeight={paperHeight}
            jobWidth={jobWidth}
            jobHeight={jobHeight}
            rotation={rotation}
            printPerSheet={printPerSheet}
          />
        </div>

        {/* Details View (Dialog or Sheet) */}
        <LayoutDetailsView
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
          isMobile={isMobile}
          paperWidth={paperWidth}
          paperHeight={paperHeight}
          jobWidth={jobWidth}
          jobHeight={jobHeight}
          rotation={rotation}
          onRotate={toggleRotation}
          printPerSheet={printPerSheet}
          wastePercentage={wastePercentage}
        />
      </CardContent>
    </Card>
  );
};

export default LayoutPreview;
