import { useState, useEffect } from "react";
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
  const [shippingCost, setShippingCost] = useState("0");
  const [packagingCost, setPackagingCost] = useState("0");
  const [profitMargin, setProfitMargin] = useState("30");
  const [printPerSheet, setPrintPerSheet] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLayoutDetailsOpen, setIsLayoutDetailsOpen] = useState(false);

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

  const { data: paperSizes } = useQuery({
    queryKey: ['paperSizes', paperType],
    queryFn: () => fetchPaperSizes(paperType),
    enabled: !!paperType
  });

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

  // Update this useEffect to show layout preview as soon as paper type is selected
  useEffect(() => {
    if (paperType && paperSizes && paperSizes.length > 0) {
      // Default to the first paper size
      setSelectedPaperSize({
        width: paperSizes[0].width,
        height: paperSizes[0].height
      });
      
      // Always show preview when paper size is available
      setShowPreview(true);
      
      // Log for debugging
      console.log("Selected paper type and size:", { 
        paperType, 
        paperSize: paperSizes[0],
        width: paperSizes[0].width,
        height: paperSizes[0].height
      });
    } else {
      setSelectedPaperSize(null);
      setShowPreview(false);
      console.log("Paper size not available:", { paperType, paperSizes });
    }
  }, [paperType, paperSizes]);

  // Add separate effect for updating layout preview when dimensions change
  useEffect(() => {
    if (width && height && selectedPaperSize) {
      console.log("Dimensions changed, showing preview with:", { 
        width, 
        height, 
        paperSize: selectedPaperSize,
        printPerSheet
      });
      setShowPreview(true);
      
      // Clear validation errors if dimensions are provided
      if (validationError && (validationError.includes("ขนาดงาน") || validationError.includes("กรุณาระบุขนาด"))) {
        setValidationError("");
      }
    }
  }, [width, height, selectedPaperSize, validationError]);

  // Handle layout change from the preview component
  const handleLayoutChange = (perSheet: number) => {
    console.log("Layout changed, printPerSheet:", perSheet);
    setPrintPerSheet(perSheet);
    
    // Clear validation errors related to layout when we get a valid count
    if (perSheet > 0) {
      if (validationError && (validationError.includes("การจัดวาง") || validationError.includes("วางงาน"))) {
        setValidationError("");
      }
    }
  };

  const handleOpenLayoutDetails = () => {
    // Instead of showing validation errors, just open the dialog and let the user see what's missing
    console.log("Opening layout details with current state:", {
      paperType,
      width,
      height,
      selectedPaperSize,
      printPerSheet
    });
    
    setIsLayoutDetailsOpen(true);
  };

  const handleCloseLayoutDetails = () => {
    setIsLayoutDetailsOpen(false);
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

  // Validate the form before calculation
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
      selectedPaperSize
    });
    
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
    if (!width || !height) {
      setValidationError("กรุณาระบุขนาดงาน");
      return false;
    }
    if (!colors) {
      setValidationError("กรุณาระบุจำนวนสี");
      return false;
    }
    
    // Check printPerSheet with better error message
    if (printPerSheet <= 0) {
      // Try to analyze why it might be zero
      if (!selectedPaperSize) {
        setValidationError("กรุณาเลือกประเภทกระดาษ และขนาดกระดาษ");
      } else {
        setValidationError("ไม่สามารถคำนวณการจัดวางได้ กรุณาตรวจสอบขนาดงานและกระดาษ");
      }
      
      // Force layout calculation if we have all the required dimensions
      if (selectedPaperSize && width && height) {
        console.log("Forcing layout calculation with:", {
          paperWidth: selectedPaperSize.width,
          paperHeight: selectedPaperSize.height,
          jobWidth: parseFloat(width),
          jobHeight: parseFloat(height)
        });
        
        // Instead of validation error, open layout details
        setIsLayoutDetailsOpen(true);
      }
      
      return false;
    }
    
    if (!quantities[0]) {
      setValidationError("กรุณาระบุปริมาณที่ต้องการคำนวณ");
      return false;
    }

    setValidationError("");
    return true;
  };

  // Show layout preview when all required fields are filled
  useEffect(() => {
    if (paperType && width && height && selectedPaperSize) {
      console.log("All required fields filled, showing preview");
      setShowPreview(true);
    }
  }, [paperType, width, height, selectedPaperSize]);

  // Calculate results
  const calculate = async () => {
    console.log("Starting calculation with values:", {
      paperType, paperGrammage, supplier, width, height, printPerSheet, quantities
    });

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
      if (!selectedPaperSize) continue;
      
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
      
      // Calculate die-cut cost if applicable
      const dieCutCostTotal = hasDieCut ? parseFloat(dieCutCost || "0") : 0;
      
      // Calculate shipping and packaging costs
      const shippingCostTotal = parseFloat(shippingCost || "0");
      const packagingCostTotal = parseFloat(packagingCost || "0");
      
      // Calculate total cost before profit
      const baseCost = plateCost + paperCost + inkCost + coatingCostTotal + dieCutCostTotal + shippingCostTotal + packagingCostTotal;
      
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
    shippingCost, setShippingCost,
    packagingCost, setPackagingCost,
    profitMargin, setProfitMargin,
    printPerSheet, setPrintPerSheet,
    validationError, setValidationError,
    showPreview, setShowPreview,
    isLayoutDetailsOpen, setIsLayoutDetailsOpen,
    
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
    handleCloseLayoutDetails,
    calculate,
    validateForm
  };
};
