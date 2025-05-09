
import React from "react";
import PrintCalculator from "@/components/PrintCalculator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Print Pal Calculator</h1>
          <Button variant="outline" asChild>
            <Link to="/admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>จัดการข้อมูล</span>
            </Link>
          </Button>
        </div>
        
        <p className="mt-3 text-lg text-gray-600 mb-10">
          คำนวณราคางานพิมพ์ Offset อย่างแม่นยำและรวดเร็ว
        </p>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
          <div className="text-sm text-blue-600 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            <span>คำแนะนำ: กรอกประเภทกระดาษ, แกรมกระดาษ, ซัพพลายเออร์, และขนาดงาน จากนั้นระบบจะแสดงตัวอย่างการจัดวางงานให้อัตโนมัติ</span>
          </div>
          <div className="text-sm text-blue-600 flex items-center">
            <span className="mr-2">📝</span>
            <span>สามารถเลือกประเภทการเคลือบและระบุค่าเคลือบได้ในส่วนของข้อมูลการพิมพ์</span>
          </div>
        </div>
        
        <PrintCalculator />
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Print Pal Calculator - ระบบคำนวณราคางานพิมพ์ Offset</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
