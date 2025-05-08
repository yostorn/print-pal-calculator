
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ResultsTableProps {
  quantities: string[];
  results: any[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

const ResultsTable: React.FC<ResultsTableProps> = ({ quantities, results }) => {
  if (!results.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">ผลลัพธ์การคำนวณ</CardTitle>
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
              <TableRow key={index}>
                <TableCell>{parseInt(quantities[index]).toLocaleString()} ชิ้น</TableCell>
                <TableCell>{formatCurrency(result.unitCost)}</TableCell>
                <TableCell>{formatCurrency(result.totalCost)}</TableCell>
                <TableCell>{result.sheets} แผ่น</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
