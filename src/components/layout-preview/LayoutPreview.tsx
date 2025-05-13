
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // เพิ่ม Input
import { Label } from "@/components/ui/label"; // เพิ่ม Label
import { RotateCw, Eye, AlertCircle, Ruler } from "lucide-react";
import { calculateLayout, getLayoutDescription, getSuitablePaperSizes } from "@/utils/layoutCalculations";
import LayoutCanvas from "./LayoutCanvas";
import LayoutDetailsView from "./LayoutDetailsView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [calculationAttempted, setCalculationAttempted] = useState(false);
  
  // Custom size inputs
  const [customWidth, setCustomWidth] = useState(paperWidth?.toString() || "");
  const [customHeight, setCustomHeight] = useState(paperHeight?.toString() || "");
  const [useCustomSize, setUseCustomSize] = useState(false);
  
  // Use refs to track previous values
  const prevValuesRef = useRef({
    paperWidth,
    paperHeight,
    jobWidth,
    jobHeight
  });
  
  // Update custom sizes when paper size changes (if not using custom)
  useEffect(() => {
    if (!useCustomSize && paperWidth && paperHeight) {
      setCustomWidth(paperWidth.toString());
      setCustomHeight(paperHeight.toString());
    }
  }, [paperWidth, paperHeight, useCustomSize]);
  
  const computeLayout = useCallback(() => {
    console.log("Computing layout with:", { 
      paperWidth: useCustomSize ? parseFloat(customWidth) || 0 : paperWidth, 
      paperHeight: useCustomSize ? parseFloat(customHeight) || 0 : paperHeight, 
      jobWidth, 
      jobHeight, 
      calculationAttempted,
      useCustomSize
    });
    
    // Get effective width and height based on custom size setting
    const effectivePaperWidth = useCustomSize ? parseFloat(customWidth) || 0 : paperWidth;
    const effectivePaperHeight = useCustomSize ? parseFloat(customHeight) || 0 : paperHeight;
    
    // Set flag to indicate calculation was attempted
    setCalculationAttempted(true);
    
    // Handle invalid inputs gracefully
    if (!effectivePaperWidth || !effectivePaperHeight || !jobWidth || !jobHeight) {
      console.warn("Invalid dimensions for layout calculation:", {
        effectivePaperWidth, effectivePaperHeight, jobWidth, jobHeight
      });
      setPrintPerSheet(0);
      setWastePercentage(0);
      
      // Always notify parent even if calculation fails
      onLayoutChange(0);
      return { printPerSheet: 0, wastePercentage: 0 };
    }

    // Convert dimensions if needed (job dimensions are in cm)
    const jobWidthInch = jobWidth / 2.54;
    const jobHeightInch = jobHeight / 2.54;
    
    // Calculate layout using the utility function
    const result = calculateLayout(effectivePaperWidth, effectivePaperHeight, jobWidthInch, jobHeightInch);
    
    console.log("Layout calculation result:", result);
    
    // Set state with calculation results
    setPrintPerSheet(result.printPerSheet);
    setWastePercentage(result.wastePercentage);
    setRotation(result.shouldRotate);
    
    // Notify parent component about the layout change
    onLayoutChange(result.printPerSheet);
    
    return result;
  }, [paperWidth, paperHeight, jobWidth, jobHeight, onLayoutChange, calculationAttempted, customWidth, customHeight, useCustomSize]);
  
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
    console.log("LayoutPreview useEffect triggered with:", { 
      paperWidth, 
      paperHeight, 
      jobWidth, 
      jobHeight,
      customWidth,
      customHeight,
      useCustomSize
    });
    
    // Get previous values from ref
    const { paperWidth: prevPaperWidth, 
            paperHeight: prevPaperHeight, 
            jobWidth: prevJobWidth, 
            jobHeight: prevJobHeight } = prevValuesRef.current;
    
    // Clear the calculation attempted flag when dimensions change
    if (paperWidth !== prevPaperWidth || 
        paperHeight !== prevPaperHeight || 
        jobWidth !== prevJobWidth || 
        jobHeight !== prevJobHeight) {
      setCalculationAttempted(false);
    }
    
    // Update ref with current values for next comparison
    prevValuesRef.current = {
      paperWidth,
      paperHeight,
      jobWidth,
      jobHeight
    };
    
    // Check if we have either standard paper dimensions or custom ones
    const hasPaperDimensions = (paperWidth && paperHeight) || 
                              (useCustomSize && parseFloat(customWidth) > 0 && parseFloat(customHeight) > 0);
                              
    if (hasPaperDimensions && jobWidth && jobHeight) {
      computeLayout();
    } else {
      // Reset values if we don't have all dimensions
      setPrintPerSheet(0);
      setWastePercentage(0);
      onLayoutChange(0);
    }
  }, [paperWidth, paperHeight, jobWidth, jobHeight, computeLayout, onLayoutChange, customWidth, customHeight, useCustomSize]);
  
  // Apply custom size and recalculate
  const handleApplyCustomSize = () => {
    if (parseFloat(customWidth) > 0 && parseFloat(customHeight) > 0) {
      setUseCustomSize(true);
      computeLayout();
    }
  };
  
  // Reset to selected paper size
  const handleResetSize = () => {
    setUseCustomSize(false);
    setCustomWidth(paperWidth?.toString() || "");
    setCustomHeight(paperHeight?.toString() || "");
    computeLayout();
  };
  
  const toggleRotation = () => {
    setRotation(!rotation);
    // Recalculate with manually toggled rotation
    const jobWidthInch = jobWidth / 2.54;
    const jobHeightInch = jobHeight / 2.54;
    const effectiveJobWidth = !rotation ? jobHeightInch : jobWidthInch;
    const effectiveJobHeight = !rotation ? jobWidthInch : jobHeightInch;
    
    // Use custom size if enabled
    const effectivePaperWidth = useCustomSize ? parseFloat(customWidth) || 0 : paperWidth;
    const effectivePaperHeight = useCustomSize ? parseFloat(customHeight) || 0 : paperHeight;
    
    const cols = Math.floor(effectivePaperWidth / effectiveJobWidth);
    const rows = Math.floor(effectivePaperHeight / effectiveJobHeight);
    const totalPrints = cols * rows;
    
    console.log("Manual rotation toggled:", {
      rotation: !rotation, 
      effectiveJobWidth, 
      effectiveJobHeight, 
      cols, 
      rows, 
      totalPrints
    });
    
    setPrintPerSheet(totalPrints);
    onLayoutChange(totalPrints);
    
    // Recalculate waste percentage
    const usedArea = totalPrints * (effectiveJobWidth * effectiveJobHeight);
    const totalArea = effectivePaperWidth * effectivePaperHeight;
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
  
  // Force a recalculation of the layout
  const handleForceCalculation = () => {
    if (useCustomSize ? 
        (parseFloat(customWidth) > 0 && parseFloat(customHeight) > 0) : 
        (paperWidth && paperHeight)) {
      console.log("Forcing layout recalculation");
      computeLayout();
    }
  };

  const hasSufficientData = useCustomSize ? 
    (parseFloat(customWidth) > 0 && parseFloat(customHeight) > 0 && jobWidth > 0 && jobHeight > 0) : 
    (!!paperWidth && !!paperHeight && !!jobWidth && !!jobHeight);
    
  const showError = calculationAttempted && !printPerSheet && hasSufficientData;
  
  // Get effective paper dimensions
  const effectivePaperWidth = useCustomSize ? parseFloat(customWidth) || 0 : paperWidth;
  const effectivePaperHeight = useCustomSize ? parseFloat(customHeight) || 0 : paperHeight;

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
        {/* Custom Paper Size Section */}
        <div className="mb-4 p-3 bg-gray-50 border rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="h-4 w-4 text-gray-600" />
            <h3 className="font-medium">ปรับขนาดกระดาษด้วยตนเอง (นิ้ว)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <Label htmlFor="customWidth" className="text-xs">ความกว้าง</Label>
              <Input 
                id="customWidth" 
                type="number" 
                step="0.01"
                value={customWidth} 
                onChange={(e) => setCustomWidth(e.target.value)}
                className="h-8"
                placeholder="กว้าง (นิ้ว)"
              />
            </div>
            <div>
              <Label htmlFor="customHeight" className="text-xs">ความสูง</Label>
              <Input 
                id="customHeight" 
                type="number"
                step="0.01" 
                value={customHeight} 
                onChange={(e) => setCustomHeight(e.target.value)}
                className="h-8"
                placeholder="สูง (นิ้ว)"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleApplyCustomSize}
              disabled={!(parseFloat(customWidth) > 0 && parseFloat(customHeight) > 0)}
            >
              ใช้ขนาดนี้
            </Button>
            {useCustomSize && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleResetSize}
                disabled={!paperWidth || !paperHeight}
              >
                กลับไปใช้ขนาดเดิม
              </Button>
            )}
          </div>
          
          {useCustomSize && (
            <Alert className="mt-2 py-2 bg-blue-50 text-blue-700 border-blue-200">
              <AlertDescription>
                กำลังใช้ขนาดกระดาษที่กำหนดเอง: {customWidth}" × {customHeight}"
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-1">
            พิมพ์ได้: <strong>{printPerSheet || 0}</strong> ชิ้น/แผ่น
          </p>
          <p className="text-sm text-gray-700">
            เปอร์เซ็นต์ waste: <strong>{wastePercentage || 0}%</strong>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {getLayoutDescription(jobWidth, jobHeight, effectivePaperWidth, effectivePaperHeight, printPerSheet, rotation)}
          </p>

          {showError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                ไม่สามารถคำนวณการจัดวางได้ ขนาดงานอาจใหญ่เกินกว่าขนาดกระดาษ
              </AlertDescription>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 bg-white" 
                onClick={handleForceCalculation}
              >
                ลองคำนวณใหม่
              </Button>
            </Alert>
          )}

          {/* Paper Size Suggestions */}
          {suitableSizes.length > 0 && !useCustomSize && (
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
            paperWidth={effectivePaperWidth} 
            paperHeight={effectivePaperHeight}
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
          paperWidth={effectivePaperWidth}
          paperHeight={effectivePaperHeight}
          jobWidth={jobWidth}
          jobHeight={jobHeight}
          rotation={rotation}
          onRotate={toggleRotation}
          printPerSheet={printPerSheet}
          wastePercentage={wastePercentage}
          useCustomSize={useCustomSize}
          customWidth={customWidth}
          customHeight={customHeight}
          onCustomWidthChange={setCustomWidth}
          onCustomHeightChange={setCustomHeight}
          onApplyCustomSize={handleApplyCustomSize}
          onResetSize={handleResetSize}
        />
      </CardContent>
    </Card>
  );
};

export default LayoutPreview;
