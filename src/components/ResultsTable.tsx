
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow 
                key={index} 
                className={onSelectQuantity ? "cursor-pointer hover:bg-gray-100" : ""}
                data-state={selectedQuantityIndex === index ? "selected" : undefined}
                onClick={() => onSelectQuantity && onSelectQuantity(index)}
              >
                <TableCell className={selectedQuantityIndex === index ? "font-bold" : ""}>
                  {parseInt(quantities[index]).toLocaleString()} ชิ้น
                </TableCell>
                <TableCell>{formatCurrency(result.unitCost)}</TableCell>
                <TableCell>{formatCurrency(result.totalCost)}</TableCell>
                <TableCell>{result.sheets} แผ่น</TableCell>
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
