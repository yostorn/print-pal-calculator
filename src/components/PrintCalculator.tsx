import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ValidationError from "./calculator/ValidationError";
import BasicJobInfo from "./calculator/BasicJobInfo";
import CoatingOptions from "./CoatingOptions";
import OptionalCostInputs from "./calculator/OptionalCostInputs";
import QuantityInputs from "./calculator/QuantityInputs";
import CalculationSettings from "./calculator/CalculationSettings";
import ResultsPreview from "./calculator/ResultsPreview";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperSizes } from "@/services/supabaseService";
import { Label } from "@/components/ui/label";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PrintCalculator = () => {
  const calc = usePrintCalculation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Manual adjustment for prints per sheet
  const [manualPrintCount, setManualPrintCount] = useState(calc.printPerSheet.toString());

  // Fetch paper sizes based on selected paper type
  const { data: paperSizes, isLoading: isLoadingPaperSizes, error: paperSizesError } = useQuery({
    queryKey: ['paperSizes', calc.paperType],
    queryFn: () => fetchPaperSizes(calc.paperType),
    enabled: !!calc.paperType
  });

  // Debug logs to track data flow
  console.log("PrintCalculator - Current state:", {
    paperType: calc.paperType,
    paperSizes,
    plateType: calc.plateType,
    cutsPerSheet: calc.cutsPerSheet,
    sizeUnit: calc.sizeUnit,
    width: calc.width,
    height: calc.height,
    validationError: calc.validationError,
    printPerSheet: calc.printPerSheet,
    results: calc.results,
    breakdowns: calc.breakdowns
  });

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

  // Update manual print count when automatic calculation changes
  useEffect(() => {
    setManualPrintCount(calc.printPerSheet.toString());
  }, [calc.printPerSheet]);

  // Handle manual print count adjustment
  const handlePrintCountChange = (value: string) => {
    setManualPrintCount(value);
    const count = parseInt(value);
    if (!isNaN(count) && count > 0) {
      calc.setPrintPerSheet(count);
    }
  };

  const incrementPrintCount = () => {
    const count = parseInt(manualPrintCount) || 0;
    const newCount = count + 1;
    setManualPrintCount(newCount.toString());
    calc.setPrintPerSheet(newCount);
  };

  const decrementPrintCount = () => {
    const count = parseInt(manualPrintCount) || 0;
    if (count > 1) {
      const newCount = count - 1;
      setManualPrintCount(newCount.toString());
      calc.setPrintPerSheet(newCount);
    }
  };

  // Show a warning if paper type is selected but no paper size is selected
  useEffect(() => {
    if (calc.paperType && !calc.selectedPaperSize && !isLoadingPaperSizes) {
      console.log("Paper type selected but no paper size selected.");
    }
  }, [calc.paperType, calc.selectedPaperSize, isLoadingPaperSizes]);

  // Handle calculation with navigation to preview
  const handleCalculate = () => {
    console.log("Calculate button clicked - pre-calculation state:", {
      width: calc.width,
      height: calc.height,
      sizeUnit: calc.sizeUnit,
      quantities: calc.quantities,
      printPerSheet: calc.printPerSheet
    });
    
    // Set bypass to true to allow calculation even with manual values
    calc.setBypassLayoutValidation(true);
    
    // Preserve the current unit to keep it after calculation
    const currentUnit = calc.sizeUnit;
    
    if (calc.calculate()) {
      // Show success toast
      toast({
        title: "คำนวณเสร็จสิ้น",
        description: "ผลการคำนวณแสดงที่ด้านขวา"
      });
      
      console.log("Calculation successful - post-calculation state:", {
        resultsLength: calc.results.length,
        breakdownsLength: calc.breakdowns.length,
        width: calc.width,
        height: calc.height,
        currentUnit: currentUnit
      });
      
      // Make sure unit is preserved
      if (currentUnit !== calc.sizeUnit) {
        console.log("Restoring unit to:", currentUnit);
        calc.setSizeUnit(currentUnit);
      }
    } else {
      // Show error toast
      toast({
        title: "ไม่สามารถคำนวณได้",
        description: calc.validationError || "กรุณาตรวจสอบข้อมูลให้ถูกต้อง",
        variant: "destructive"
      });
      console.log("Calculation failed:", calc.validationError);
    }
  };

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
                            {size.name} ({size.width}" × {size.height"})
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

            {/* Plate Type Selection */}
            <div className="rounded-md border p-4">
              <div className="mb-2">
                <Label className="text-sm font-medium">ประเภทเพลท</Label>
              </div>
              <RadioGroup 
                value={calc.plateType} 
                onValueChange={calc.setPlateType}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="plate-type-2" value="ตัด 2" />
                  <Label htmlFor="plate-type-2">ตัด 2</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="plate-type-4" value="ตัด 4" />
                  <Label htmlFor="plate-type-4">ตัด 4</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cuts Per Sheet Selection */}
            <div className="rounded-md border p-4">
              <div className="mb-2">
                <Label className="text-sm font-medium">จำนวนตัดกระดาษ</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={calc.cutsPerSheet.toString()}
                  onChange={(e) => calc.setCutsPerSheet(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm">ครั้ง</span>
                <div className="text-xs text-gray-500 ml-2">
                  กรณากระดาษแผ่นใหญ่มาตัด 1 จากกระดาษแผ่นใหญ่
                </div>
              </div>
            </div>

            {/* Manual Prints Per Sheet Adjustment */}
            {calc.selectedPaperSize && calc.width && calc.height && (
              <div className="rounded-md border p-4">
                <div className="mb-2">
                  <Label className="text-sm font-medium">จำนวนชิ้นต่อแผ่น</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={decrementPrintCount}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number"
                    value={manualPrintCount}
                    onChange={(e) => handlePrintCountChange(e.target.value)}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={incrementPrintCount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-green-600 ml-2">
                    เรียบร้อย! ชิ้นงานสามารถวางได้ {manualPrintCount} ชิ้นต่อแผ่น
                  </div>
                </div>
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
              hasBasePrint={calc.hasBasePrint}
              onBasePrintChange={calc.setHasBasePrint}
              basePrintCost={calc.basePrintCost}
              onBasePrintCostChange={calc.setBasePrintCost}
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

            <Button 
              className="w-full" 
              onClick={handleCalculate}
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
              breakdowns={calc.breakdowns}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintCalculator;
