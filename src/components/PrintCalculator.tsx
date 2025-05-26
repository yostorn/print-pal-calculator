
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ValidationError from "./calculator/ValidationError";
import BasicJobInfo from "./calculator/BasicJobInfo";
import JobBasicInfo from "./calculator/JobBasicInfo";
import JobActions from "./calculator/JobActions";
import CoatingOptions from "./CoatingOptions";
import OptionalCostInputs from "./calculator/OptionalCostInputs";
import QuantityInputs from "./calculator/QuantityInputs";
import CalculationSettings from "./calculator/CalculationSettings";
import ResultsPreview from "./calculator/ResultsPreview";
import AdditionalCostsManager, { AdditionalCost } from "./calculator/AdditionalCostsManager";
import PaperSizeSelection from "./calculator/PaperSizeSelection";
import PlateTypeSelection from "./calculator/PlateTypeSelection";
import PrintsPerSheetAdjustment from "./calculator/PrintsPerSheetAdjustment";
import CalculationActions from "./calculator/CalculationActions";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPaperSizes } from "@/services/supabaseService";
import { createJob, updateJob, Job } from "@/services/jobService";
import { useToast } from "@/hooks/use-toast";
import SpotUvOptions from "./SpotUvOptions";

const PrintCalculator = () => {
  const calc = usePrintCalculation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Job management state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobName, setJobName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [quoteBy, setQuoteBy] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Additional costs state
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  
  // Manual adjustment for prints per sheet
  const [manualPrintCount, setManualPrintCount] = useState(calc.printPerSheet.toString());

  // Load job data if passed from Jobs page
  useEffect(() => {
    const jobData = location.state?.jobData as Job;
    if (jobData) {
      console.log("Loading job data:", jobData);
      
      setCurrentJobId(jobData.id);
      setJobName(jobData.job_name);
      setCustomerName(jobData.customer_name);
      setQuoteBy(jobData.quote_by);
      
      // Load calculator state
      if (jobData.job_type) calc.setJobType(jobData.job_type);
      if (jobData.paper_type) calc.setPaperType(jobData.paper_type);
      if (jobData.paper_grammage) calc.setPaperGrammage(jobData.paper_grammage);
      if (jobData.supplier) calc.setSupplier(jobData.supplier);
      if (jobData.width) calc.setWidth(jobData.width);
      if (jobData.height) calc.setHeight(jobData.height);
      if (jobData.size_unit) calc.setSizeUnit(jobData.size_unit);
      if (jobData.colors) calc.setColors(jobData.colors);
      if (jobData.base_colors) calc.setBaseColors(jobData.base_colors);
      if (jobData.selected_paper_size) calc.setSelectedPaperSize(jobData.selected_paper_size);
      if (jobData.plate_type) calc.setPlateType(jobData.plate_type);
      if (jobData.print_per_sheet) calc.setPrintPerSheet(jobData.print_per_sheet);
      if (jobData.selected_coating) calc.setSelectedCoating(jobData.selected_coating);
      if (jobData.selected_coating_size) calc.setSelectedCoatingSize(jobData.selected_coating_size);
      if (jobData.has_spot_uv !== undefined) calc.setHasSpotUv(jobData.has_spot_uv);
      if (jobData.selected_spot_uv_size) calc.setSelectedSpotUvSize(jobData.selected_spot_uv_size);
      if (jobData.has_die_cut !== undefined) calc.setHasDieCut(jobData.has_die_cut);
      if (jobData.die_cut_cost) calc.setDieCutCost(jobData.die_cut_cost);
      if (jobData.has_base_print !== undefined) calc.setHasBasePrint(jobData.has_base_print);
      if (jobData.base_print_cost) calc.setBasePrintCost(jobData.base_print_cost);
      if (jobData.shipping_cost) calc.setShippingCost(jobData.shipping_cost);
      if (jobData.packaging_cost) calc.setPackagingCost(jobData.packaging_cost);
      if (jobData.additional_costs) setAdditionalCosts(jobData.additional_costs);
      if (jobData.quantities) {
        // Convert numbers to strings if needed
        const stringQuantities = Array.isArray(jobData.quantities) 
          ? jobData.quantities.map(q => typeof q === 'number' ? q.toString() : q)
          : jobData.quantities;
        calc.setQuantities(stringQuantities);
      }
      if (jobData.wastage) calc.setWastage(jobData.wastage);
      if (jobData.profit_margin) calc.setProfitMargin(jobData.profit_margin);
      if (jobData.results) calc.setResults(jobData.results);
      if (jobData.breakdowns) calc.setBreakdowns(jobData.breakdowns);
      if (jobData.selected_quantity_index !== undefined) calc.setSelectedQuantityIndex(jobData.selected_quantity_index);
      
      setHasUnsavedChanges(false);
      
      // Clear the location state to prevent re-loading
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Track changes to mark as unsaved
  useEffect(() => {
    if (currentJobId) {
      setHasUnsavedChanges(true);
    }
  }, [
    jobName, customerName, quoteBy,
    calc.jobType, calc.paperType, calc.paperGrammage, calc.supplier,
    calc.width, calc.height, calc.colors, calc.baseColors,
    calc.plateType, calc.printPerSheet, calc.selectedCoating,
    calc.selectedCoatingSize, calc.hasSpotUv, calc.selectedSpotUvSize,
    calc.hasDieCut, calc.dieCutCost, calc.hasBasePrint, calc.basePrintCost,
    calc.shippingCost, calc.packagingCost, additionalCosts,
    calc.quantities, calc.wastage, calc.profitMargin
  ]);

  // Fetch paper sizes based on selected paper type
  const { data: paperSizes, isLoading: isLoadingPaperSizes, error: paperSizesError } = useQuery({
    queryKey: ['paperSizes', calc.paperType],
    queryFn: () => fetchPaperSizes(calc.paperType),
    enabled: !!calc.paperType
  });

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: (jobData: any) => {
      if (currentJobId) {
        return updateJob(currentJobId, jobData);
      } else {
        return createJob(jobData);
      }
    },
    onSuccess: (data) => {
      if (data && typeof data === 'object' && 'id' in data) {
        setCurrentJobId(data.id as string);
      }
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: currentJobId ? "อัพเดทงานสำเร็จ" : "บันทึกงานสำเร็จ",
        description: `งาน "${jobName}" ได้ถูกบันทึกแล้ว`
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกงานได้",
        variant: "destructive"
      });
      console.error("Error saving job:", error);
    }
  });

  // Handle paper size selection
  const handlePaperSizeChange = (sizeId: string) => {
    const selectedSize = paperSizes?.find(size => size.id === sizeId);
    if (selectedSize) {
      calc.setSelectedPaperSize({
        width: selectedSize.width,
        height: selectedSize.height
      });
      
      setTimeout(() => calc.forceLayoutCalculation(), 100);
      
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

  // Handle basic calculation (show results in current page)
  const handleCalculate = () => {
    console.log("Calculate button clicked");
    
    calc.setBypassLayoutValidation(true);
    const currentUnit = calc.sizeUnit;
    
    if (calc.calculate()) {
      toast({
        title: "คำนวณเสร็จสิ้น",
        description: "ดูผลการคำนวณด้านล่าง หรือไปหน้าตารางสรุปเพื่อดูรายละเอียด"
      });
      
      if (currentUnit !== calc.sizeUnit) {
        calc.setSizeUnit(currentUnit);
      }
    } else {
      toast({
        title: "ไม่สามารถคำนวณได้",
        description: calc.validationError || "กรุณาตรวจสอบข้อมูลให้ถูกต้อง",
        variant: "destructive"
      });
    }
  };

  // Handle navigation to detailed cost preview
  const handleGoToSummary = () => {
    const calculationData = {
      results: calc.results,
      breakdowns: calc.breakdowns,
      quantities: calc.quantities,
      width: calc.width,
      height: calc.height,
      sizeUnit: calc.sizeUnit,
      colors: calc.colors,
      paperType: calc.paperType,
      plateType: calc.plateType,
      selectedQuantityIndex: calc.selectedQuantityIndex,
      additionalCosts: additionalCosts
    };

    localStorage.setItem("print_calculator_results", JSON.stringify(calculationData));
    navigate('/cost-preview', { state: calculationData });
  };

  // Handle save job
  const handleSaveJob = () => {
    if (!jobName.trim() || !customerName.trim() || !quoteBy.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่องาน, ชื่อลูกค้า และผู้ทำใบราคาเป็นข้อมูลที่จำเป็น",
        variant: "destructive"
      });
      return;
    }

    const jobData = {
      job_name: jobName,
      customer_name: customerName,
      quote_by: quoteBy,
      job_type: calc.jobType,
      paper_type: calc.paperType,
      paper_grammage: calc.paperGrammage,
      supplier: calc.supplier,
      width: calc.width,
      height: calc.height,
      size_unit: calc.sizeUnit,
      colors: calc.colors,
      base_colors: calc.baseColors,
      selected_paper_size: calc.selectedPaperSize,
      plate_type: calc.plateType,
      print_per_sheet: calc.printPerSheet,
      selected_coating: calc.selectedCoating,
      selected_coating_size: calc.selectedCoatingSize,
      has_spot_uv: calc.hasSpotUv,
      selected_spot_uv_size: calc.selectedSpotUvSize,
      has_die_cut: calc.hasDieCut,
      die_cut_cost: calc.dieCutCost,
      has_base_print: calc.hasBasePrint,
      base_print_cost: calc.basePrintCost,
      shipping_cost: calc.shippingCost,
      packaging_cost: calc.packagingCost,
      additional_costs: additionalCosts,
      quantities: calc.quantities,
      wastage: calc.wastage,
      profit_margin: calc.profitMargin,
      results: calc.results,
      breakdowns: calc.breakdowns,
      selected_quantity_index: calc.selectedQuantityIndex
    };

    saveJobMutation.mutate(jobData);
  };

  // Handle save as new job
  const handleSaveAsNew = () => {
    setCurrentJobId(null);
    handleSaveJob();
  };

  // Handle delete job
  const handleDeleteJob = () => {
    if (currentJobId && window.confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
      // Navigate to Jobs page which will handle the deletion
      navigate('/jobs');
    }
  };

  // Check if can save
  const canSave = jobName.trim() && customerName.trim() && quoteBy.trim();
  const isNewJob = !currentJobId;
  const hasResults = calc.results && calc.results.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Print Pal Calculator</CardTitle>
          <JobActions
            isNewJob={isNewJob}
            hasUnsavedChanges={hasUnsavedChanges}
            canSave={canSave}
            onSave={handleSaveJob}
            onSaveAs={handleSaveAsNew}
            onDelete={currentJobId ? handleDeleteJob : undefined}
            currentJobName={currentJobId ? jobName : undefined}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - inputs */}
          <div className="space-y-4">
            <JobBasicInfo
              jobName={jobName}
              customerName={customerName}
              quoteBy={quoteBy}
              onJobNameChange={setJobName}
              onCustomerNameChange={setCustomerName}
              onQuoteByChange={setQuoteBy}
            />

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
              baseColors={calc.baseColors}
              onBaseColorsChange={calc.setBaseColors}
            />

            <PaperSizeSelection
              paperType={calc.paperType}
              paperSizes={paperSizes}
              isLoadingPaperSizes={isLoadingPaperSizes}
              paperSizesError={paperSizesError}
              selectedPaperSize={calc.selectedPaperSize}
              onPaperSizeChange={handlePaperSizeChange}
            />

            <PlateTypeSelection
              plateType={calc.plateType}
              onPlateTypeChange={calc.setPlateType}
            />

            <PrintsPerSheetAdjustment
              selectedPaperSize={calc.selectedPaperSize}
              width={calc.width}
              height={calc.height}
              manualPrintCount={manualPrintCount}
              onPrintCountChange={handlePrintCountChange}
              onIncrementPrintCount={incrementPrintCount}
              onDecrementPrintCount={decrementPrintCount}
            />

            <CoatingOptions
              selectedCoating={calc.selectedCoating}
              selectedCoatingSize={calc.selectedCoatingSize}
              onCoatingChange={calc.setSelectedCoating}
              onCoatingSizeChange={calc.setSelectedCoatingSize}
            />

            <SpotUvOptions
              hasSpotUv={calc.hasSpotUv}
              selectedSpotUvSize={calc.selectedSpotUvSize}
              onSpotUvChange={calc.setHasSpotUv}
              onSpotUvSizeChange={calc.setSelectedSpotUvSize}
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

            <AdditionalCostsManager
              additionalCosts={additionalCosts}
              onCostsChange={setAdditionalCosts}
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

            <CalculationActions
              paperType={calc.paperType}
              selectedPaperSize={calc.selectedPaperSize}
              width={calc.width}
              height={calc.height}
              hasResults={hasResults}
              onCalculate={handleCalculate}
              onGoToSummary={handleGoToSummary}
            />
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
