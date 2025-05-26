
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CalculationActionsProps {
  paperType: string;
  selectedPaperSize: { width: number; height: number } | null;
  width: string;
  height: string;
  hasResults: boolean;
  onCalculate: () => void;
  onGoToSummary: () => void;
}

const CalculationActions: React.FC<CalculationActionsProps> = ({
  paperType,
  selectedPaperSize,
  width,
  height,
  hasResults,
  onCalculate,
  onGoToSummary
}) => {
  return (
    <div className="space-y-2">
      <Button 
        className="w-full" 
        onClick={onCalculate}
        disabled={!paperType || !selectedPaperSize || !width || !height}
      >
        คำนวณ
      </Button>
      
      {hasResults && (
        <Button 
          className="w-full" 
          variant="default"
          onClick={onGoToSummary}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          ไปหน้าตารางสรุปต้นทุน
        </Button>
      )}
    </div>
  );
};

export default CalculationActions;
