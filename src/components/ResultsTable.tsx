
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, InfoCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ResultsTableProps {
  quantities: string[];
  results: any[];
  onSelectQuantity?: (index: number) => void;
  selectedQuantityIndex?: number;
  onViewLayoutDetails?: () => void; // Added this prop for the layout details button
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  quantities, 
  results, 
  onSelectQuantity,
  selectedQuantityIndex = 0,
  onViewLayoutDetails // Add this prop
}) => {
  if (!results.length) {
    return null;
  }

  const renderCalculationBreakdown = (result: any) => {
    return (
      <div className="space-y-2 text-sm p-1">
        <h3 className="font-medium mb-2">รายละเอียดการคำนวณ</h3>
        
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">แผ่นพิมพ์:</span>
            <span>{result.sheets} แผ่น</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ราคากระดาษต่อแผ่น:</span>
            <span>{formatCurrency(result.sheetCost || 0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ค่ากระดาษทั้งหมด:</span>
            <span>{formatCurrency(result.paperCost || 0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ค่าเพลท:</span>
            <span>{formatCurrency(result.plateCost || 0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ค่าหมึก:</span>
            <span>{formatCurrency(result.inkCost || 0)}</span>
          </div>
          {result.hasCoating && (
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">ค่าเคลือบ:</span>
              <span>{formatCurrency(result.coatingCost || 0)}</span>
            </div>
          )}
          {result.hasDieCut && (
            <div className="grid grid-cols-2 gap-1">
              <span className="text-gray-600">ค่าไดคัท:</span>
              <span>{formatCurrency(result.dieCutCost || 0)}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ค่าขนส่ง:</span>
            <span>{formatCurrency(result.shippingCost || 0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">ค่าแพ็คกิ้ง:</span>
            <span>{formatCurrency(result.packagingCost || 0)}</span>
          </div>
          <div className="border-t pt-1 grid grid-cols-2 gap-1">
            <span className="text-gray-600 font-medium">ต้นทุนรวม:</span>
            <span>{formatCurrency(result.baseCost || 0)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-600">กำไร:</span>
            <span>{formatCurrency(result.profit || 0)}</span>
          </div>
          <div className="border-t pt-1 grid grid-cols-2 gap-1">
            <span className="text-gray-600 font-medium">ราคารวม:</span>
            <span className="font-bold">{formatCurrency(result.totalCost || 0)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">ผลลัพธ์การคำนวณ</CardTitle>
          {onViewLayoutDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewLayoutDetails}
            >
              <Eye className="h-4 w-4 mr-2" /> ดูรายละเอียดการจัดวางงาน
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>จำนวน</TableHead>
              <TableHead>ราคาต่อชิ้น</TableHead>
              <TableHead>ราคารวม</TableHead>
              <TableHead>แผ่นพิมพ์</TableHead>
              <TableHead className="w-[50px]">รายละเอียด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow 
                key={index} 
                className={onSelectQuantity ? "cursor-pointer hover:bg-gray-100" : ""}
                data-state={selectedQuantityIndex === index ? "selected" : undefined}
                onClick={onSelectQuantity ? () => onSelectQuantity(index) : undefined}
              >
                <TableCell className={selectedQuantityIndex === index ? "font-bold" : ""}>
                  {parseInt(quantities[index]).toLocaleString()} ชิ้น
                </TableCell>
                <TableCell>{formatCurrency(result.unitCost)}</TableCell>
                <TableCell>{formatCurrency(result.totalCost)}</TableCell>
                <TableCell>{result.sheets} แผ่น</TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <InfoCircle className="h-4 w-4 text-blue-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            {renderCalculationBreakdown(result)}
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ดูรายละเอียดการคำนวณ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {onSelectQuantity && (
          <div className="mt-3 text-sm text-gray-500">
            คลิกที่แถวเพื่อดูรายละเอียดต้นทุน
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
