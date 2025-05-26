
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobBasicInfoProps {
  jobName: string;
  customerName: string;
  quoteBy: string;
  onJobNameChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onQuoteByChange: (value: string) => void;
}

const JobBasicInfo: React.FC<JobBasicInfoProps> = ({
  jobName,
  customerName,
  quoteBy,
  onJobNameChange,
  onCustomerNameChange,
  onQuoteByChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ข้อมูลหลักของงาน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="job-name" className="text-sm font-medium">
              ชื่องาน <span className="text-red-500">*</span>
            </Label>
            <Input
              id="job-name"
              type="text"
              value={jobName}
              onChange={(e) => onJobNameChange(e.target.value)}
              placeholder="กรอกชื่องาน"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-name" className="text-sm font-medium">
              ชื่อลูกค้า <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="กรอกชื่อลูกค้า"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="quote-by" className="text-sm font-medium">
              ผู้ทำใบราคา <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quote-by"
              type="text"
              value={quoteBy}
              onChange={(e) => onQuoteByChange(e.target.value)}
              placeholder="กรอกชื่อผู้ทำใบราคา"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobBasicInfo;
