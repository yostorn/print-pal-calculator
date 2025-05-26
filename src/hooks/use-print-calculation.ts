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
  fetchFormulaSettings,
  fetchCoatingTypes,
  fetchCoatingSizes,
  fetchSpotUvCosts,
  fetchInkCosts
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
  const [baseColors, setBaseColors] = useState(savedState?.baseColors || "0"); // New field for ตีพื้น
  const [selectedCoating, setSelectedCoating] = useState(savedState?.selectedCoating || "none");
  const [selectedCoatingSize, setSelectedCoatingSize] = useState(savedState?.selectedCoatingSize || "");
  const [hasSpotUv, setHasSpotUv] = useState(savedState?.hasSpotUv || false);
  const [selectedSpotUvSize, setSelectedSpotUvSize] = useState(savedState?.selectedSpotUvSize || "");
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
  const [plateType, setPlateType] = useState(savedState?.plateType || "ตัด 4");

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
        baseColors,
        selectedCoating,
        selectedCoatingSize,
        hasSpotUv,
        selectedSpotUvSize,
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
        selectedPaperSize,
        plateType
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
  const setBaseColorsAndSave = updateAndSave(setBaseColors); // New setter for base colors
  const setSelectedCoatingAndSave = updateAndSave(setSelectedCoating);
  const setSelectedCoatingSizeAndSave = updateAndSave(setSelectedCoatingSize);
  const setHasSpotUvAndSave = updateAndSave(setHasSpotUv);
  const setSelectedSpotUvSizeAndSave = updateAndSave(setSelectedSpotUvSize);
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
  const setPlateTypeAndSave = updateAndSave(setPlateType);
  const setPrintPerSheetAndSave = updateAndSave(setPrintPerSheet);

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
    setPrintPerSheetAndSave(perSheet);
    
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
    setCutsPerSheetAndSave(cuts);
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

  // Get coating cost from database
  const getCoatingCost = async (coatingSizeId: string, totalSheets: number) => {
    if (!coatingSizeId) return 0;
    
    try {
      const { data, error } = await supabase
        .from('coating_sizes')
        .select('cost_per_sheet, minimum_cost')
        .eq('id', coatingSizeId)
        .single();
      
      if (error || !data) return 0;
      
      const calculatedCost = totalSheets * data.cost_per_sheet;
      return Math.max(calculatedCost, data.minimum_cost);
    } catch (error) {
      console.error("Error fetching coating cost:", error);
      return 0;
    }
  };

  // Get spot UV cost from database
  const getSpotUvCost = async (spotUvSizeId: string, totalSheets: number) => {
    if (!spotUvSizeId) return 0;
    
    try {
      const { data, error } = await supabase
        .from('spot_uv_costs')
        .select('cost_per_sheet, minimum_cost')
        .eq('id', spotUvSizeId)
        .single();
      
      if (error || !data) return 0;
      
      const calculatedCost = totalSheets * data.cost_per_sheet;
      return Math.max(calculatedCost, data.minimum_cost);
    } catch (error) {
      console.error("Error fetching spot UV cost:", error);
      return 0;
    }
  };

  // Get ink cost from database
  const getInkCost = (plateType: string, inkCategory: 'หมึกปกติ' | 'หมึกตีพื้น', totalSheets: number) => {
    if (!inkCosts) return 0;
    
    const inkCost = inkCosts.find(cost => 
      cost.plate_type === plateType && cost.ink_category === inkCategory
    );
    
    if (!inkCost) return 0;
    
    const calculatedCost = totalSheets * inkCost.cost_per_sheet;
    return Math.max(calculatedCost, inkCost.minimum_cost);
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
      bypassLayoutValidation,
      cutsPerSheet
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
    
    // 5. Allow bypassing layout validation - user can manually set prints per sheet
    if (printPerSheet <= 0 && !bypassLayoutValidation) {
      console.log("Layout validation failed. printPerSheet:", printPerSheet);
      
      setValidationError("กรุณากำหนดจำนวนชิ้นต่อแผ่น");
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

  // Calculate results with the new ink cost calculation
  const calculate = async () => {
    console.log("Starting calculation with values:", {
      paperType, paperGrammage, supplier, width, height, printPerSheet, quantities, plateType, sizeUnit,
      selectedCoating, selectedCoatingSize, hasSpotUv, selectedSpotUvSize, colors, baseColors
    });

    // Store the current unit before calculation to ensure we can restore it later
    const startingUnit = sizeUnit;
    console.log("Starting unit before calculation:", startingUnit);

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
        return false;
      }

      const newResults = [];
      const newBreakdowns = [];

      for (const quantity of quantities) {
        if (!quantity) continue;
        
        const qtyNum = parseInt(quantity);
        
        // Get paper price with actual IDs
        const paperPricePerKg = await getPaperPrice(paperType, paperGrammage, supplier);
        console.log("Paper price per kg:", paperPricePerKg);
        
        // Calculate paper usage with cuts per sheet - ensure cutsPerSheet is passed correctly
        const wastageNum = parseInt(wastage) || 0;
        
        // Use the user-defined cutsPerSheet value
        const actualCutsPerSheet = cutsPerSheet;
        console.log("Using cuts per sheet:", actualCutsPerSheet);
        
        // Calculate paper usage details with the cutsPerSheet value
        const paperUsage = calculatePaperUsage(
          qtyNum,
          printPerSheet,
          wastageNum,
          actualCutsPerSheet, // Make sure cutsPerSheet is passed correctly 
          500 // Default sheets per ream
        );
        
        console.log("Paper usage calculation:", paperUsage);
        
        // Get grammage value from database
        let grammageValue = 0;
        try {
          const { data: grammageData, error } = await supabase
            .from('paper_grammages')
            .select('grammage')
            .eq('id', paperGrammage)
            .single();
            
          if (grammageData && grammageData.grammage) {
            grammageValue = parseInt(grammageData.grammage);
            console.log("Retrieved grammage from DB:", grammageValue);
          } else if (error) {
            console.error("Error fetching grammage:", error);
            // Fall back to parsing from the paperGrammage string if it's a number
            if (!isNaN(parseInt(paperGrammage))) {
              grammageValue = parseInt(paperGrammage);
              console.log("Falling back to paperGrammage as number:", grammageValue);
            }
          }
        } catch (error) {
          console.error("Exception fetching grammage:", error);
        }
        
        // If we still don't have a valid grammage, log an error and use a default
        if (!grammageValue) {
          console.error("Failed to get valid grammage, using default of 80");
          grammageValue = 80; // Default to common value
        }
        
        // Get conversion factor from settings or use default
        const conversionFactor = formulaSettings?.conversionFactor 
          ? parseInt(formulaSettings.conversionFactor) 
          : 3100;
        
        // Calculate paper cost using the formula with reams and cutsPerSheet:
        // (reams × width × height × GSM ÷ 3100 × price_per_kg)
        // The cutsPerSheet is already factored into the reamsNeeded calculation in calculatePaperUsage
        const paperCost = calculatePaperCost(
          paperUsage.reamsNeeded, // This already accounts for cuts per sheet
          selectedPaperSize!.width,
          selectedPaperSize!.height,
          grammageValue, // Use the fetched grammage value
          paperPricePerKg,
          conversionFactor
        );
        
        console.log("Paper cost calculation:", {
          reams: paperUsage.reamsNeeded.toFixed(3),
          width: selectedPaperSize!.width,
          height: selectedPaperSize!.height,
          grammage: grammageValue,
          pricePerKg: paperPricePerKg,
          conversionFactor: conversionFactor,
          cutsPerSheet: actualCutsPerSheet,
          result: paperCost
        });
        
        // Calculate per-sheet cost (for display purposes)
        const sheetCost = paperCost / paperUsage.totalSheets;
        
        // Get plate cost using the user-selected plate type
        const plateCost = getPlateCost(plateType) * parseInt(colors);
        console.log("Plate cost:", plateCost);
        
        // Calculate coating cost using new system (based on total sheets, not prints)
        const coatingCostTotal = selectedCoating !== "none" && selectedCoatingSize 
          ? await getCoatingCost(selectedCoatingSize, paperUsage.totalSheets)
          : 0;
        
        // Calculate spot UV cost using new system (based on total sheets, not prints)
        const spotUvCostTotal = hasSpotUv && selectedSpotUvSize 
          ? await getSpotUvCost(selectedSpotUvSize, paperUsage.totalSheets)
          : 0;
        
        console.log("Coating cost:", coatingCostTotal, "Spot UV cost:", spotUvCostTotal);
        
        // Calculate new ink costs
        const totalColors = parseInt(colors);
        const totalBaseColors = parseInt(baseColors);
        const normalColors = totalColors - totalBaseColors;
        
        // Calculate normal ink cost
        const normalInkCost = normalColors > 0 
          ? getInkCost(plateType, 'หมึกปกติ', paperUsage.totalSheets) * normalColors
          : 0;
        
        // Calculate base ink cost
        const baseInkCost = totalBaseColors > 0 
          ? getInkCost(plateType, 'หมึกตีพื้น', paperUsage.totalSheets) * totalBaseColors
          : 0;
        
        const totalInkCost = normalInkCost + baseInkCost;
        
        console.log("Ink costs:", { normalColors, totalBaseColors, normalInkCost, baseInkCost, totalInkCost });
        
        // Calculate base print cost if applicable
        const basePrintCostTotal = hasBasePrint ? parseFloat(basePrintCost || "0") : 0;
        
        // Calculate die-cut cost if applicable
        const dieCutCostTotal = hasDieCut ? parseFloat(dieCutCost || "0") : 0;
        
        // Calculate shipping and packaging costs
        const shippingCostTotal = parseFloat(shippingCost || "0");
        const packagingCostTotal = parseFloat(packagingCost || "0");
        
        // Calculate total cost before profit
        const baseCost = plateCost + paperCost + totalInkCost + coatingCostTotal + spotUvCostTotal +
                        basePrintCostTotal + dieCutCostTotal + 
                        shippingCostTotal + packagingCostTotal;
        
        // Calculate profit margin
        const profitMarginPercent = parseFloat(profitMargin || "0") / 100;
        const profit = baseCost * profitMarginPercent;
        
        // Total cost and per unit cost
        const totalCost = baseCost + profit;
        const unitCost = totalCost / qtyNum;
        
        // Store the formula explanations for display
        const paperCostFormula = "(reams * size.width * size.height * GSM ÷ conversion_factor * price_per_kg)";
        const formulaExplanations = {
          paperCostFormula: {
            formula: paperCostFormula,
            result: paperCost,
            explanation: `จำนวนรีม ${paperUsage.reamsNeeded.toFixed(3)} × กว้าง ${selectedPaperSize!.width} นิ้ว × ยาว ${selectedPaperSize!.height} นิ้ว × แกรม ${grammageValue} ÷ ${conversionFactor} × ราคากระดาษ ${paperPricePerKg} บาท/กก. = ${paperCost.toFixed(2)} บาท`
          },
          plateTypeFormula: {
            formula: "User selected",
            result: plateType,
            explanation: `ผู้ใช้เลือกประเภทเพลท ${plateType}`
          },
          cutsPerSheetFormula: {
            formula: "User selected",
            result: actualCutsPerSheet,
            explanation: `จำนวนที่ตัดจากกระดาษแผ่นใหญ่: ${actualCutsPerSheet} ครั้ง`
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
          inkCost: totalInkCost,
          normalInkCost,
          baseInkCost,
          normalColors,
          baseColors: totalBaseColors,
          basePlateCost: getPlateCost(plateType),
          totalSheets: paperUsage.totalSheets,
          masterSheetsNeeded: paperUsage.masterSheetsNeeded,
          reamsNeeded: paperUsage.reamsNeeded,
          sheetCost,
          colorNumber: parseInt(colors),
          hasCoating: selectedCoating !== "none",
          coatingCost: coatingCostTotal,
          coatingType: selectedCoating !== "none" ? selectedCoating : "",
          hasSpotUv,
          spotUvCost: spotUvCostTotal,
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
          cutsPerSheet: actualCutsPerSheet,
          paperUsage,
          formulaExplanations,
          conversionFactor,
          inkCostPerColor,
          paperSize: selectedPaperSize,
          grammage: grammageValue,
          pricePerKg: paperPricePerKg
        });
      }
      
      setResults(newResults);
      setBreakdowns(newBreakdowns);
      
      // Restore original unit if changed during calculation
      if (startingUnit !== sizeUnit) {
        console.log("Restoring original unit from:", sizeUnit, "to:", startingUnit);
        setSizeUnit(startingUnit);
      }
      
      toast({
        title: "คำนวณเสร็จสิ้น",
        description: "ราคาถูกคำนวณเรียบร้อยแล้ว"
      });
      
      return true;
    } catch (error) {
      console.error("Error during calculation:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถคำนวณราคาได้",
        variant: "destructive"
      });
      return false;
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
    baseColors, setBaseColors: setBaseColorsAndSave,
    selectedCoating, setSelectedCoating: setSelectedCoatingAndSave,
    selectedCoatingSize, setSelectedCoatingSize: setSelectedCoatingSizeAndSave,
    hasSpotUv, setHasSpotUv: setHasSpotUvAndSave,
    selectedSpotUvSize, setSelectedSpotUvSize: setSelectedSpotUvSizeAndSave,
    quantities, setQuantities, addQuantity, removeQuantity, updateQuantity,
    wastage, setWastage: setWastageAndSave,
    hasDieCut, setHasDieCut: setHasDieCutAndSave,
    dieCutCost, setDieCutCost: setDieCutCostAndSave,
    hasBasePrint, setHasBasePrint: setHasBasePrintAndSave,
    basePrintCost, setBasePrintCost: setBasePrintCostAndSave,
    shippingCost, setShippingCost: setShippingCostAndSave,
    packagingCost, setPackagingCost: setPackagingCostAndSave,
    profitMargin, setProfitMargin: setProfitMarginAndSave,
    printPerSheet, setPrintPerSheet: setPrintPerSheetAndSave,
    validationError, setValidationError,
    showPreview, setShowPreview,
    isLayoutDetailsOpen, setIsLayoutDetailsOpen,
    bypassLayoutValidation, setBypassLayoutValidation,
    cutsPerSheet, setCutsPerSheet: setCutsPerSheetAndSave,
    plateType, setPlateType: setPlateTypeAndSave,
    
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
    inkCosts,
    
    // Functions
    handleLayoutChange,
    handleOpenLayoutDetails,
    calculate,
    validateForm,
    forceLayoutCalculation,
    handleCutsPerSheetChange,
  };
};
