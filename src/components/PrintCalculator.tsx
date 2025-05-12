
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import LayoutPreview from "./layout-preview/LayoutPreview";
import ValidationError from "./calculator/ValidationError";
import BasicJobInfo from "./calculator/BasicJobInfo";
import CoatingOptions from "./CoatingOptions";
import OptionalCostInputs from "./calculator/OptionalCostInputs";
import QuantityInputs from "./calculator/QuantityInputs";
import CalculationSettings from "./calculator/CalculationSettings";
import ResultsPreview from "./calculator/ResultsPreview";
import LayoutDetailsDialog from "./calculator/LayoutDetailsDialog";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperSizes } from "@/services/supabaseService";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertCircle } from "lucide-react";

const PrintCalculator = () => {
  const calc = usePrintCalculation();

  // Fetch paper sizes based on selected paper type
  const { data: paperSizes, isLoading: isLoadingPaperSizes, error: paperSizesError } = useQuery({
    queryKey: ['paperSizes', calc.paperType],
    queryFn: () => fetchPaperSizes(calc.paperType),
    enabled: !!calc.paperType
  });

  // Debug logs to track data flow
  console.log("Paper type in PrintCalculator:", calc.paperType);
  console.log("Paper sizes API response:", paperSizes);

  // Handle paper size selection
  const handlePaperSizeChange = (sizeId: string) => {
    const selectedSize = paperSizes?.find(size => size.id === sizeId);
    if (selectedSize) {
      calc.setSelectedPaperSize({
        width: selectedSize.width,
        height: selectedSize.height
      });
      
      // Force layout calculation with the new paper size
      setTimeout(() => calc.forceLayoutCalculation(), 100);
      
      // Clear validation errors related to paper size
      if (calc.validationError && 
         (calc.validationError.includes("กระดาษ") || 
          calc.validationError.includes("ขนาด"))) {
        calc.setValidationError("");
      }
    }
  };

  // Show a warning if paper type is selected but no paper size is selected
  useEffect(() => {
    if (calc.paperType && !calc.selectedPaperSize && !isLoadingPaperSizes) {
      console.log("Paper type selected but no paper size selected.");
    }
  }, [calc.paperType, calc.selectedPaperSize, isLoadingPaperSizes]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Print Pal Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - inputs */}
          <div className="space-y-4">
            <ValidationError error={calc.validationError} />

            <BasicJobInfo
              jobType={calc.jobType}
              onJobTypeChange={calc.setJobType}
              paperType={calc.paperType}
              onPaperTypeChange={calc.setPaperType}
              paperGrammage={calc.paperGrammage}
              onPaperGrammageChange={calc.setPaperGrammage}
              supplier={calc.supplier}
              onSupplierChange={calc.setSupplier}
              width={calc.width}
              height={calc.height}
              onWidthChange={calc.setWidth}
              onHeightChange={calc.setHeight}
              onUnitChange={calc.setSizeUnit}
              colors={calc.colors}
              onColorsChange={calc.setColors}
            />

            {/* Paper Size Selection */}
            {calc.paperType && (
              <div className="rounded-md border p-4">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="paperSize" className="text-sm font-medium">
                    ขนาดกระดาษ
                  </Label>
                  {!calc.selectedPaperSize && !isLoadingPaperSizes && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> กรุณาเลือกขนาดกระดาษ
                    </span>
                  )}
                </div>
                
                {isLoadingPaperSizes ? (
                  <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md"></div>
                ) : paperSizesError ? (
                  <div className="text-sm text-red-500">ไม่สามารถโหลดขนาดกระดาษได้ ({paperSizesError.message})</div>
                ) : (
                  <Select 
                    onValueChange={handlePaperSizeChange}
                    value={paperSizes?.find(s => 
                      calc.selectedPaperSize && 
                      s.width === calc.selectedPaperSize.width && 
                      s.height === calc.selectedPaperSize.height
                    )?.id}
                  >
                    <SelectTrigger id="paperSize" className="w-full">
                      <SelectValue placeholder="เลือกขนาดกระดาษ" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperSizes && paperSizes.length > 0 ? (
                        paperSizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} ({size.width}" × {size.height}")
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-sizes" disabled>
                          ไม่พบขนาดกระดาษ
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                
                {calc.selectedPaperSize && (
                  <p className="mt-2 text-sm text-green-600">
                    กระดาษขนาด {calc.selectedPaperSize.width}" × {calc.selectedPaperSize.height}"
                  </p>
                )}
              </div>
            )}

            <CoatingOptions
              selectedCoating={calc.selectedCoating}
              coatingCost={calc.coatingCost}
              onCoatingChange={calc.setSelectedCoating}
              onCoatingCostChange={calc.setCoatingCost}
            />

            <OptionalCostInputs
              hasDieCut={calc.hasDieCut}
              onDieCutChange={calc.setHasDieCut}
              dieCutCost={calc.dieCutCost}
              onDieCutCostChange={calc.setDieCutCost}
              shippingCost={calc.shippingCost}
              onShippingCostChange={calc.setShippingCost}
              packagingCost={calc.packagingCost}
              onPackagingCostChange={calc.setPackagingCost}
            />

            <div className="space-y-2">
              <label className="block font-medium mb-1">ปริมาณที่ต้องการคำนวณ</label>
              <QuantityInputs
                quantities={calc.quantities}
                onAddQuantity={calc.addQuantity}
                onRemoveQuantity={calc.removeQuantity}
                onUpdateQuantity={calc.updateQuantity}
              />
            </div>

            <CalculationSettings
              wastage={calc.wastage}
              onWastageChange={calc.setWastage}
              profitMargin={calc.profitMargin}
              onProfitMarginChange={calc.setProfitMargin}
            />

            {/* Layout details button */}
            <Button
              className="w-full mb-2"
              variant="outline"
              onClick={calc.handleOpenLayoutDetails}
            >
              <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียดการจัดวางงาน
            </Button>

            {/* Layout Details Dialog/Sheet */}
            <LayoutDetailsDialog
              isOpen={calc.isLayoutDetailsOpen}
              onOpenChange={calc.setIsLayoutDetailsOpen}
              paperSize={calc.selectedPaperSize}
              width={calc.width}
              height={calc.height}
              sizeUnit={calc.sizeUnit}
              printPerSheet={calc.printPerSheet}
              onLayoutChange={calc.handleLayoutChange}
              onPaperTypeChange={calc.setPaperType}
              onPaperSizeChange={calc.setSelectedPaperSize}
            />

            <Button 
              className="w-full" 
              onClick={calc.calculate}
              disabled={!calc.paperType || !calc.selectedPaperSize || !calc.width || !calc.height}
            >
              คำนวณ
            </Button>
          </div>

          {/* Right column - results */}
          <div className="space-y-4">
            <ResultsPreview
              selectedPaperSize={calc.selectedPaperSize}
              showPreview={calc.showPreview}
              width={calc.width}
              height={calc.height}
              printPerSheet={calc.printPerSheet}
              onLayoutChange={calc.handleLayoutChange}
              quantities={calc.quantities}
              results={calc.results}
              onSelectQuantity={calc.setSelectedQuantityIndex}
              selectedQuantityIndex={calc.selectedQuantityIndex}
              onViewLayoutDetails={calc.handleOpenLayoutDetails}
              breakdowns={calc.breakdowns}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintCalculator;
