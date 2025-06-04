
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaperTypeManager from "@/components/admin/PaperTypeManager";
import PaperGrammageManager from "@/components/admin/PaperGrammageManager";
import PaperSizeManager from "@/components/admin/PaperSizeManager";
import ImprovedPaperVariantManager from "@/components/admin/ImprovedPaperVariantManager";
import SupplierManager from "@/components/admin/SupplierManager";
import PlateManager from "@/components/admin/PlateManager";
import FormulaManager from "@/components/admin/FormulaManager";
import CoatingManager from "@/components/admin/CoatingManager";
import InkCostManager from "@/components/admin/InkCostManager";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ระบบจัดการข้อมูลพื้นฐาน
            </h1>
            <p className="text-gray-600">
              จัดการข้อมูลต้นทุนและพารามิเตอร์สำหรับการคำนวณราคา
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Button>
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            <Tabs defaultValue="paper" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
                <TabsTrigger value="paper" className="text-xs lg:text-sm">
                  กระดาษ
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

              {/* Paper Management - Main Tab */}
              <TabsContent value="paper">
                <Card>
                  <CardHeader>
                    <CardTitle>จัดการข้อมูลกระดาษ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="paper-master" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                        <TabsTrigger value="paper-master">Paper Master</TabsTrigger>
                        <TabsTrigger value="suppliers">ซัพพลายเออร์</TabsTrigger>
                        <TabsTrigger value="paper-types">ประเภทกระดาษ</TabsTrigger>
                        <TabsTrigger value="paper-grammages">แกรมกระดาษ</TabsTrigger>
                        <TabsTrigger value="paper-sizes">ขนาดกระดาษ</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="paper-master">
                        <ImprovedPaperVariantManager />
                      </TabsContent>

                      <TabsContent value="suppliers">
                        <SupplierManager />
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
                <FormulaManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
