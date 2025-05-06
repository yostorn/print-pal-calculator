
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Plus, Minus } from "lucide-react";
import PaperTypeDropdown from "./PaperTypeDropdown";
import PaperGrammageDropdown from "./PaperGrammageDropdown";
import SupplierDropdown from "./SupplierDropdown";
import SizeInputs from "./SizeInputs";
import ResultsTable from "./ResultsTable";
import BreakdownDetails from "./BreakdownDetails";

const PrintCalculator = () => {
  // Form state
  const [jobType, setJobType] = useState("");
  const [paperType, setPaperType] = useState("");
  const [paperGrammage, setPaperGrammage] = useState("");
  const [supplier, setSupplier] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [colors, setColors] = useState("4");
  const [hasCoating, setHasCoating] = useState(false);
  const [coatingCost, setCoatingCost] = useState("0");
  const [quantities, setQuantities] = useState<string[]>(["1000"]);
  const [wastage, setWastage] = useState("250");

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [selectedQuantityIndex, setSelectedQuantityIndex] = useState(0);

  // Paper data (in real app, this would come from backend)
  const paperData = {
    // Each paper type has size options in inches and price per kg
    "art-card": {
      sizes: [
        { width: 31, height: 43, name: "31×43 นิ้ว" },
        { width: 24, height: 35, name: "24×35 นิ้ว" }
      ],
      prices: {
        "210": { "supplier-a": 85, "supplier-b": 87, "supplier-c": 86 },
        "230": { "supplier-a": 92, "supplier-b": 95, "supplier-c": 93 },
        "250": { "supplier-a": 100, "supplier-b": 102, "supplier-c": 101 },
        "300": { "supplier-a": 120, "supplier-b": 122, "supplier-c": 121 }
      }
    },
    "art-paper": {
      sizes: [
        { width: 31, height: 43, name: "31×43 นิ้ว" },
        { width: 24, height: 35, name: "24×35 นิ้ว" }
      ],
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
      sizes: [
        { width: 31, height: 43, name: "31×43 นิ้ว" },
        { width: 24, height: 35, name: "24×35 นิ้ว" }
      ],
      prices: {
        "70": { "supplier-b": 40, "supplier-c": 41, "supplier-f": 39 },
        "80": { "supplier-b": 45, "supplier-c": 46, "supplier-f": 44 },
        "90": { "supplier-b": 50, "supplier-c": 51, "supplier-f": 49 },
        "100": { "supplier-b": 55, "supplier-c": 56, "supplier-f": 54 }
      }
    },
    "newsprint": {
      sizes: [
        { width: 31, height: 43, name: "31×43 นิ้ว" },
        { width: 24, height: 35, name: "24×35 นิ้ว" }
      ],
      prices: {
        "45": { "supplier-g": 30, "supplier-h": 31 },
        "48": { "supplier-g": 32, "supplier-h": 33 },
        "52": { "supplier-g": 35, "supplier-h": 36 }
      }
    }
  };

  // Plate costs (in real app, this would be configured in backend)
  const plateCosts = {
    "ตัด 2": 800,
    "ตัด 4": 500
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

  // Calculate results
  const calculate = () => {
    if (!paperType || !paperGrammage || !supplier || !width || !height || !colors) {
      return;
    }

    const newResults = [];
    const newBreakdowns = [];

    for (const quantity of quantities) {
      if (!quantity) continue;
      
      const qtyNum = parseInt(quantity);
      
      // Get paper sizes available for the paper type
      const availableSizes = paperData[paperType as keyof typeof paperData]?.sizes || [];
      
      // Convert job size from cm to inches
      const jobWidthInch = parseFloat(width) / 2.54;
      const jobHeightInch = parseFloat(height) / 2.54;
      
      // Find the optimal layout and paper size
      let bestLayout = {
        paperSize: availableSizes[0],
        printPerSheet: 0,
        orientation: "portrait" as "portrait" | "landscape"
      };
      
      availableSizes.forEach(paperSize => {
        // Try portrait orientation (job width × job height)
        const portraitCols = Math.floor(paperSize.width / jobWidthInch);
        const portraitRows = Math.floor(paperSize.height / jobHeightInch);
        const portraitPerSheet = portraitCols * portraitRows;
        
        // Try landscape orientation (job height × job width)
        const landscapeCols = Math.floor(paperSize.width / jobHeightInch);
        const landscapeRows = Math.floor(paperSize.height / jobWidthInch);
        const landscapePerSheet = landscapeCols * landscapeRows;
        
        // Use the better orientation
        if (portraitPerSheet > bestLayout.printPerSheet) {
          bestLayout = {
            paperSize,
            printPerSheet: portraitPerSheet,
            orientation: "portrait"
          };
        }
        
        if (landscapePerSheet > bestLayout.printPerSheet) {
          bestLayout = {
            paperSize,
            printPerSheet: landscapePerSheet,
            orientation: "landscape"
          };
        }
      });
      
      // Calculate sheets needed
      const wastageNum = parseInt(wastage) || 0;
      const sheetsNeeded = Math.ceil(qtyNum / bestLayout.printPerSheet);
      const totalSheets = sheetsNeeded + wastageNum;
      
      // Determine plate type based on paper size
      const plateType = (bestLayout.paperSize.width > 24 || bestLayout.paperSize.height > 35) 
        ? "ตัด 2" 
        : "ตัด 4";
      
      // Calculate costs
      const plateCost = plateCosts[plateType] * parseInt(colors);
      
      // Calculate paper weight and cost
      const paperPricePerKg = paperData[paperType as keyof typeof paperData]?.prices[paperGrammage as keyof typeof paperData[keyof typeof paperData]["prices"]]?.[supplier as keyof typeof paperData[keyof typeof paperData]["prices"][keyof typeof paperData[keyof typeof paperData]["prices"]]] || 0;
      
      const paperAreaSqM = (bestLayout.paperSize.width * bestLayout.paperSize.height) / (39.37 * 39.37); // Convert square inches to square meters
      const paperWeightPerSheet = paperAreaSqM * (parseInt(paperGrammage) / 1000); // Weight in kg
      const sheetCost = paperWeightPerSheet * paperPricePerKg;
      const paperCost = totalSheets * sheetCost;
      
      // Calculate coating cost if applicable
      const coatingCostTotal = hasCoating ? totalSheets * parseFloat(coatingCost) : 0;
      
      // Calculate ink cost (simplified estimation - in a real app this would be more complex)
      const inkCostPerSheet = parseInt(colors) * 0.5; // Simplified - 0.5 baht per color per sheet
      const inkCost = totalSheets * inkCostPerSheet;
      
      // Total cost and per unit cost
      const totalCost = plateCost + paperCost + inkCost + coatingCostTotal;
      const unitCost = totalCost / qtyNum;
      
      newResults.push({
        totalCost,
        unitCost,
        printPerSheet: bestLayout.printPerSheet,
        sheets: totalSheets,
        paperSize: bestLayout.paperSize.name,
      });
      
      newBreakdowns.push({
        plateType,
        plateCost,
        paperCost,
        inkCost,
        basePlateCost: plateCosts[plateType],
        totalSheets,
        sheetCost,
        colorNumber: parseInt(colors),
        hasCoating,
        coatingCost: coatingCostTotal,
        wastage: wastageNum
      });
    }
    
    setResults(newResults);
    setBreakdowns(newBreakdowns);
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
            
            <Button 
              className="w-full" 
              onClick={calculate}
              disabled={!paperType || !paperGrammage || !supplier || !width || !height || !quantities[0]}
            >
              คำนวณ
            </Button>
          </div>
          
          {/* Right column - results */}
          <div>
            <ResultsTable quantities={quantities} results={results} />
            
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
