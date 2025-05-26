
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaperTypeManager from "./PaperTypeManager";
import PaperGrammageManager from "./PaperGrammageManager";
import PaperSizeManager from "./PaperSizeManager";
import ImprovedPaperVariantManager from "./ImprovedPaperVariantManager";
import SupplierManager from "./SupplierManager";
import InkCostManager from "./InkCostManager";
import CoatingManager from "./CoatingManager";
import PlateManager from "./PlateManager";
import FormulaManager from "./FormulaManager";

const AdminNavigation = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ระบบจัดการข้อมูลพื้นฐาน
        </h1>
        <p className="text-gray-600">
          จัดการข้อมูลต้นทุนและพารามิเตอร์สำหรับการคำนวณราคา
        </p>
      </div>

      <Tabs defaultValue="paper-master" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="paper-master" className="text-xs lg:text-sm">
            Paper Master
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs lg:text-sm">
            ซัพพลายเออร์
          </TabsTrigger>
          <TabsTrigger value="ink-costs" className="text-xs lg:text-sm">
            ต้นทุนหมึก
          </TabsTrigger>
          <TabsTrigger value="coating" className="text-xs lg:text-sm">
            เคลือบ/UV
          </TabsTrigger>
          <TabsTrigger value="plates" className="text-xs lg:text-sm">
            แผ่นพิมพ์
          </TabsTrigger>
          <TabsTrigger value="formulas" className="text-xs lg:text-sm">
            สูตรคำนวณ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paper-master">
          <ImprovedPaperVariantManager />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierManager />
        </TabsContent>

        <TabsContent value="ink-costs">
          <InkCostManager />
        </TabsContent>

        <TabsContent value="coating">
          <CoatingManager />
        </TabsContent>

        <TabsContent value="plates">
          <PlateManager />
        </TabsContent>

        <TabsContent value="formulas">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="formulas" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="formulas">สูตรคำนวณ</TabsTrigger>
                  <TabsTrigger value="paper-types">ประเภทกระดาษ</TabsTrigger>
                  <TabsTrigger value="paper-grammages">แกรมกระดาษ</TabsTrigger>
                  <TabsTrigger value="paper-sizes">ขนาดกระดาษ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="formulas">
                  <FormulaManager />
                </TabsContent>
                
                <TabsContent value="paper-types">
                  <PaperTypeManager />
                </TabsContent>
                
                <TabsContent value="paper-grammages">
                  <PaperGrammageManager />
                </TabsContent>
                
                <TabsContent value="paper-sizes">
                  <PaperSizeManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNavigation;
