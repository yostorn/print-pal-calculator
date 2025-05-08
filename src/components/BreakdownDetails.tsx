
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownDetailsProps {
  breakdowns: any[];
  selectedQuantityIndex: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

const BreakdownDetails: React.FC<BreakdownDetailsProps> = ({ breakdowns, selectedQuantityIndex }) => {
  if (!breakdowns.length || !breakdowns[selectedQuantityIndex]) {
    return null;
  }

  const breakdown = breakdowns[selectedQuantityIndex];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">รายละเอียดการคำนวณ</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium">ขนาดเพลท:</dt>
            <dd>{breakdown.plateType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">ราคาเพลท:</dt>
            <dd>{formatCurrency(breakdown.basePlateCost)} × {breakdown.colorNumber} สี = {formatCurrency(breakdown.plateCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">จำนวนแผ่นรวม:</dt>
            <dd>{breakdown.totalSheets} แผ่น (รวมเผื่อเสีย {breakdown.wastage} แผ่น)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">ราคากระดาษต่อแผ่น:</dt>
            <dd>{formatCurrency(breakdown.sheetCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">ราคากระดาษรวม:</dt>
            <dd>{formatCurrency(breakdown.paperCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">ค่าหมึก:</dt>
            <dd>{formatCurrency(breakdown.inkCost)}</dd>
          </div>
          
          {breakdown.hasCoating && (
            <div className="flex justify-between">
              <dt className="font-medium">ค่าตีพื้น:</dt>
              <dd>{formatCurrency(breakdown.coatingCost)}</dd>
            </div>
          )}
          
          {breakdown.hasDieCut && (
            <div className="flex justify-between">
              <dt className="font-medium">ค่าไดคัท:</dt>
              <dd>{formatCurrency(breakdown.dieCutCost)}</dd>
            </div>
          )}
          
          {breakdown.shippingCost > 0 && (
            <div className="flex justify-between">
              <dt className="font-medium">ค่าขนส่ง:</dt>
              <dd>{formatCurrency(breakdown.shippingCost)}</dd>
            </div>
          )}
          
          {breakdown.packagingCost > 0 && (
            <div className="flex justify-between">
              <dt className="font-medium">ค่าแพคกิ้ง:</dt>
              <dd>{formatCurrency(breakdown.packagingCost)}</dd>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between">
            <dt className="font-medium">ต้นทุนรวม:</dt>
            <dd>{formatCurrency(breakdown.baseCost)}</dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="font-medium">กำไร ({(breakdown.profitMargin * 100).toFixed(0)}%):</dt>
            <dd>{formatCurrency(breakdown.profit)}</dd>
          </div>
          
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <dt>ราคารวมทั้งหมด:</dt>
            <dd>{formatCurrency(breakdown.baseCost + breakdown.profit)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default BreakdownDetails;
