
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface ResultsTableProps {
  quantities: string[];
  results: {
    totalCost: number;
    unitCost: number;
    printPerSheet: number;
    sheets: number;
    paperSize: string;
  }[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ quantities, results }) => {
  if (quantities.length === 0 || results.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <Table>
          <TableCaption>ตารางเปรียบเทียบราคาตามปริมาณ</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>จำนวน</TableHead>
              <TableHead>ราคารวม (บาท)</TableHead>
              <TableHead>ราคาต่อชิ้น (บาท)</TableHead>
              <TableHead>ดวงต่อแผ่น</TableHead>
              <TableHead>จำนวนแผ่น</TableHead>
              <TableHead>ขนาดกระดาษ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{quantities[index]}</TableCell>
                <TableCell>{result.totalCost.toLocaleString("th-TH", { maximumFractionDigits: 2 })}</TableCell>
                <TableCell>{result.unitCost.toLocaleString("th-TH", { maximumFractionDigits: 2 })}</TableCell>
                <TableCell>{result.printPerSheet}</TableCell>
                <TableCell>{result.sheets}</TableCell>
                <TableCell>{result.paperSize}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
