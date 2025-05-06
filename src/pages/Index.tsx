
import React from "react";
import PrintCalculator from "@/components/PrintCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Print Pal Calculator</h1>
          <p className="mt-3 text-lg text-gray-600">
            คำนวณราคางานพิมพ์ Offset อย่างแม่นยำและรวดเร็ว
          </p>
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
