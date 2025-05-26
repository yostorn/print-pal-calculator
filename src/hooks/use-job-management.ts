
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob, updateJob, Job } from "@/services/jobService";
import { useToast } from "@/hooks/use-toast";
import { AdditionalCost } from "@/components/calculator/AdditionalCostsManager";

interface JobState {
  currentJobId: string | null;
  jobName: string;
  customerName: string;
  quoteBy: string;
  hasUnsavedChanges: boolean;
  additionalCosts: AdditionalCost[];
}

export const useJobManagement = (calc: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [jobState, setJobState] = useState<JobState>({
    currentJobId: null,
    jobName: "",
    customerName: "",
    quoteBy: "",
    hasUnsavedChanges: false,
    additionalCosts: []
  });

  // Load job data if passed from Jobs page
  useEffect(() => {
    const jobData = location.state?.jobData as Job;
    if (jobData) {
      console.log("Loading job data:", jobData);
      
      setJobState(prev => ({
        ...prev,
        currentJobId: jobData.id,
        jobName: jobData.job_name,
        customerName: jobData.customer_name,
        quoteBy: jobData.quote_by,
        additionalCosts: jobData.additional_costs || [],
        hasUnsavedChanges: false
      }));
      
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
      if (jobData.has_spot_uv !== undefined) calc.setHasSpotUv(Boolean(jobData.has_spot_uv));
      if (jobData.selected_spot_uv_size) calc.setSelectedSpotUvSize(jobData.selected_spot_uv_size);
      if (jobData.has_die_cut !== undefined) calc.setHasDieCut(Boolean(jobData.has_die_cut));
      if (jobData.die_cut_cost) calc.setDieCutCost(jobData.die_cut_cost.toString());
      if (jobData.has_base_print !== undefined) calc.setHasBasePrint(Boolean(jobData.has_base_print));
      if (jobData.base_print_cost) calc.setBasePrintCost(jobData.base_print_cost.toString());
      if (jobData.shipping_cost) calc.setShippingCost(jobData.shipping_cost.toString());
      if (jobData.packaging_cost) calc.setPackagingCost(jobData.packaging_cost.toString());
      if (jobData.quantities) {
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
      
      // Clear the location state to prevent re-loading
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Track changes to mark as unsaved
  useEffect(() => {
    if (jobState.currentJobId) {
      setJobState(prev => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [
    jobState.jobName, jobState.customerName, jobState.quoteBy,
    calc.jobType, calc.paperType, calc.paperGrammage, calc.supplier,
    calc.width, calc.height, calc.colors, calc.baseColors,
    calc.plateType, calc.printPerSheet, calc.selectedCoating,
    calc.selectedCoatingSize, calc.hasSpotUv, calc.selectedSpotUvSize,
    calc.hasDieCut, calc.dieCutCost, calc.hasBasePrint, calc.basePrintCost,
    calc.shippingCost, calc.packagingCost, jobState.additionalCosts,
    calc.quantities, calc.wastage, calc.profitMargin
  ]);

  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: (jobData: any) => {
      if (jobState.currentJobId) {
        return updateJob(jobState.currentJobId, jobData);
      } else {
        return createJob(jobData);
      }
    },
    onSuccess: (data) => {
      if (data && typeof data === 'object' && 'id' in data) {
        setJobState(prev => ({ ...prev, currentJobId: data.id as string }));
      }
      setJobState(prev => ({ ...prev, hasUnsavedChanges: false }));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: jobState.currentJobId ? "อัพเดทงานสำเร็จ" : "บันทึกงานสำเร็จ",
        description: `งาน "${jobState.jobName}" ได้ถูกบันทึกแล้ว`
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

  const updateJobField = (field: keyof JobState, value: any) => {
    setJobState(prev => ({ ...prev, [field]: value }));
  };

  const buildJobData = () => {
    return {
      job_name: jobState.jobName,
      customer_name: jobState.customerName,
      quote_by: jobState.quoteBy,
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
      die_cut_cost: parseFloat(calc.dieCutCost) || 0,
      has_base_print: calc.hasBasePrint,
      base_print_cost: parseFloat(calc.basePrintCost) || 0,
      shipping_cost: parseFloat(calc.shippingCost) || 0,
      packaging_cost: parseFloat(calc.packagingCost) || 0,
      additional_costs: jobState.additionalCosts,
      quantities: calc.quantities,
      wastage: calc.wastage,
      profit_margin: calc.profitMargin,
      results: calc.results,
      breakdowns: calc.breakdowns,
      selected_quantity_index: calc.selectedQuantityIndex
    };
  };

  return {
    jobState,
    updateJobField,
    saveJobMutation,
    buildJobData
  };
};
