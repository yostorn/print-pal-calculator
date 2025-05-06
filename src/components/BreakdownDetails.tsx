
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface BreakdownDetailsProps {
  selectedQuantityIndex: number;
  breakdowns: {
    plateType: string;
    plateCost: number;
    paperCost: number;
    inkCost: number;
    basePlateCost: number;
    totalSheets: number;
    sheetCost: number;
    colorNumber: number;
    hasCoating: boolean;
    coatingCost: number;
    wastage: number;
  }[];
}

const BreakdownDetails: React.FC<BreakdownDetailsProps> = ({
  selectedQuantityIndex,
  breakdowns,
}) => {
  const { toast } = useToast();
  
  if (breakdowns.length === 0 || !breakdowns[selectedQuantityIndex]) {
    return null;
  }

  const currentBreakdown = breakdowns[selectedQuantityIndex];

  const handleAdjust = () => {
    toast({
      title: "ปรับราคา",
      description: "ฟีเจอร์การปรับราคาจะมาในเวอร์ชันถัดไป",
    });
  };

  const handlePreview = () => {
    toast({
      title: "พรีวิวรายงาน A4",
      description: "ฟีเจอร์การพรีวิวจะมาในเวอร์ชันถัดไป",
    });
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <CardTitle className="mb-4">รายละเอียดการคำนวณ</CardTitle>
        
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="summary">สรุป</TabsTrigger>
            <TabsTrigger value="details">รายละเอียด</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4 calculation-box">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ประเภทเพลท</p>
                <p className="font-medium">{currentBreakdown.plateType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">จำนวนแผ่นกระดาษทั้งหมด</p>
                <p className="font-medium">{currentBreakdown.totalSheets} แผ่น</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ค่าเผื่อเสีย</p>
                <p className="font-medium">{currentBreakdown.wastage} แผ่น</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">จำนวนสี</p>
                <p className="font-medium">{currentBreakdown.colorNumber} สี</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ค่าเพลท:</span>
                <span className="font-medium">{currentBreakdown.plateCost.toLocaleString("th-TH")} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ค่ากระดาษ:</span>
                <span className="font-medium">{currentBreakdown.paperCost.toLocaleString("th-TH")} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าสีพิมพ์:</span>
                <span className="font-medium">{currentBreakdown.inkCost.toLocaleString("th-TH")} บาท</span>
              </div>
              {currentBreakdown.hasCoating && (
                <div className="flex justify-between">
                  <span>ค่าตีพื้น:</span>
                  <span className="font-medium">{currentBreakdown.coatingCost.toLocaleString("th-TH")} บาท</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>ราคารวมทั้งหมด:</span>
              <span>{(currentBreakdown.plateCost + currentBreakdown.paperCost + currentBreakdown.inkCost + (currentBreakdown.hasCoating ? currentBreakdown.coatingCost : 0)).toLocaleString("th-TH")} บาท</span>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 calculation-box">
            <div className="space-y-4">
              <h3 className="font-semibold">รายละเอียดค่าเพลท</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ประเภทเพลท</p>
                  <p className="font-medium">{currentBreakdown.plateType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ราคาพื้นฐาน</p>
                  <p className="font-medium">{currentBreakdown.basePlateCost} บาท/เพลท</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">จำนวนสี</p>
                  <p className="font-medium">{currentBreakdown.colorNumber} สี</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">รวมค่าเพลท</p>
                  <p className="font-medium">{currentBreakdown.plateCost} บาท</p>
                </div>
              </div>
              
              <Separator />
              
              <h3 className="font-semibold">รายละเอียดค่ากระดาษ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">จำนวนแผ่น</p>
                  <p className="font-medium">{currentBreakdown.totalSheets} แผ่น</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ค่ากระดาษต่อแผ่น</p>
                  <p className="font-medium">{currentBreakdown.sheetCost} บาท</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">รวมค่ากระดาษ</p>
                  <p className="font-medium">{currentBreakdown.paperCost} บาท</p>
                </div>
              </div>
              
              {currentBreakdown.hasCoating && (
                <>
                  <Separator />
                  <h3 className="font-semibold">รายละเอียดค่าตีพื้น</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">จำนวนแผ่น</p>
                      <p className="font-medium">{currentBreakdown.totalSheets} แผ่น</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">รวมค่าตีพื้น</p>
                      <p className="font-medium">{currentBreakdown.coatingCost} บาท</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleAdjust} variant="outline">Adjust</Button>
          <Button onClick={handlePreview}>Preview A4</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakdownDetails;
