
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface BreakdownDetailsProps {
  breakdown: {
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
    coatingType: string;
    hasDieCut: boolean;
    dieCutCost: number;
    hasBasePrint?: boolean;
    basePrintCost?: number;
    shippingCost: number;
    packagingCost: number;
    profitMargin: number;
    profit: number;
    baseCost: number;
    wastage: number;
  };
}

const BreakdownDetails: React.FC<BreakdownDetailsProps> = ({ breakdown }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">รายละเอียดการคำนวณ</h3>
      
      <Table className="border">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">ขนาดเพลท:</TableCell>
            <TableCell>{breakdown.plateType}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">รวมค่าเพลท ({breakdown.colorNumber} สี):</TableCell>
            <TableCell>{formatCurrency(breakdown.plateCost)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">ค่ากระดาษทั้งหมด ({breakdown.totalSheets} แผ่น):</TableCell>
            <TableCell>{formatCurrency(breakdown.paperCost)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">ค่าหมึก:</TableCell>
            <TableCell>{formatCurrency(breakdown.inkCost)}</TableCell>
          </TableRow>
          
          {breakdown.hasCoating && (
            <TableRow>
              <TableCell className="font-medium">
                ค่าเคลือบ {breakdown.coatingType}:
              </TableCell>
              <TableCell>{formatCurrency(breakdown.coatingCost)}</TableCell>
            </TableRow>
          )}
          
          {breakdown.hasDieCut && (
            <TableRow>
              <TableCell className="font-medium">ค่าไดคัท:</TableCell>
              <TableCell>{formatCurrency(breakdown.dieCutCost)}</TableCell>
            </TableRow>
          )}
          
          {/* Add base print cost row if applicable */}
          {breakdown.hasBasePrint && (
            <TableRow>
              <TableCell className="font-medium">ค่าตีพื้น:</TableCell>
              <TableCell>{formatCurrency(breakdown.basePrintCost || 0)}</TableCell>
            </TableRow>
          )}
          
          <TableRow>
            <TableCell className="font-medium">ค่าขนส่ง:</TableCell>
            <TableCell>{formatCurrency(breakdown.shippingCost)}</TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">ค่าแพคกิ้ง:</TableCell>
            <TableCell>{formatCurrency(breakdown.packagingCost)}</TableCell>
          </TableRow>
          
          <TableRow className="bg-gray-50">
            <TableCell className="font-medium">ต้นทุนรวม:</TableCell>
            <TableCell className="font-medium">{formatCurrency(breakdown.baseCost)}</TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">กำไร ({(breakdown.profitMargin * 100).toFixed(0)}%):</TableCell>
            <TableCell>{formatCurrency(breakdown.profit)}</TableCell>
          </TableRow>
          
          <TableRow className="bg-blue-50">
            <TableCell className="font-medium text-blue-800">ราคารวมทั้งหมด:</TableCell>
            <TableCell className="font-bold text-blue-800">{formatCurrency(breakdown.baseCost + breakdown.profit)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <div className="text-sm text-gray-600 space-y-1">
        <p>• เผื่อเสีย {breakdown.wastage} แผ่น</p>
        <p>• ค่าเพลทต่อสี {formatCurrency(breakdown.basePlateCost)}</p>
        <p>• ค่ากระดาษต่อแผ่น {formatCurrency(breakdown.sheetCost)}</p>
      </div>
    </div>
  );
};

export default BreakdownDetails;
