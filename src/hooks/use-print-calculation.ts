import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPaperTypes,
  fetchPaperSizes,
  fetchPaperGrammages,
  fetchSuppliers,
  fetchPaperPrice,
  fetchPlateCosts,
  fetchCalculationSettings,
  fetchFormulaSettings
} from "@/services/supabaseService";
import { calculateLayout } from "@/utils/layoutCalculations";
import { calculatePaperUsage, calculatePaperCost } from "@/lib/utils";

// สร้าง helper สำหรับการจัดการ localStorage
const STORAGE_KEY = "print_calculator_state";

// ฟังก์ชันสำหรับบันทึกสถานะลง localStorage
const saveStateToLocalStorage = (state: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
};

// ฟังก์ชันสำหรับดึงสถานะจาก localStorage
const loadStateFromLocalStorage = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return null;
  }
};

export const usePrintCalculation = () => {
  const { toast } = useToast();
  
  // โหลดค่าที่บันทึกไว้จาก localStorage
  const savedState = loadStateFromLocalStorage();
  
  // Form state with default values from localStorage if available
  const [jobType, setJobType] = useState(savedState?.jobType || "");
  const [paperType, setPaperType] = useState(savedState?.paperType || "");
  const [paperGrammage, setPaperGrammage] = useState(savedState?.paperGrammage || "");
  const [supplier, setSupplier] = useState(savedState?.supplier || "");
  const [width, setWidth] = useState(savedState?.width || "");
  const [height, setHeight] = useState(savedState?.height || "");
  const [sizeUnit, setSizeUnit] = useState<"cm" | "inch">(savedState?.sizeUnit || "cm");
  const [colors, setColors] = useState(savedState?.colors || "4");
  const [selectedCoating, setSelectedCoating] = useState(savedState?.selectedCoating || "none");
  const [coatingCost, setCoatingCost] = useState(savedState?.coatingCost || "0");
  const [quantities, setQuantities] = useState<string[]>(savedState?.quantities || ["1000"]);
  const [wastage, setWastage] = useState(savedState?.wastage || "250");
  const [hasDieCut, setHasDieCut] = useState(savedState?.hasDieCut || false);
  const [dieCutCost, setDieCutCost] = useState(savedState?.dieCutCost || "0");
  const [hasBasePrint, setHasBasePrint] = useState(savedState?.hasBasePrint || false);
  const [basePrintCost, setBasePrintCost] = useState(savedState?.basePrintCost || "0");
  const [shippingCost, setShippingCost] = useState(savedState?.shippingCost || "0");
  const [packagingCost, setPackagingCost] = useState(savedState?.packagingCost || "0");
  const [profitMargin, setProfitMargin] = useState(savedState?.profitMargin || "30");
  const [printPerSheet, setPrintPerSheet] = useState(savedState?.printPerSheet || 0);
  const [validationError, setValidationError] = useState("");
  const [showPreview, setShowPreview] = useState(savedState?.showPreview || false);
  const [isLayoutDetailsOpen, setIsLayoutDetailsOpen] = useState(false);
  const [bypassLayoutValidation, setBypassLayoutValidation] = useState(false);
  const [cutsPerSheet, setCutsPerSheet] = useState(savedState?.cutsPerSheet || 1);

  // ข้อมูลที่ถูกเลือกเกี่ยวกับกระดาษ
  const [selectedPaperSize, setSelectedPaperSize] = useState<{ width: number; height: number } | null>(
    savedState?.selectedPaperSize || null
  );

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [selectedQuantityIndex, setSelectedQuantityIndex] = useState(0);

  // สร้างฟังก์ชัน wrapper สำหรับ setters ที่จะบันทึกค่าลง localStorage ด้วย
  const updateAndSave = (setter: Function) => (value: any) => {
    setter(value);
    // บันทึกค่าใหม่ลง localStorage หลังจาก state update
    setTimeout(() => {
      const currentState = {
        jobType,
        paperType,
        paperGrammage,
        supplier,
        width,
        height,
        sizeUnit,
        colors,
        selectedCoating,
        coatingCost,
        quantities,
        wastage,
        hasDieCut,
        dieCutCost,
        hasBasePrint,
        basePrintCost,
        shippingCost,
        packagingCost,
        profitMargin,
        printPerSheet,
        showPreview,
        cutsPerSheet,
        selectedPaperSize
      };
      saveStateToLocalStorage(currentState);
    }, 0);
  };

  // สร้าง wrapped setters ที่จะบันทึกค่าลง localStorage
  const setJobTypeAndSave = updateAndSave(setJobType);
  const setPaperTypeAndSave = updateAndSave(setPaperType);
  const setPaperGrammageAndSave = updateAndSave(setPaperGrammage);
  const setSupplierAndSave = updateAndSave(setSupplier);
  const setWidthAndSave = updateAndSave(setWidth);
  const setHeightAndSave = updateAndSave(setHeight);
  const setSizeUnitAndSave = updateAndSave(setSizeUnit);
  const setColorsAndSave = updateAndSave(setColors);
  const setSelectedCoatingAndSave = updateAndSave(setSelectedCoating);
  const setCoatingCostAndSave = updateAndSave(setCoatingCost);
  const setWastageAndSave = updateAndSave(setWastage);
  const setHasDieCutAndSave = updateAndSave(setHasDieCut);
  const setDieCutCostAndSave = updateAndSave(setDieCutCost);
  const setHasBasePrintAndSave = updateAndSave(setHasBasePrint);
  const setBasePrintCostAndSave = updateAndSave(setBasePrintCost);
  const setShippingCostAndSave = updateAndSave(setShippingCost);
  const setPackagingCostAndSave = updateAndSave(setPackagingCost);
  const setProfitMarginAndSave = updateAndSave(setProfitMargin);
  const setCutsPerSheetAndSave = updateAndSave(setCutsPerSheet);
  const setSelectedPaperSizeAndSave = updateAndSave(setSelectedPaperSize);

  // ฟังก์ชันพิเศษสำหรับ quantities เนื่องจากมีรูปแบบการอัพเดทที่ซับซ้อนกว่า
  const addQuantity = () => {
    if (quantities.length < 3) {
      const newQuantities = [...quantities, ""];
      setQuantities(newQuantities);
      updateAndSave(setQuantities)(newQuantities);
    }
  };

  const removeQuantity = (index: number) => {
    if (quantities.length > 1) {
      const newQuantities = [...quantities];
      newQuantities.splice(index, 1);
      setQuantities(newQuantities);
      updateAndSave(setQuantities)(newQuantities);
      if (selectedQuantityIndex >= newQuantities.length) {
        setSelectedQuantityIndex(newQuantities.length - 1);
      }
    }
  };

  const updateQuantity = (index: number, value: string) => {
    const newQuantities = [...quantities];
    newQuantities[index] = value;
    setQuantities(newQuantities);
    updateAndSave(setQuantities)(newQuantities);
  };

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

  // Fetch formula settings from the database
  const { data: formulaSettings } = useQuery({
    queryKey: ['formulaSettings'],
    queryFn: fetchFormulaSettings
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
    
    // Apply formula settings if available
    if (formulaSettings && formulaSettings.defaultWastage) {
      setWastageAndSave(formulaSettings.defaultWastage);
    }
  }, [settings, formulaSettings]);

  // Update paper size selection when paper type changes
  useEffect(() => {
    console.log("Paper type changed to:", paperType);
    console.log("Available paper sizes:", paperSizes);
    
    if (paperType && paperSizes && paperSizes.length > 0) {
      // Default to the first paper size if no saved size exists
      if (!selectedPaperSize) {
        const newSelectedSize = {
          width: paperSizes[0].width,
          height: paperSizes[0].height
        };
        
        console.log("Setting selected paper size to:", newSelectedSize);
        setSelectedPaperSizeAndSave(newSelectedSize);
        
        // Always show preview when paper size is available
        setShowPreview(true);
      }
      
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
      } else if (!selectedPaperSize) {
        console.log("No paper size available, clearing selected paper size");
        setSelectedPaperSizeAndSave(null);
        setShowPreview(false);
      }
    }
  }, [paperType, paperSizes, validationError, selectedPaperSize]);

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
        
        // บันทึกค่า printPerSheet ลง localStorage
        updateAndSave(setPrintPerSheet)(result.printPerSheet);
        
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
    
    // บันทึกค่า printPerSheet ลง localStorage
    updateAndSave(setPrintPerSheet)(perSheet);
    
    setBypassLayoutValidation(true);
    
    // Clear validation errors related to layout when we get a valid count
    if (perSheet > 0) {
      if (validationError && (validationError.includes("การจัดวาง") || validationError.includes("วางงาน"))) {
        setValidationError("");
      }
    }
  }, [validationError]);
  
  // Handle cuts per sheet change
  const handleCutsPerSheetChange = useCallback((cuts: number) => {
    console.log("Cuts per sheet changed to:", cuts);
    setCutsPerSheet(cuts);
  }, []);

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

  // Get paper price from database or fall back to the hardcoded values
  const getPaperPrice = async (paperTypeId: string, paperGrammageId: string, supplierId: string) => {
    console.log("Getting paper price for:", { paperTypeId, paperGrammageId, supplierId });
    
    // Try to get from database first
    if (paperTypeId && paperGrammageId && supplierId) {
      try {
        const priceData = await fetchPaperPrice(paperTypeId, paperGrammageId, supplierId);
        if (priceData) {
          console.log("Found paper price in database:", priceData.price_per_kg);
          return priceData.price_per_kg;
        }
        console.log("No paper price found in database, falling back to hardcoded values");
      } catch (error) {
        console.error("Error fetching paper price:", error);
      }
    } else {
      console.log("Missing required IDs for paper price lookup");
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
    
    // Try to get paper type, grammage, and supplier name for fallback logic
    let paperTypeName = "";
    let paperGrammageValue = "";
    let supplierName = "";
    
    try {
      // Fetch the paper type name for the ID
      const paperTypeResponse = await supabase
        .from('paper_types')
        .select('name')
        .eq('id', paperTypeId)
        .single();
        
      if (paperTypeResponse.data) {
        paperTypeName = paperTypeResponse.data.name;
      }
      
      // Fetch the grammage value for the ID
      const grammageResponse = await supabase
        .from('paper_grammages')
        .select('grammage')
        .eq('id', paperGrammageId)
        .single();
        
      if (grammageResponse.data) {
        paperGrammageValue = grammageResponse.data.grammage;
      }
      
      // Fetch the supplier name for the ID
      const supplierResponse = await supabase
        .from('suppliers')
        .select('name')
        .eq('id', supplierId)
        .single();
        
      if (supplierResponse.data) {
        supplierName = supplierResponse.data.name;
      }
      
      console.log("Fallback lookup using:", {
        paperTypeName,
        paperGrammageValue,
        supplierName
      });
      
      // Check if we can use the hardcoded values
      if (paperTypeName && paperGrammageValue && supplierName) {
        const typePrices = paperData[paperTypeName as keyof typeof paperData]?.prices;
        if (typePrices) {
          const grammPrices = typePrices[paperGrammageValue as keyof typeof typePrices];
          if (grammPrices) {
            const price = grammPrices[supplierName as keyof typeof grammPrices];
            if (price) {
              console.log("Found price in hardcoded data:", price);
              return price;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in fallback price lookup:", error);
    }
    
    console.log("No paper price found, returning default of 50");
    return 50; // Default price if nothing found
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
      setValidationError("กรุณาเลือกแกรมกระดาษ");
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

  // Helper function to evaluate formulas safely
  const evaluateFormula = (formula: string, variables: Record<string, any>): any => {
    try {
      // Create a function that takes only the variables we want to expose
      const func = new Function(...Object.keys(variables), `return ${formula};`);
      return func(...Object.values(variables));
    } catch (error) {
      console.error("Error evaluating formula:", formula, error);
      return null;
    }
  };

  // Calculate results with the correct paper cost formula
  const calculate = async () => {
    console.log("Starting calculation with values:", {
      paperType, paperGrammage, supplier, width, height, printPerSheet, quantities, cutsPerSheet
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
        
        // Get paper price with actual IDs
        const paperPricePerKg = await getPaperPrice(paperType, paperGrammage, supplier);
        console.log("Paper price per kg:", paperPricePerKg);
        
        // Calculate paper usage with cuts per sheet
        const wastageNum = parseInt(wastage) || 0;
        
        // Calculate paper usage details
        const paperUsage = calculatePaperUsage(
          qtyNum,
          printPerSheet,
          wastageNum,
          cutsPerSheet,
          500 // Default sheets per ream
        );
        
        console.log("Paper usage calculation:", paperUsage);
        
        // Determine plate type based on paper size or use formula
        let plateType = "ตัด 4"; // Default
        
        if (formulaSettings && formulaSettings.plateSelection && formulaSettings.useAdvancedFormulas === "true") {
          try {
            // Use the formula from settings
            plateType = evaluateFormula(formulaSettings.plateSelection, { 
              size: selectedPaperSize 
            }) || "ตัด 4";
          } catch (error) {
            console.error("Error evaluating plate selection formula:", error);
            // Fallback to standard logic
            plateType = selectedPaperSize && 
              (selectedPaperSize.width > 24 || selectedPaperSize.height > 35) 
              ? "ตัด 2" 
              : "ตัด 4";
          }
        } else {
          // Use standard logic
          plateType = selectedPaperSize && 
            (selectedPaperSize.width > 24 || selectedPaperSize.height > 35) 
            ? "ตัด 2" 
            : "ตัด 4";
        }
        
        // Calculate costs
        const plateCost = getPlateCost(plateType) * parseInt(colors);
        console.log("Plate cost:", plateCost);
        
        // Calculate paper weight and cost
        if (!selectedPaperSize) {
          throw new Error("ไม่มีข้อมูลขนาดกระดาษ");
        }
        
        // Get conversion factor from settings or use default
        const conversionFactor = formulaSettings?.conversionFactor 
          ? parseInt(formulaSettings.conversionFactor) 
          : 3100;
        
        // Calculate paper area for paper weight calculation
        const paperAreaSqM = (selectedPaperSize.width * selectedPaperSize.height) / (39.37 * 39.37); // Convert square inches to square meters
        const paperWeightPerSheet = paperAreaSqM * (parseInt(paperGrammage) / 1000); // Weight in kg
        
        // Calculate paper cost using the new formula:
        // (reams × width × height × GSM ÷ 3100 × price_per_kg)
        let paperCost;
        let paperCostFormula;
        
        if (formulaSettings?.paperCostFormula && formulaSettings.useAdvancedFormulas === "true") {
          // Use custom formula if enabled
          paperCostFormula = formulaSettings.paperCostFormula;
          
          // Prepare variables for formula evaluation
          const formulaVariables = {
            area_sqm: paperAreaSqM,
            grammage: parseInt(paperGrammage),
            weight: paperWeightPerSheet,
            price_per_kg: paperPricePerKg,
            size: selectedPaperSize,
            job_size: {
              width: parseFloat(width),
              height: parseFloat(height)
            },
            quantity: qtyNum,
            reams: paperUsage.reamsNeeded,
            sheets: paperUsage.totalSheets,
            master_sheets: paperUsage.masterSheetsNeeded,
            ink_colors: parseInt(colors),
            conversion_factor: conversionFactor,
            printsPerSheet: printPerSheet,
            waste: wastageNum
          };
          
          paperCost = evaluateFormula(paperCostFormula, formulaVariables);
        } else {
          // Use standard formula: (reams × width × height × GSM ÷ 3100 × price_per_kg)
          paperCostFormula = "(reams * size.width * size.height * grammage / conversion_factor * price_per_kg)";
          paperCost = calculatePaperCost(
            paperUsage.reamsNeeded,
            selectedPaperSize.width,
            selectedPaperSize.height,
            parseInt(paperGrammage),
            paperPricePerKg,
            conversionFactor
          );
        }
        
        console.log("Paper cost calculation:", {
          reams: paperUsage.reamsNeeded.toFixed(3),
          width: selectedPaperSize.width,
          height: selectedPaperSize.height,
          grammage: parseInt(paperGrammage),
          pricePerKg: paperPricePerKg,
          conversionFactor: conversionFactor,
          result: paperCost
        });
        
        // Calculate per-sheet cost (for display purposes)
        const sheetCost = paperCost / paperUsage.totalSheets;
        
        // Calculate coating cost if applicable
        const hasCoating = selectedCoating !== "none";
        const coatingCostTotal = hasCoating ? paperUsage.totalSheets * parseFloat(coatingCost || "0") : 0;
        
        // Calculate ink cost 
        const inkCostPerColor = formulaSettings?.inkCostPerColor 
          ? parseFloat(formulaSettings.inkCostPerColor) 
          : 0.5;
        
        const inkCostPerSheet = parseInt(colors) * inkCostPerColor;
        const inkCost = paperUsage.totalSheets * inkCostPerSheet;
        
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
        
        // Store the formula explanations for display
        const formulaExplanations = {
          paperWeightFormula: {
            formula: formulaSettings?.paperWeightFormula || "(area_sqm * grammage / 1000)",
            result: paperWeightPerSheet,
            explanation: `พื้นที่กระดาษ ${paperAreaSqM.toFixed(3)} ตร.ม. × แกรม ${paperGrammage} ÷ 1000 = ${paperWeightPerSheet.toFixed(3)} กก./แผ่น`
          },
          paperCostFormula: {
            formula: paperCostFormula,
            result: paperCost,
            explanation: `สูตร: (จำนวนรีม ${paperUsage.reamsNeeded.toFixed(3)} × กว้าง ${selectedPaperSize.width} นิ้ว × ยาว ${selectedPaperSize.height} นิ้ว × แกรม ${paperGrammage} ÷ ${conversionFactor} × ราคากระดาษ ${paperPricePerKg} บาท/กก.) = ${paperCost.toFixed(2)} บาท`
          },
          plateTypeFormula: {
            formula: formulaSettings?.plateSelection || "size.width > 24 || size.height > 35 ? 'ตัด 2' : 'ตัด 4'",
            result: plateType,
            explanation: `สำหรับกระดาษขนาด ${selectedPaperSize.width}×${selectedPaperSize.height} นิ้ว ใช้เพลทประเภท ${plateType}`
          }
        };
        
        newResults.push({
          totalCost,
          unitCost,
          printPerSheet,
          sheets: paperUsage.totalSheets,
          masterSheets: paperUsage.masterSheetsNeeded,
          paperSize: selectedPaperSize ? `${selectedPaperSize.width}×${selectedPaperSize.height} นิ้ว` : '',
        });
        
        newBreakdowns.push({
          plateType,
          plateCost,
          paperCost,
          inkCost,
          basePlateCost: getPlateCost(plateType),
          totalSheets: paperUsage.totalSheets,
          masterSheetsNeeded: paperUsage.masterSheetsNeeded,
          reamsNeeded: paperUsage.reamsNeeded,
          sheetCost,
          paperWeight: paperWeightPerSheet,
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
          wastage: wastageNum,
          cutsPerSheet,
          paperUsage,
          formulaExplanations,
          conversionFactor,
          inkCostPerColor,
          paperSize: selectedPaperSize,
          grammage: parseInt(paperGrammage),
          pricePerKg: paperPricePerKg
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
      updateAndSave(setPrintPerSheet)(normalLayout.printPerSheet);
    } else {
      setPrintPerSheet(rotatedLayout.printPerSheet);
      updateAndSave(setPrintPerSheet)(rotatedLayout.printPerSheet);
    }
    
    // Enable bypass for validation to allow calculation even with small printPerSheet
    setBypassLayoutValidation(true);
  };

  return {
    // Form state
    jobType, setJobType: setJobTypeAndSave,
    paperType, setPaperType: setPaperTypeAndSave,
    paperGrammage, setPaperGrammage: setPaperGrammageAndSave,
    supplier, setSupplier: setSupplierAndSave,
    width, setWidth: setWidthAndSave,
    height, setHeight: setHeightAndSave,
    sizeUnit, setSizeUnit: setSizeUnitAndSave,
    colors, setColors: setColorsAndSave,
    selectedCoating, setSelectedCoating: setSelectedCoatingAndSave,
    coatingCost, setCoatingCost: setCoatingCostAndSave,
    quantities, setQuantities, addQuantity, removeQuantity, updateQuantity,
    wastage, setWastage: setWastageAndSave,
    hasDieCut, setHasDieCut: setHasDieCutAndSave,
    dieCutCost, setDieCutCost: setDieCutCostAndSave,
    hasBasePrint, setHasBasePrint: setHasBasePrintAndSave,
    basePrintCost, setBasePrintCost: setBasePrintCostAndSave,
    shippingCost, setShippingCost: setShippingCostAndSave,
    packagingCost, setPackagingCost: setPackagingCostAndSave,
    profitMargin, setProfitMargin: setProfitMarginAndSave,
    printPerSheet, setPrintPerSheet,
    validationError, setValidationError,
    showPreview, setShowPreview,
    isLayoutDetailsOpen, setIsLayoutDetailsOpen,
    bypassLayoutValidation, setBypassLayoutValidation,
    cutsPerSheet, setCutsPerSheet: setCutsPerSheetAndSave,
    
    // Results
    results, setResults,
    breakdowns, setBreakdowns,
    selectedQuantityIndex, setSelectedQuantityIndex,
    selectedPaperSize, setSelectedPaperSize: setSelectedPaperSizeAndSave,
    
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
    forceLayoutCalculation,
    handleCutsPerSheetChange, // Added to return
  };
};
