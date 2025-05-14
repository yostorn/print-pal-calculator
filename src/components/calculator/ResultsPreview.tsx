
import React from "react";
import LayoutPreview from "../layout-preview/LayoutPreview";
import ResultsTable from "../ResultsTable";
import BreakdownDetails from "../BreakdownDetails";

interface ResultsPreviewProps {
  selectedPaperSize: { width: number; height: number } | null;
  showPreview: boolean;
  width: string;
  height: string;
  printPerSheet: number;
  onLayoutChange: (perSheet: number) => void;
  quantities: string[];
  results: any[];
  onSelectQuantity: (index: number) => void;
  selectedQuantityIndex: number;
  onViewLayoutDetails: () => void;
  breakdowns: any[];
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({
  selectedPaperSize,
  showPreview,
  width,
  height,
  printPerSheet,
  onLayoutChange,
  quantities,
  results,
  onSelectQuantity,
  selectedQuantityIndex,
  onViewLayoutDetails,
  breakdowns,
}) => {
  return (
    <div className="space-y-4">
      {/* Layout Preview - Always show when data is available */}
      {selectedPaperSize && showPreview && (
        <div>
          <LayoutPreview
            paperWidth={selectedPaperSize.width}
            paperHeight={selectedPaperSize.height}
            jobWidth={parseFloat(width || "0") || 0}
            jobHeight={parseFloat(height || "0") || 0}
            onLayoutChange={onLayoutChange}
          />
          {printPerSheet > 0 && (
            <div className="mt-2 text-center text-sm text-green-600 font-medium">
              เรียบร้อย! ชิ้นงานสามารถวางได้ {printPerSheet} ชิ้นต่อแผ่น
            </div>
          )}
        </div>
      )}

      <ResultsTable
        quantities={quantities}
        results={results}
        onSelectQuantity={onSelectQuantity}
        selectedQuantityIndex={selectedQuantityIndex}
        onViewLayoutDetails={onViewLayoutDetails}
        breakdowns={breakdowns}
      />

      {results.length > 0 && (
        <BreakdownDetails
          selectedQuantityIndex={selectedQuantityIndex}
          breakdowns={breakdowns}
        />
      )}
    </div>
  );
};

export default ResultsPreview;
