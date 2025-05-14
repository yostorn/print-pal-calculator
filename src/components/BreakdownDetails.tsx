
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownDetailsProps {
  selectedQuantityIndex: number;
  breakdowns: Array<{
    plateType: string;
    plateCost: number;
    paperCost: number;
    inkCost: number;
    basePlateCost: number;
    totalSheets: number;
    masterSheetsNeeded?: number;
    reamsNeeded?: number;
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
    cutsPerSheet?: number;
    paperUsage?: {
      sheetsNeeded: number;
      totalSheets: number;
      masterSheetsNeeded: number;
      reamsNeeded: number;
    };
    paperSize?: {
      width: number;
      height: number;
    };
    grammage?: number;
    pricePerKg?: number;
    formulaExplanations?: {
      paperWeightFormula?: {
        formula: string;
        explanation: string;
      };
      paperCostFormula: {
        formula: string;
        explanation: string;
      };
      plateTypeFormula: {
        formula: string;
        explanation: string;
      };
      cutsPerSheetFormula?: {
        formula: string;
        explanation: string;
      };
    };
    conversionFactor?: number;
  }>;
}

const BreakdownDetails: React.FC<BreakdownDetailsProps> = ({ selectedQuantityIndex, breakdowns }) => {
  // Check if we have valid data and index
  if (!breakdowns || breakdowns.length === 0 || !breakdowns[selectedQuantityIndex]) {
    return null;
  }

  // Get the selected breakdown using the index
  const breakdown = breakdowns[selectedQuantityIndex];

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">รายละเอียดการคำนวณ</h3>
      
      {/* Paper Usage Details Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-blue-800">รายละเอียดการใช้กระดาษ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-blue-700">พิมพ์ได้:</p>
                <p className="font-medium">{breakdown.paperUsage?.sheetsNeeded || breakdown.totalSheets - breakdown.wastage} แผ่น</p>
                <p className="text-xs text-blue-600">(ไม่รวมเผื่อเสีย)</p>
              </div>
              <div>
                <p className="text-blue-700">เผื่อเสีย:</p>
                <p className="font-medium">{breakdown.wastage} แผ่น</p>
              </div>
            </div>
            
            <div className="pt-1 border-t border-blue-200">
              <p className="text-blue-700">จำนวนกระดาษที่ใช้ทั้งหมด:</p>
              <p className="font-medium">{breakdown.totalSheets} แผ่น</p>
              <p className="text-xs text-blue-600">(รวมเผื่อเสีย)</p>
            </div>
            
            <div className="pt-1 border-t border-blue-200">
              <p className="text-blue-700">การตัดกระดาษ:</p>
              <p className="font-medium">ตัด {breakdown.cutsPerSheet || 1} จากกระดาษแผ่นใหญ่</p>
              <p className="text-xs text-blue-600">(จำนวนตัดจากกระดาษแผ่นใหญ่)</p>
            </div>
            
            <div className="pt-1 border-t border-blue-200">
              <p className="text-blue-700">จำนวนแผ่นกระดาษใหญ่ที่ต้องใช้:</p>
              <p className="font-medium">{breakdown.masterSheetsNeeded || Math.ceil(breakdown.totalSheets / (breakdown.cutsPerSheet || 1))} แผ่น</p>
            </div>
            
            <div className="pt-1 border-t border-blue-200">
              <p className="text-blue-700">จำนวนรีมที่ต้องใช้:</p>
              <p className="font-medium">{breakdown.reamsNeeded?.toFixed(3) || (breakdown.masterSheetsNeeded / 500).toFixed(3)} รีม</p>
              <p className="text-xs text-blue-600">(1 รีม = 500 แผ่น)</p>
            </div>
            
            <div className="pt-2 border-t border-blue-200">
              <p className="text-blue-700">ราคากระดาษต่อแผ่น:</p>
              <p className="font-medium">{formatCurrency(breakdown.sheetCost)}</p>
            </div>
            
            <div className="pt-1 border-t border-blue-200 font-medium">
              <p className="text-blue-800">ค่ากระดาษรวม:</p>
              <p className="text-lg">{formatCurrency(breakdown.paperCost)}</p>
              {breakdown.formulaExplanations && (
                <p className="text-xs text-blue-600 mt-1 whitespace-normal break-words">
                  สูตร: {breakdown.formulaExplanations.paperCostFormula.explanation}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main cost breakdown table */}
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
            <TableCell className="font-medium">ค่ากระดาษทั้งหมด:</TableCell>
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
          
          {/* Base print cost row if applicable */}
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
        <p>• จำนวนตัดกระดาษ: ตัด {breakdown.cutsPerSheet || 1} จากกระดาษแผ่นใหญ่</p>
        {breakdown.grammage && (
          <p>• แกรมกระดาษ: {breakdown.grammage} gsm</p>
        )}
        {breakdown.formulaExplanations && (
          <p className="border-t border-gray-200 pt-2 mt-2 whitespace-normal break-words">
            • สูตรคำนวณกระดาษ: {breakdown.formulaExplanations.paperCostFormula.explanation}
          </p>
        )}
        {breakdown.formulaExplanations?.cutsPerSheetFormula && (
          <p className="whitespace-normal break-words">
            • {breakdown.formulaExplanations.cutsPerSheetFormula.explanation}
          </p>
        )}
        {breakdown.conversionFactor && (
          <p>• ค่า conversion factor: {breakdown.conversionFactor}</p>
        )}
      </div>
    </div>
  );
};

export default BreakdownDetails;
