
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface QuoteSummaryFormProps {
  onGeneratePDF: (data: {
    customerName: string;
    jobName: string;
    date: Date;
  }) => void;
}

const QuoteSummaryForm: React.FC<QuoteSummaryFormProps> = ({ onGeneratePDF }) => {
  const [customerName, setCustomerName] = useState("");
  const [jobName, setJobName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleGeneratePDF = () => {
    if (!customerName.trim() || !jobName.trim()) {
      alert("กรุณากรอกชื่อลูกค้าและชื่องาน");
      return;
    }

    onGeneratePDF({
      customerName: customerName.trim(),
      jobName: jobName.trim(),
      date: selectedDate
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          สร้างใบเสนอราคา
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customerName">ชื่อลูกค้า</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="ระบุชื่อลูกค้า"
          />
        </div>

        <div>
          <Label htmlFor="jobName">ชื่องาน</Label>
          <Input
            id="jobName"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="ระบุชื่องาน"
          />
        </div>

        <div>
          <Label>วันที่</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: th }) : "เลือกวันที่"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date || new Date());
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleGeneratePDF} className="w-full">
          สร้าง PDF
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuoteSummaryForm;
