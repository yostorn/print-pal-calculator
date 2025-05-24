import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaperTypeManager from "@/components/admin/PaperTypeManager";
import PaperGrammageManager from "@/components/admin/PaperGrammageManager";
import SupplierManager from "@/components/admin/SupplierManager";
import PlateManager from "@/components/admin/PlateManager";
import PaperSizeManager from "@/components/admin/PaperSizeManager";
import FormulaManager from "@/components/admin/FormulaManager";
import AdminNavigation from "@/components/admin/AdminNavigation";
import CoatingManager from "@/components/admin/CoatingManager";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Print Pal Admin</h1>
          <AdminNavigation />
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ตั้งค่าระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paper-types" className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
                <TabsTrigger value="paper-types">ประเภทกระดาษ</TabsTrigger>
                <TabsTrigger value="paper-sizes">ขนาดกระดาษ</TabsTrigger>
                <TabsTrigger value="paper-grammage">แกรมกระดาษ</TabsTrigger>
                <TabsTrigger value="suppliers">ซัพพลายเออร์</TabsTrigger>
                <TabsTrigger value="plates">เพลท</TabsTrigger>
                <TabsTrigger value="coating">การเคลือบ</TabsTrigger>
                <TabsTrigger value="formulas">สูตรคำนวณ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paper-types">
                <PaperTypeManager />
              </TabsContent>
              
              <TabsContent value="paper-sizes">
                <PaperSizeManager />
              </TabsContent>
              
              <TabsContent value="paper-grammage">
                <PaperGrammageManager />
              </TabsContent>
              
              <TabsContent value="suppliers">
                <SupplierManager />
              </TabsContent>
              
              <TabsContent value="plates">
                <PlateManager />
              </TabsContent>
              
              <TabsContent value="coating">
                <CoatingManager />
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
