
import React from "react";
import PrintCalculator from "@/components/PrintCalculator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, AlertCircle, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Print Pal Calculator</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/jobs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>จัดการงาน</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>จัดการข้อมูล</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <p className="mt-3 text-lg text-gray-600 mb-10">
          คำนวณราคางานพิมพ์ Offset อย่างแม่นยำและรวดเร็ว
        </p>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
          <div className="text-sm text-blue-600 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            <span>ขั้นตอนการใช้งาน:</span>
          </div>
          
          <ol className="list-decimal pl-8 space-y-1 text-sm text-blue-600">
            <li><strong>กรอกข้อมูลหลักของงาน (ชื่องาน, ลูกค้า, ผู้ทำใบราคา)</strong></li>
            <li>เลือกประเภทกระดาษ (เช่น Art Card, Art Paper)</li>
            <li><strong>เลือกขนาดกระดาษ (ขั้นตอนสำคัญ)</strong></li>
            <li>ระบุแกรมกระดาษและซัพพลายเออร์</li>
            <li>กำหนดขนาดงานที่ต้องการพิมพ์</li>
            <li>ระบุจำนวนพิมพ์และตั้งค่าการคำนวณเพิ่มเติม</li>
            <li>กดปุ่ม "คำนวณ" เพื่อดูผลลัพธ์</li>
            <li><strong>บันทึกงานเพื่อสามารถกลับมาแก้ไขได้ในภายหลัง</strong></li>
          </ol>

          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              <strong>สำคัญ:</strong> กรอกข้อมูลหลักของงานและเลือกทั้งประเภทกระดาษและขนาดกระดาษ เพื่อให้ระบบสามารถคำนวณและบันทึกงานได้อย่างถูกต้อง
            </p>
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
