import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Plus, Minus, Eye } from "lucide-react";
import PaperTypeDropdown from "./PaperTypeDropdown";
import PaperGrammageDropdown from "./PaperGrammageDropdown";
import SupplierDropdown from "./SupplierDropdown";
import SizeInputs from "./SizeInputs";
import ResultsTable from "./ResultsTable";
import BreakdownDetails from "./BreakdownDetails";
import LayoutPreview from "./LayoutPreview";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchPaperTypes,
  fetchPaperSizes,
  fetchPaperGrammages,
  fetchSuppliers,
  fetchPaperPrice,
  fetchPlateCosts,
  fetchCalculationSettings
} from "@/services/supabaseService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const PrintCalculator = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Form state
  const [jobType, setJobType] = useState("");
  const [paperType, setPaperType] = useState("");
  const [paperGrammage, setPaperGrammage] = useState("");
  const [supplier, setSupplier] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"cm" | "inch">("cm");
  const [colors, setColors] = useState("4");
  const [hasCoating, setHasCoating] = useState(false);
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

  // Get selected paper size
  const [selectedPaperSize, setSelectedPaperSize] = useState<{width: number, height: number} | null>(null);
  
  useEffect(() => {
    if (paperType && paperSizes && paperSizes.length > 0) {
      // Default to the first paper size
      setSelectedPaperSize({
        width: paperSizes[0].width,
        height: paperSizes[0].height
      });
      
      // Auto show layout preview when all needed data is available
      if (width && height) {
        setShowPreview(true);
      }
    } else {
      setSelectedPaperSize(null);
      setShowPreview(false);
    }
  }, [paperType, paperSizes, width, height]);

  // Handle layout change from the preview component
  const handleLayoutChange = (perSheet: number) => {
    console.log("Layout changed, printPerSheet:", perSheet);
    setPrintPerSheet(perSheet);
    if (perSheet > 0) {
      setValidationError(""); // Clear validation error when layout is valid
    }
  };

  const handleOpenLayoutDetails = () => {
    setIsLayoutDetailsOpen(true);
    if (printPerSheet <= 0) {
      setValidationError(""); // Clear validation error so they can see the preview
    }
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
    if (printPerSheet <= 0) {
      setValidationError("กรุณาตรวจสอบการจัดวางงาน (คลิกที่ปุ่มดูรายละเอียดด้านล่าง)");
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

  // Component to render the layout details dialog/sheet content
  const LayoutDetailsContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        {selectedPaperSize && (
          <>
            <h3 className="font-medium">ขนาดกระดาษ</h3>
            <p>{selectedPaperSize.width} × {selectedPaperSize.height} นิ้ว</p>
            
            <h3 className="font-medium mt-4">ขนาดงาน</h3>
            <p>{width} × {height} {sizeUnit}</p>
            
            <h3 className="font-medium mt-4">จำนวนชิ้นต่อแผ่น</h3>
            <p className="text-lg font-bold">{printPerSheet > 0 ? printPerSheet : "รอการคำนวณ..."} ชิ้นต่อแผ่น</p>
            
            {printPerSheet > 0 && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                เรียบร้อย! การจัดวางง��นที่ดีที่สุดคือ {printPerSheet} ชิ้นต่อแผ่น
              </div>
            )}
          </>
        )}
      </div>
      
      {showPreview && selectedPaperSize && (
        <div className="border rounded-md p-4">
          <LayoutPreview 
            paperWidth={selectedPaperSize.width} 
            paperHeight={selectedPaperSize.height}
            jobWidth={parseFloat(width || "0") || 0}
            jobHeight={parseFloat(height || "0") || 0}
            onLayoutChange={handleLayoutChange}
          />
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Print Pal Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - inputs */}
          <div className="space-y-4">
            {validationError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {validationError}
              </div>
            )}
          
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="jobType">ประเภทงาน</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุประเภทของงานพิมพ์</span>
                </div>
              </div>
              <Input 
                id="jobType" 
                placeholder="ระบุประเภทงาน" 
                value={jobType} 
                onChange={(e) => setJobType(e.target.value)}
              />
            </div>
            
            <PaperTypeDropdown value={paperType} onChange={setPaperType} />
            
            <PaperGrammageDropdown 
              value={paperGrammage} 
              onChange={setPaperGrammage} 
              paperType={paperType}
            />
            
            <SupplierDropdown 
              value={supplier} 
              onChange={setSupplier} 
              paperType={paperType}
            />
            
            <SizeInputs 
              width={width} 
              height={height} 
              onWidthChange={setWidth} 
              onHeightChange={setHeight}
              onUnitChange={setSizeUnit}
            />
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="colors">จำนวนสีพิมพ์</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุจำนวนสีที่ใช้ในการพิมพ์</span>
                </div>
              </div>
              <Input 
                id="colors" 
                type="number" 
                min="1"
                value={colors} 
                onChange={(e) => setColors(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="hasCoating">มีตีพื้นหรือไม่</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">เลือกหากต้องการตีพื้น (เคลือบผิว)</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="hasCoating" 
                  checked={hasCoating} 
                  onCheckedChange={setHasCoating}
                />
                <Label htmlFor="hasCoating">
                  {hasCoating ? "มี" : "ไม่มี"}
                </Label>
              </div>
            </div>
            
            {hasCoating && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="coatingCost">ค่าพิมพ์เพิ่มตีพื้น (บาท/แผ่น)</Label>
                  <div className="tooltip">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="tooltiptext">ระบุค่าพิมพ์เพิ่มสำหรับตีพื้น คิดเป็นบาทต่อแผ่น</span>
                  </div>
                </div>
                <Input 
                  id="coatingCost" 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={coatingCost} 
                  onChange={(e) => setCoatingCost(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="hasDieCut">มีไดคัทหรือไม่</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">เลือกหากต้องการไดคัท</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="hasDieCut" 
                  checked={hasDieCut} 
                  onCheckedChange={setHasDieCut}
                />
                <Label htmlFor="hasDieCut">
                  {hasDieCut ? "มี" : "ไม่มี"}
                </Label>
              </div>
            </div>
            
            {hasDieCut && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="dieCutCost">ค่าไดคัท (บาท)</Label>
                  <div className="tooltip">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="tooltiptext">ระบุค่าไดคัท</span>
                  </div>
                </div>
                <Input 
                  id="dieCutCost" 
                  type="number" 
                  min="0"
                  value={dieCutCost} 
                  onChange={(e) => setDieCutCost(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="shippingCost">ค่าขนส่ง (บาท)</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุค่าขนส่ง</span>
                </div>
              </div>
              <Input 
                id="shippingCost" 
                type="number" 
                min="0"
                value={shippingCost} 
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="packagingCost">ค่าแพคกิ้ง (บาท)</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุค่าแพคกิ้ง</span>
                </div>
              </div>
              <Input 
                id="packagingCost" 
                type="number" 
                min="0"
                value={packagingCost} 
                onChange={(e) => setPackagingCost(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Label>ปริมาณที่ต้องการคำนวณ</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุจำนวนชิ้นงานที่ต้องการคำนวณราคา (สูงสุด 3 จำนวน)</span>
                </div>
              </div>
              {quantities.map((qty, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    placeholder={`จำนวนที่ ${index + 1}`}
                    type="number"
                    min="1"
                    value={qty} 
                    onChange={(e) => updateQuantity(index, e.target.value)}
                  />
                  {quantities.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => removeQuantity(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === quantities.length - 1 && quantities.length < 3 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={addQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="wastage">ค่าเผื่อเสีย (แผ่น)</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">จำนวนแผ่นที่เผื่อไว้สำหรับกระดาษเสียระหว่างการผลิต</span>
                </div>
              </div>
              <Input 
                id="wastage" 
                type="number" 
                min="0"
                value={wastage} 
                onChange={(e) => setWastage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="profitMargin">กำไร (%)</Label>
                <div className="tooltip">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="tooltiptext">ระบุเปอร์เซ็นต์กำไรที่ต้องการ</span>
                </div>
              </div>
              <Input 
                id="profitMargin" 
                type="number" 
                min="0"
                max="100"
                value={profitMargin} 
                onChange={(e) => setProfitMargin(e.target.value)}
              />
            </div>

            {/* Add the layout details button here before the calculate button */}
            {showPreview && (
              <>
                {isMobile ? (
                  <Sheet open={isLayoutDetailsOpen} onOpenChange={setIsLayoutDetailsOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        className="w-full mb-2" 
                        variant="outline"
                        onClick={handleOpenLayoutDetails}
                      >
                        <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียดการจัดวางงาน
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>รายละเอียดการจัดวางงาน</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <LayoutDetailsContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Dialog open={isLayoutDetailsOpen} onOpenChange={setIsLayoutDetailsOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full mb-2" 
                        variant="outline"
                        onClick={handleOpenLayoutDetails}
                      >
                        <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียดการจัดวางงาน
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดการจัดวางงาน</DialogTitle>
                      </DialogHeader>
                      <LayoutDetailsContent />
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
            
            <Button 
              className="w-full" 
              onClick={calculate}
            >
              คำนวณ
            </Button>
          </div>
          
          {/* Right column - results */}
          <div className="space-y-4">
            {/* Layout Preview */}
            {selectedPaperSize && showPreview && (
              <div>
                <LayoutPreview 
                  paperWidth={selectedPaperSize.width} 
                  paperHeight={selectedPaperSize.height}
                  jobWidth={parseFloat(width || "0") || 0}
                  jobHeight={parseFloat(height || "0") || 0}
                  onLayoutChange={handleLayoutChange}
                />
                {printPerSheet > 0 && (
                  <div className="mt-2 text-center text-sm text-green-600 font-medium">
                    เรียบร้อย! ชิ้นงานสามารถวางได้ {printPerSheet} ชิ้นต่อแผ่น
                  </div>
                )}
              </div>
            )}
            
            <ResultsTable 
              quantities={quantities} 
              results={results}
              onSelectQuantity={(index) => setSelectedQuantityIndex(index)}
              selectedQuantityIndex={selectedQuantityIndex}
            />
            
            {results.length > 0 && (
              <BreakdownDetails
                selectedQuantityIndex={selectedQuantityIndex}
                breakdowns={breakdowns}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintCalculator;
