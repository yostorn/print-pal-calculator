
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchPaperSizes } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { usePrintCalculation } from "@/hooks/use-print-calculation";
import { useJobManagement } from "@/hooks/use-job-management";
import JobManagementSection from "./calculator/JobManagementSection";
import CalculatorFormSection from "./calculator/CalculatorFormSection";
import ResultsPreview from "./calculator/ResultsPreview";

const PrintCalculator = () => {
  const calc = usePrintCalculation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the job management hook
  const { jobState, updateJobField, saveJobMutation, buildJobData } = useJobManagement(calc);
  
  // Manual adjustment for prints per sheet
  const [manualPrintCount, setManualPrintCount] = useState(calc.printPerSheet.toString());

  // Fetch paper sizes based on selected paper type
  const { data: paperSizes, isLoading: isLoadingPaperSizes, error: paperSizesError } = useQuery({
    queryKey: ['paperSizes', calc.paperType],
    queryFn: () => fetchPaperSizes(calc.paperType),
    enabled: !!calc.paperType
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
      additionalCosts: jobState.additionalCosts,
      // Add job info for PDF generation
      jobName: jobState.jobName,
      customerName: jobState.customerName,
      quoteBy: jobState.quoteBy,
      currentJobId: jobState.currentJobId
    };

    localStorage.setItem("print_calculator_results", JSON.stringify(calculationData));
    navigate('/cost-preview', { state: calculationData });
  };

  // Handle save job
  const handleSaveJob = () => {
    if (!jobState.jobName.trim() || !jobState.customerName.trim() || !jobState.quoteBy.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่องาน, ชื่อลูกค้า และผู้ทำใบราคาเป็นข้อมูลที่จำเป็น",
        variant: "destructive"
      });
      return;
    }

    const jobData = buildJobData();
    saveJobMutation.mutate(jobData);
  };

  // Handle save as new job
  const handleSaveAsNew = () => {
    updateJobField('currentJobId', null);
    handleSaveJob();
  };

  // Handle create new job
  const handleCreateNew = () => {
    // Reset all form data
    updateJobField('currentJobId', null);
    updateJobField('jobName', "");
    updateJobField('customerName', "");
    updateJobField('quoteBy', "");
    updateJobField('additionalCosts', []);
    updateJobField('hasUnsavedChanges', false);
    
    // Reset calculator state
    calc.setJobType("");
    calc.setPaperType("");
    calc.setPaperGrammage("");
    calc.setSupplier("");
    calc.setWidth("");
    calc.setHeight("");
    calc.setColors("1");
    calc.setBaseColors("0");
    calc.setSelectedPaperSize(null);
    calc.setPlateType("");
    calc.setPrintPerSheet(1);
    calc.setSelectedCoating("");
    calc.setSelectedCoatingSize("");
    calc.setHasSpotUv(false);
    calc.setSelectedSpotUvSize("");
    calc.setHasDieCut(false);
    calc.setDieCutCost("");
    calc.setHasBasePrint(false);
    calc.setBasePrintCost("");
    calc.setShippingCost("");
    calc.setPackagingCost("");
    calc.setQuantities(["100", "500", "1000"]);
    calc.setWastage(0.1);
    calc.setProfitMargin(0.3);
    calc.setResults([]);
    calc.setBreakdowns([]);
    calc.setSelectedQuantityIndex(0);
    calc.setValidationError("");
    
    toast({
      title: "สร้างงานใหม่",
      description: "ฟอร์มได้ถูกรีเซ็ตเพื่อสร้างงานใหม่"
    });
  };

  // Handle delete job
  const handleDeleteJob = () => {
    if (jobState.currentJobId && window.confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
      navigate('/jobs');
    }
  };

  // Check if can save
  const canSave = jobState.jobName.trim() && jobState.customerName.trim() && jobState.quoteBy.trim();
  const isNewJob = !jobState.currentJobId;
  const hasResults = calc.results && calc.results.length > 0;

  return (
    <div className="w-full">
      <JobManagementSection
        jobName={jobState.jobName}
        customerName={jobState.customerName}
        quoteBy={jobState.quoteBy}
        onJobNameChange={(value) => updateJobField('jobName', value)}
        onCustomerNameChange={(value) => updateJobField('customerName', value)}
        onQuoteByChange={(value) => updateJobField('quoteBy', value)}
        isNewJob={isNewJob}
        hasUnsavedChanges={jobState.hasUnsavedChanges}
        canSave={canSave}
        onSave={handleSaveJob}
        onSaveAs={handleSaveAsNew}
        onCreateNew={handleCreateNew}
        onDelete={jobState.currentJobId ? handleDeleteJob : undefined}
        currentJobName={jobState.currentJobId ? jobState.jobName : undefined}
        isSaving={saveJobMutation.isPending}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Print Pal Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - inputs */}
            <CalculatorFormSection
              calc={calc}
              paperSizes={paperSizes}
              isLoadingPaperSizes={isLoadingPaperSizes}
              paperSizesError={paperSizesError}
              manualPrintCount={manualPrintCount}
              onPrintCountChange={handlePrintCountChange}
              onIncrementPrintCount={incrementPrintCount}
              onDecrementPrintCount={decrementPrintCount}
              onPaperSizeChange={handlePaperSizeChange}
              additionalCosts={jobState.additionalCosts}
              onAdditionalCostsChange={(costs) => updateJobField('additionalCosts', costs)}
              hasResults={hasResults}
              onCalculate={handleCalculate}
              onGoToSummary={handleGoToSummary}
            />

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
    </div>
  );
};

export default PrintCalculator;
