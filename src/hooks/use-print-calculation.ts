
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPaperTypes,
  fetchPaperSizes,
  fetchPaperGrammages,
  fetchSuppliers,
  fetchPaperPrice,
  fetchPlateCosts,
  fetchCalculationSettings
} from "@/services/supabaseService";
import { calculateLayout } from "@/utils/layoutCalculations";

export const usePrintCalculation = () => {
  const { toast } = useToast();
  
  // Form state
  const [jobType, setJobType] = useState("");
  const [paperType, setPaperType] = useState("");
  const [paperGrammage, setPaperGrammage] = useState("");
  const [supplier, setSupplier] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"cm" | "inch">("cm");
  const [colors, setColors] = useState("4");
  const [selectedCoating, setSelectedCoating] = useState("none");
  const [coatingCost, setCoatingCost] = useState("0");
  const [quantities, setQuantities] = useState<string[]>(["1000"]);
  const [wastage, setWastage] = useState("250");
  const [hasDieCut, setHasDieCut] = useState(false);
  const [dieCutCost, setDieCutCost] = useState("0");
  const [hasBasePrint, setHasBasePrint] = useState(false);
  const [basePrintCost, setBasePrintCost] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [packagingCost, setPackagingCost] = useState("0");
  const [profitMargin, setProfitMargin] = useState("30");
  const [printPerSheet, setPrintPerSheet] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLayoutDetailsOpen, setIsLayoutDetailsOpen] = useState(false);
  const [bypassLayoutValidation, setBypassLayoutValidation] = useState(false);

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [selectedQuantityIndex, setSelectedQuantityIndex] = useState(0);
  const [selectedPaperSize, setSelectedPaperSize] = useState<{ width: number; height: number } | null>(null);

  // Data fetching
  const { data: paperTypes } = useQuery({
    queryKey: ['paperTypes'],
    queryFn: fetchPaperTypes
  });

  // Debug logs to trace data flow
  console.log("usePrintCalculation - paperType:", paperType);

  const { data: paperSizes } = useQuery({
    queryKey: ['paperSizes', paperType],
    queryFn: () => fetchPaperSizes(paperType),
    enabled: !!paperType
  });

  // Log paper sizes fetched
  useEffect(() => {
    console.log("Paper sizes updated in hook:", paperSizes);
  }, [paperSizes]);

  const { data: plateCosts } = useQuery({
    queryKey: ['plateCosts'],
    queryFn: fetchPlateCosts
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchCalculationSettings
  });

  // Set default values from settings
  useEffect(() => {
    if (settings) {
      if (settings.default_wastage) {
        setWastage(settings.default_wastage);
      }
      if (settings.default_coating_cost) {
        setCoatingCost(settings.default_coating_cost);
      }
    }
  }, [settings]);

  // Update paper size selection when paper type changes
  useEffect(() => {
    console.log("Paper type changed to:", paperType);
    console.log("Available paper sizes:", paperSizes);
    
    if (paperType && paperSizes && paperSizes.length > 0) {
      // Default to the first paper size
      const newSelectedSize = {
        width: paperSizes[0].width,
        height: paperSizes[0].height
      };
      
      console.log("Setting selected paper size to:", newSelectedSize);
      setSelectedPaperSize(newSelectedSize);
      
      // Always show preview when paper size is available
      setShowPreview(true);
      
      // Clear any validation errors related to paper selection
      if (validationError && (
        validationError.includes("กระดาษ") || 
        validationError.includes("เลือกประเภท")
      )) {
        setValidationError("");
      }
    } else {
      // If we don't have paper sizes yet but have a paper type, don't clear the selected size
      if (!paperSizes || paperSizes.length === 0) {
        console.log("No paper sizes available yet for paper type:", paperType);
      } else {
        console.log("No paper size available, clearing selected paper size");
        setSelectedPaperSize(null);
        setShowPreview(false);
      }
    }
  }, [paperType, paperSizes, validationError]);

  // Add separate effect for updating layout preview when dimensions change
  useEffect(() => {
    if (width && height && selectedPaperSize) {
      console.log("Dimensions changed, showing preview with:", { 
        width, 
        height, 
        paperSize: selectedPaperSize,
        printPerSheet
      });
      
      // Show preview when we have dimensions
      setShowPreview(true);
      
      // Clear validation errors if dimensions are provided
      if (validationError && (
        validationError.includes("ขนาดงาน") || 
        validationError.includes("กรุณาระบุขนาด")
      )) {
        setValidationError("");
      }
      
      // Calculate layout automatically when dimensions change
      const jobWidthValue = parseFloat(width);
      const jobHeightValue = parseFloat(height);
      
      if (jobWidthValue > 0 && jobHeightValue > 0 && selectedPaperSize) {
        console.log("Auto-calculating layout with:", {
          paperWidth: selectedPaperSize.width,
          paperHeight: selectedPaperSize.height,
          jobWidth: jobWidthValue,
          jobHeight: jobHeightValue,
          unit: sizeUnit
        });
        
        // Convert to inches if needed
        const jobWidthInch = sizeUnit === "cm" ? jobWidthValue / 2.54 : jobWidthValue;
        const jobHeightInch = sizeUnit === "cm" ? jobHeightValue / 2.54 : jobHeightValue;
        
        const result = calculateLayout(
          selectedPaperSize.width, 
          selectedPaperSize.height, 
          jobWidthInch, 
          jobHeightInch
        );
        
        console.log("Auto-calculated layout result:", result);
        setPrintPerSheet(result.printPerSheet);
        
        // If layout can be calculated, clear related validation errors
        if (result.printPerSheet > 0 && validationError && (
          validationError.includes("การจัดวาง") || 
          validationError.includes("วางงาน")
        )) {
          setValidationError("");
        }
      }
    }
  }, [width, height, selectedPaperSize, sizeUnit, validationError]);

  // Handle layout change from the preview component
  const handleLayoutChange = useCallback((perSheet: number) => {
    console.log("Layout changed, printPerSheet:", perSheet);
    setPrintPerSheet(perSheet);
    setBypassLayoutValidation(true);
    
    // Clear validation errors related to layout when we get a valid count
    if (perSheet > 0) {
      if (validationError && (validationError.includes("การจัดวาง") || validationError.includes("วางงาน"))) {
        setValidationError("");
      }
    }
  }, [validationError]);

  const handleOpenLayoutDetails = () => {
    console.log("Opening layout details with current state:", {
      paperType,
      width,
      height,
      selectedPaperSize,
      printPerSheet
    });
    
    // Bypass layout validation when user opens layout details
    setBypassLayoutValidation(true);
    setIsLayoutDetailsOpen(true);
  };

  // Add quantity field
  const addQuantity = () => {
    if (quantities.length < 3) {
      setQuantities([...quantities, ""]);
    }
  };

  // Remove quantity field
  const removeQuantity = (index: number) => {
    if (quantities.length > 1) {
      const newQuantities = [...quantities];
      newQuantities.splice(index, 1);
      setQuantities(newQuantities);
      if (selectedQuantityIndex >= newQuantities.length) {
        setSelectedQuantityIndex(newQuantities.length - 1);
      }
    }
  };

  // Update quantity value
  const updateQuantity = (index: number, value: string) => {
    const newQuantities = [...quantities];
    newQuantities[index] = value;
    setQuantities(newQuantities);
  };

  // Get paper price from database or fall back to the hardcoded values
  const getPaperPrice = async (paperTypeVal: string, paperGrammageVal: string, supplierVal: string) => {
    // Try to get from database first
    if (paperType && paperGrammage && supplier) {
      try {
        const priceData = await fetchPaperPrice(paperTypeVal, paperGrammageVal, supplierVal);
        if (priceData) {
          return priceData.price_per_kg;
        }
      } catch (error) {
        console.error("Error fetching paper price:", error);
      }
    }
    
    // Fall back to hardcoded paper data if database fetch fails
    const paperData = {
      "art-card": {
        prices: {
          "210": { "supplier-a": 85, "supplier-b": 87, "supplier-c": 86 },
          "230": { "supplier-a": 92, "supplier-b": 95, "supplier-c": 93 },
          "250": { "supplier-a": 100, "supplier-b": 102, "supplier-c": 101 },
          "300": { "supplier-a": 120, "supplier-b": 122, "supplier-c": 121 }
        }
      },
      "art-paper": {
        prices: {
          "80": { "supplier-a": 45, "supplier-d": 47, "supplier-e": 46 },
          "90": { "supplier-a": 50, "supplier-d": 52, "supplier-e": 51 },
          "100": { "supplier-a": 55, "supplier-d": 57, "supplier-e": 56 },
          "120": { "supplier-a": 65, "supplier-d": 67, "supplier-e": 66 },
          "130": { "supplier-a": 70, "supplier-d": 72, "supplier-e": 71 },
          "150": { "supplier-a": 80, "supplier-d": 82, "supplier-e": 81 }
        }
      },
      "woodfree": {
        prices: {
          "70": { "supplier-b": 40, "supplier-c": 41, "supplier-f": 39 },
          "80": { "supplier-b": 45, "supplier-c": 46, "supplier-f": 44 },
          "90": { "supplier-b": 50, "supplier-c": 51, "supplier-f": 49 },
          "100": { "supplier-b": 55, "supplier-c": 56, "supplier-f": 54 }
        }
      },
      "newsprint": {
        prices: {
          "45": { "supplier-g": 30, "supplier-h": 31 },
          "48": { "supplier-g": 32, "supplier-h": 33 },
          "52": { "supplier-g": 35, "supplier-h": 36 }
        }
      }
    };
    
    return paperData[paperTypeVal as keyof typeof paperData]?.prices[paperGrammageVal as keyof typeof paperData[keyof typeof paperData]["prices"]]?.[supplierVal as keyof typeof paperData[keyof typeof paperData]["prices"][keyof typeof paperData[keyof typeof paperData]["prices"]]] || 0;
  };

  // Get plate cost from database or fall back to hardcoded values
  const getPlateCost = (plateType: string) => {
    if (plateCosts) {
      const plate = plateCosts.find(p => p.name === plateType);
      if (plate) return plate.cost;
    }
    
    // Fallback to hardcoded values
    const plateCostsHardcoded = {
      "ตัด 2": 800,
      "ตัด 4": 500
    };
    
    return plateCostsHardcoded[plateType as keyof typeof plateCostsHardcoded] || 0;
  };

  // Improved validation with better error messages and logging
  const validateForm = () => {
    console.log("Validating form with:", {
      paperType,
      paperGrammage,
      supplier,
      width,
      height,
      colors,
      printPerSheet,
      quantities: quantities[0],
      paperSizes: !!paperSizes,
      selectedPaperSize,
      bypassLayoutValidation
    });
    
    // Split validation into sections for better error messages
    
    // 1. Validate paper selection
    if (!paperType) {
      setValidationError("กรุณาเลือกประเภทกระดาษ");
      return false;
    }
    if (!paperGrammage) {
      setValidationError("��รุณาเลือกแกรมกระดาษ");
      return false;
    }
    if (!supplier) {
      setValidationError("กรุณาเลือกซัพพลายเออร์");
      return false;
    }
    
    // 2. Validate job dimensions
    if (!width || parseFloat(width) <= 0) {
      setValidationError("กรุณาระบุความกว้างของงาน");
      return false;
    }
    if (!height || parseFloat(height) <= 0) {
      setValidationError("กรุณาระบุความยาวของงาน");
      return false;
    }
    
    // 3. Validate other job details
    if (!colors) {
      setValidationError("กรุณาระบุจำนวนสี");
      return false;
    }
    
    // 4. Validate quantity
    if (!quantities[0] || parseInt(quantities[0]) <= 0) {
      setValidationError("กรุณาระบุปริมาณที่ต้องการคำนวณ");
      return false;
    }
    
    // 5. Validate layout calculation - Modified to be more flexible
    if (printPerSheet <= 0 && !bypassLayoutValidation) {
      console.log("Layout validation failed. printPerSheet:", printPerSheet);
      
      // Try to analyze why it might be zero
      if (!selectedPaperSize) {
        setValidationError("กรุณาเลือกประเภทกระดาษ และขนาดกระดาษ");
      } else {
        // More helpful error message about layout issues
        const jobWidthInch = sizeUnit === "cm" ? parseFloat(width) / 2.54 : parseFloat(width);
        const jobHeightInch = sizeUnit === "cm" ? parseFloat(height) / 2.54 : parseFloat(height);
        
        if (jobWidthInch > selectedPaperSize.width || jobHeightInch > selectedPaperSize.height) {
          setValidationError("ขนาดงานใหญ่เกินกระดาษ กรุณาเลือกขนาดกระดาษที่ใหญ่กว่า หรือลดขนาดงาน");
        } else {
          setValidationError("ไม่สามารถคำนวณการจัดวางได้ กรุณาตรวจสอบขนาดงานและกระดาษ");
        }
      }
      
      // Force layout calculation if we have all the required dimensions
      if (selectedPaperSize && width && height) {
        console.log("Opening layout details to help resolve layout issues");
        handleOpenLayoutDetails();
      }
      
      return false;
    }
    
    // All validations passed
    setValidationError("");
    return true;
  };

  // Calculate results with better error handling
  const calculate = async () => {
    console.log("Starting calculation with values:", {
      paperType, paperGrammage, supplier, width, height, printPerSheet, quantities
    });

    try {
      // Turn off bypass flag for normal validation only if printPerSheet is 0
      if (printPerSheet > 0) {
        setBypassLayoutValidation(true);
      } else {
        setBypassLayoutValidation(false);
      }
      
      if (!validateForm()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: validationError || "กรุณาระบุข้อมูลให้ครบถ้วน",
          variant: "destructive"
        });
        return;
      }

      const newResults = [];
      const newBreakdowns = [];

      for (const quantity of quantities) {
        if (!quantity) continue;
        
        const qtyNum = parseInt(quantity);
        
        // Get paper price 
        const paperPricePerKg = await getPaperPrice(paperType, paperGrammage, supplier);
        console.log("Paper price per kg:", paperPricePerKg);
        
        // Calculate sheets needed
        const wastageNum = parseInt(wastage) || 0;
        const sheetsNeeded = Math.ceil(qtyNum / printPerSheet);
        const totalSheets = sheetsNeeded + wastageNum;
        console.log("Total sheets needed:", totalSheets, "(", sheetsNeeded, "sheets + ", wastageNum, "wastage)");
        
        // Determine plate type based on paper size
        const plateType = selectedPaperSize && 
          (selectedPaperSize.width > 24 || selectedPaperSize.height > 35) 
          ? "ตัด 2" 
          : "ตัด 4";
        
        // Calculate costs
        const plateCost = getPlateCost(plateType) * parseInt(colors);
        console.log("Plate cost:", plateCost);
        
        // Calculate paper weight and cost
        if (!selectedPaperSize) {
          throw new Error("ไม่มีข้อมูลขนาดกระดาษ");
        }
        
        const paperAreaSqM = (selectedPaperSize.width * selectedPaperSize.height) / (39.37 * 39.37); // Convert square inches to square meters
        const paperWeightPerSheet = paperAreaSqM * (parseInt(paperGrammage) / 1000); // Weight in kg
        const sheetCost = paperWeightPerSheet * paperPricePerKg;
        const paperCost = totalSheets * sheetCost;
        console.log("Paper cost:", paperCost);
        
        // Calculate coating cost if applicable
        const hasCoating = selectedCoating !== "none";
        const coatingCostTotal = hasCoating ? totalSheets * parseFloat(coatingCost || "0") : 0;
        
        // Calculate ink cost (simplified estimation)
        const inkCostPerSheet = parseInt(colors) * 0.5; // Simplified - 0.5 baht per color per sheet
        const inkCost = totalSheets * inkCostPerSheet;
        
        // Calculate base print cost if applicable
        const basePrintCostTotal = hasBasePrint ? parseFloat(basePrintCost || "0") : 0;
        
        // Calculate die-cut cost if applicable
        const dieCutCostTotal = hasDieCut ? parseFloat(dieCutCost || "0") : 0;
        
        // Calculate shipping and packaging costs
        const shippingCostTotal = parseFloat(shippingCost || "0");
        const packagingCostTotal = parseFloat(packagingCost || "0");
        
        // Calculate total cost before profit
        const baseCost = plateCost + paperCost + inkCost + coatingCostTotal + 
                          basePrintCostTotal + dieCutCostTotal + 
                          shippingCostTotal + packagingCostTotal;
        
        // Calculate profit margin
        const profitMarginPercent = parseFloat(profitMargin || "0") / 100;
        const profit = baseCost * profitMarginPercent;
        
        // Total cost and per unit cost
        const totalCost = baseCost + profit;
        const unitCost = totalCost / qtyNum;
        
        newResults.push({
          totalCost,
          unitCost,
          printPerSheet,
          sheets: totalSheets,
          paperSize: selectedPaperSize ? `${selectedPaperSize.width}×${selectedPaperSize.height} นิ้ว` : '',
        });
        
        newBreakdowns.push({
          plateType,
          plateCost,
          paperCost,
          inkCost,
          basePlateCost: getPlateCost(plateType),
          totalSheets,
          sheetCost,
          colorNumber: parseInt(colors),
          hasCoating,
          coatingCost: coatingCostTotal,
          coatingType: selectedCoating !== "none" ? selectedCoating : "",
          hasDieCut,
          dieCutCost: dieCutCostTotal,
          hasBasePrint,
          basePrintCost: basePrintCostTotal,
          shippingCost: shippingCostTotal,
          packagingCost: packagingCostTotal,
          profitMargin: profitMarginPercent,
          profit: profit,
          baseCost,
          wastage: wastageNum
        });
      }
      
      setResults(newResults);
      setBreakdowns(newBreakdowns);
      
      toast({
        title: "คำนวณเสร็จสิ้น",
        description: "ราคาถูกคำนวณเรียบร้อยแล้ว"
      });
      
    } catch (error) {
      console.error("Error during calculation:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถคำนวณราคาได้",
        variant: "destructive"
      });
    }
  };

  // Helper function to force layout calculation
  const forceLayoutCalculation = () => {
    if (!selectedPaperSize || !width || !height) return;
    
    console.log("Forcing layout calculation");
    
    // Convert to inches if needed
    const jobWidthValue = parseFloat(width);
    const jobHeightValue = parseFloat(height);
    const jobWidthInch = sizeUnit === "cm" ? jobWidthValue / 2.54 : jobWidthValue;
    const jobHeightInch = sizeUnit === "cm" ? jobHeightValue / 2.54 : jobHeightValue;
    
    // Try both orientations
    const normalLayout = calculateLayout(
      selectedPaperSize.width, 
      selectedPaperSize.height, 
      jobWidthInch, 
      jobHeightInch
    );
    
    const rotatedLayout = calculateLayout(
      selectedPaperSize.width, 
      selectedPaperSize.height, 
      jobHeightInch, 
      jobWidthInch
    );
    
    console.log("Force calculation results:", { 
      normal: normalLayout, 
      rotated: rotatedLayout 
    });
    
    // Use the better layout
    if (normalLayout.printPerSheet >= rotatedLayout.printPerSheet) {
      setPrintPerSheet(normalLayout.printPerSheet);
    } else {
      setPrintPerSheet(rotatedLayout.printPerSheet);
    }
    
    // Enable bypass for validation to allow calculation even with small printPerSheet
    setBypassLayoutValidation(true);
  };

  return {
    // Form state
    jobType, setJobType,
    paperType, setPaperType,
    paperGrammage, setPaperGrammage,
    supplier, setSupplier,
    width, setWidth,
    height, setHeight,
    sizeUnit, setSizeUnit,
    colors, setColors,
    selectedCoating, setSelectedCoating,
    coatingCost, setCoatingCost,
    quantities, setQuantities, addQuantity, removeQuantity, updateQuantity,
    wastage, setWastage,
    hasDieCut, setHasDieCut,
    dieCutCost, setDieCutCost,
    hasBasePrint, setHasBasePrint,
    basePrintCost, setBasePrintCost,
    shippingCost, setShippingCost,
    packagingCost, setPackagingCost,
    profitMargin, setProfitMargin,
    printPerSheet, setPrintPerSheet,
    validationError, setValidationError,
    showPreview, setShowPreview,
    isLayoutDetailsOpen, setIsLayoutDetailsOpen,
    bypassLayoutValidation, setBypassLayoutValidation,
    
    // Results
    results, setResults,
    breakdowns, setBreakdowns,
    selectedQuantityIndex, setSelectedQuantityIndex,
    selectedPaperSize, setSelectedPaperSize,
    
    // Data
    paperTypes,
    paperSizes,
    plateCosts,
    settings,
    
    // Functions
    handleLayoutChange,
    handleOpenLayoutDetails,
    calculate,
    validateForm,
    forceLayoutCalculation
  };
};
