
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Info, Loader2 } from "lucide-react";
import { fetchFormulaSettings, updateFormulaSettings } from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";

const FormulaManager = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formulaSettings, setFormulaSettings] = useState({
    defaultWastage: "250",
    inkCostPerColor: "0.5",
    useAdvancedFormulas: "false",
    paperWeightFormula: "(area_sqm * grammage / 1000)",
    paperCostFormula: "(reams * size.width * size.height * grammage / 3100 * price_per_kg)",
    plateSelection: "size.width > 24 || size.height > 35 ? 'ตัด 2' : 'ตัด 4'",
    conversionFactor: "3100"
  });

  // Fetch formula settings from the database
  const { data: dbSettings, isLoading, error, refetch } = useQuery({
    queryKey: ['formulaSettings'],
    queryFn: fetchFormulaSettings,
  });

  // Update local state when settings are fetched from the database
  useEffect(() => {
    if (dbSettings) {
      setFormulaSettings(prevSettings => ({
        ...prevSettings,
        ...dbSettings
      }));
      setHasChanges(false);
    }
  }, [dbSettings]);

  // Update state when a setting changes
  const handleSettingChange = (name: keyof typeof formulaSettings, value: string) => {
    setFormulaSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
    setHasChanges(true);
  };

  // Handle boolean setting changes (for switches)
  const handleBooleanSettingChange = (name: keyof typeof formulaSettings, checked: boolean) => {
    handleSettingChange(name, checked.toString());
  };

  // Save settings to the database
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await updateFormulaSettings(formulaSettings);
      await refetch();
      
      toast({
        title: "บันทึกการตั้งค่าเรียบร้อย",
        description: "สูตรคำนวณและค่าพารามิเตอร์ถูกอัปเดตแล้ว"
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving formula settings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            เกิดข้อผิดพลาดในการโหลดการตั้งค่า: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการสูตรคำนวณ</h2>
          <p className="text-sm text-gray-600 mb-4">
            ตั้งค่าพารามิเตอร์และสูตรคำนวณต่าง ๆ สำหรับระบบคำนวณราคางานพิมพ์
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">กำลังโหลดการตั้งค่า...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-semibold mb-3">ค่าพารามิเตอร์พื้นฐาน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="defaultWastage">ค่าเผื่อเสียเริ่มต้น (แผ่น)</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">จำนวนแผ่นที่เผื่อไว้สำหรับกระดาษเสียเริ่มต้น</span>
                    </div>
                  </div>
                  <Input 
                    id="defaultWastage" 
                    type="number" 
                    min="0"
                    value={formulaSettings.defaultWastage}
                    onChange={(e) => handleSettingChange("defaultWastage", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="inkCostPerColor">ค่าสีพิมพ์ต่อสีต่อแผ่น (บาท)</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">ราคาสีพิมพ์ต่อหนึ่งสีต่อแผ่น</span>
                    </div>
                  </div>
                  <Input 
                    id="inkCostPerColor" 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formulaSettings.inkCostPerColor}
                    onChange={(e) => handleSettingChange("inkCostPerColor", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="conversionFactor">ค่าคงที่แปลงหน่วย</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">ค่าคงที่ 3100 ที่ใช้ในการแปลงหน่วยในสูตรคำนวณน้ำหนักกระดาษ</span>
                    </div>
                  </div>
                  <Input 
                    id="conversionFactor" 
                    type="number" 
                    min="1"
                    value={formulaSettings.conversionFactor}
                    onChange={(e) => handleSettingChange("conversionFactor", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="useAdvancedFormulas" 
                checked={formulaSettings.useAdvancedFormulas === "true"}
                onCheckedChange={(checked) => handleBooleanSettingChange("useAdvancedFormulas", checked)}
              />
              <Label htmlFor="useAdvancedFormulas">ใช้สูตรคำนวณขั้นสูง</Label>
              <div className="tooltip">
                <Info className="h-4 w-4 text-gray-400" />
                <span className="tooltiptext">เปิดใช้งานการตั้งค่าสูตรคำนวณแบบกำหนดเองด้วย JavaScript</span>
              </div>
            </div>
            
            {formulaSettings.useAdvancedFormulas === "true" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="plateSelection">สูตรเลือกประเภทเพลท</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">สูตรเงื่อนไขในการเลือกประเภทเพลท เช่น size.width {`>`} 24 || size.height {`>`} 35 ? &apos;ตัด 2&apos; : &apos;ตัด 4&apos;</span>
                    </div>
                  </div>
                  <Textarea 
                    id="plateSelection" 
                    value={formulaSettings.plateSelection}
                    onChange={(e) => handleSettingChange("plateSelection", e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="paperWeightFormula">สูตรคำนวณน้ำหนักกระดาษ</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">สูตรคำนวณน้ำหนักกระดาษต่อแผ่น (กก.) เช่น (area_sqm * grammage / 1000)</span>
                    </div>
                  </div>
                  <Textarea 
                    id="paperWeightFormula" 
                    value={formulaSettings.paperWeightFormula}
                    onChange={(e) => handleSettingChange("paperWeightFormula", e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="paperCostFormula">สูตรคำนวณราคากระดาษ</Label>
                    <div className="tooltip">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="tooltiptext">สูตรคำนวณราคากระดาษรวม เช่น (reams * size.width * size.height * grammage / 3100 * price_per_kg)</span>
                    </div>
                  </div>
                  <Textarea 
                    id="paperCostFormula" 
                    value={formulaSettings.paperCostFormula}
                    onChange={(e) => handleSettingChange("paperCostFormula", e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">ตัวแปรที่สามารถใช้ได้:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li><code>area_sqm</code> - พื้นที่กระดาษในหน่วยตารางเมตร</li>
                    <li><code>grammage</code> - แกรมกระดาษ (gsm)</li>
                    <li><code>reams</code> - จำนวนรีมกระดาษที่ต้องใช้</li>
                    <li><code>weight</code> - น้ำหนักกระดาษต่อแผ่น (กก.)</li>
                    <li><code>price_per_kg</code> - ราคากระดาษต่อกิโลกรัม</li>
                    <li><code>size</code> - ขนาดกระดาษ (size.width, size.height) ในหน่วยนิ้ว</li>
                    <li><code>job_size</code> - ขนาดงาน (job_size.width, job_size.height) ในหน่วยนิ้ว</li>
                    <li><code>quantity</code> - จำนวนที่ต้องการพิมพ์</li>
                    <li><code>conversion_factor</code> - ค่าคงที่สำหรับการแปลงหน่วย (ค่าเริ่มต้น 3100)</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={() => refetch()} disabled={isSaving}>
                  ยกเลิกการเปลี่ยนแปลง
                </Button>
              )}
              <Button onClick={handleSaveSettings} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  "บันทึกการตั้งค่า"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormulaManager;
