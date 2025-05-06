
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";

const FormulaManager = () => {
  const { toast } = useToast();
  const [formulaSettings, setFormulaSettings] = useState({
    defaultWastage: 250,
    inkCostPerColor: 0.5,
    useAdvancedFormulas: false,
    paperWeightFormula: "(area_sqm * grammage / 1000)",
    paperCostFormula: "(weight * price_per_kg)",
    plateSelection: "size.width > 24 || size.height > 35 ? 'ตัด 2' : 'ตัด 4'"
  });

  const handleSaveSettings = () => {
    toast({
      title: "บันทึกการตั้งค่าเรียบร้อย",
      description: "สูตรคำนวณและค่าพารามิเตอร์ถูกอัปเดตแล้ว"
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">จัดการสูตรคำนวณ</h2>
          <p className="text-sm text-gray-600 mb-4">
            ตั้งค่าพารามิเตอร์และสูตรคำนวณต่าง ๆ สำหรับระบบคำนวณราคางานพิมพ์
          </p>
        </div>
        
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
                  onChange={(e) => setFormulaSettings({
                    ...formulaSettings,
                    defaultWastage: parseInt(e.target.value) || 0
                  })}
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
                  onChange={(e) => setFormulaSettings({
                    ...formulaSettings,
                    inkCostPerColor: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="useAdvancedFormulas" 
              checked={formulaSettings.useAdvancedFormulas}
              onCheckedChange={(checked) => setFormulaSettings({
                ...formulaSettings,
                useAdvancedFormulas: checked
              })}
            />
            <Label htmlFor="useAdvancedFormulas">ใช้สูตรคำนวณขั้นสูง</Label>
            <div className="tooltip">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="tooltiptext">เปิดใช้งานการตั้งค่าสูตรคำนวณแบบกำหนดเองด้วย JavaScript</span>
            </div>
          </div>
          
          {formulaSettings.useAdvancedFormulas && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="plateSelection">สูตรเลือกประเภทเพลท</Label>
                  <div className="tooltip">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="tooltiptext">สูตรเงื่อนไขในการเลือกประเภทเพลท เช่น size.width > 24 || size.height > 35 ? 'ตัด 2' : 'ตัด 4'</span>
                  </div>
                </div>
                <Textarea 
                  id="plateSelection" 
                  value={formulaSettings.plateSelection}
                  onChange={(e) => setFormulaSettings({
                    ...formulaSettings,
                    plateSelection: e.target.value
                  })}
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
                  onChange={(e) => setFormulaSettings({
                    ...formulaSettings,
                    paperWeightFormula: e.target.value
                  })}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="paperCostFormula">สูตรคำนวณราคากระดาษ</Label>
                  <div className="tooltip">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="tooltiptext">สูตรคำนวณราคากระดาษต่อแผ่น (บาท) เช่น (weight * price_per_kg)</span>
                  </div>
                </div>
                <Textarea 
                  id="paperCostFormula" 
                  value={formulaSettings.paperCostFormula}
                  onChange={(e) => setFormulaSettings({
                    ...formulaSettings,
                    paperCostFormula: e.target.value
                  })}
                  rows={2}
                />
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">ตัวแปรที่สามารถใช้ได้:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li><code>area_sqm</code> - พื้นที่กระดาษในหน่วยตารางเมตร</li>
                  <li><code>grammage</code> - แกรมกระดาษ (gsm)</li>
                  <li><code>weight</code> - น้ำหนักกระดาษต่อแผ่น (กก.)</li>
                  <li><code>price_per_kg</code> - ราคากระดาษต่อกิโลกรัม</li>
                  <li><code>size</code> - ขนาดกระดาษ (size.width, size.height)</li>
                  <li><code>job_size</code> - ขนาดงาน (job_size.width, job_size.height)</li>
                  <li><code>quantity</code> - จำนวนที่ต้องการพิมพ์</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormulaManager;
