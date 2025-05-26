
import React from "react";
import ValidationError from "./ValidationError";
import BasicJobInfo from "./BasicJobInfo";
import PaperSizeSelection from "./PaperSizeSelection";
import PlateTypeSelection from "./PlateTypeSelection";
import PrintsPerSheetAdjustment from "./PrintsPerSheetAdjustment";
import CoatingOptions from "../CoatingOptions";
import SpotUvOptions from "../SpotUvOptions";
import OptionalCostInputs from "./OptionalCostInputs";
import AdditionalCostsManager, { AdditionalCost } from "./AdditionalCostsManager";
import QuantityInputs from "./QuantityInputs";
import CalculationSettings from "./CalculationSettings";
import CalculationActions from "./CalculationActions";

interface CalculatorFormSectionProps {
  calc: any;
  paperSizes: any;
  isLoadingPaperSizes: boolean;
  paperSizesError: any;
  manualPrintCount: string;
  onPrintCountChange: (value: string) => void;
  onIncrementPrintCount: () => void;
  onDecrementPrintCount: () => void;
  onPaperSizeChange: (sizeId: string) => void;
  additionalCosts: AdditionalCost[];
  onAdditionalCostsChange: (costs: AdditionalCost[]) => void;
  hasResults: boolean;
  onCalculate: () => void;
  onGoToSummary: () => void;
}

const CalculatorFormSection: React.FC<CalculatorFormSectionProps> = ({
  calc,
  paperSizes,
  isLoadingPaperSizes,
  paperSizesError,
  manualPrintCount,
  onPrintCountChange,
  onIncrementPrintCount,
  onDecrementPrintCount,
  onPaperSizeChange,
  additionalCosts,
  onAdditionalCostsChange,
  hasResults,
  onCalculate,
  onGoToSummary
}) => {
  return (
    <div className="space-y-4">
      <ValidationError error={calc.validationError} />

      <BasicJobInfo
        jobType={calc.jobType}
        onJobTypeChange={calc.setJobType}
        paperType={calc.paperType}
        onPaperTypeChange={calc.setPaperType}
        paperGrammage={calc.paperGrammage}
        onPaperGrammageChange={calc.setPaperGrammage}
        supplier={calc.supplier}
        onSupplierChange={calc.setSupplier}
        width={calc.width}
        height={calc.height}
        onWidthChange={calc.setWidth}
        onHeightChange={calc.setHeight}
        onUnitChange={calc.setSizeUnit}
        colors={calc.colors}
        onColorsChange={calc.setColors}
        baseColors={calc.baseColors}
        onBaseColorsChange={calc.setBaseColors}
      />

      <PaperSizeSelection
        paperType={calc.paperType}
        paperSizes={paperSizes}
        isLoadingPaperSizes={isLoadingPaperSizes}
        paperSizesError={paperSizesError}
        selectedPaperSize={calc.selectedPaperSize}
        onPaperSizeChange={onPaperSizeChange}
      />

      <PlateTypeSelection
        plateType={calc.plateType}
        onPlateTypeChange={calc.setPlateType}
      />

      <PrintsPerSheetAdjustment
        selectedPaperSize={calc.selectedPaperSize}
        width={calc.width}
        height={calc.height}
        manualPrintCount={manualPrintCount}
        onPrintCountChange={onPrintCountChange}
        onIncrementPrintCount={onIncrementPrintCount}
        onDecrementPrintCount={onDecrementPrintCount}
      />

      <CoatingOptions
        selectedCoating={calc.selectedCoating}
        selectedCoatingSize={calc.selectedCoatingSize}
        onCoatingChange={calc.setSelectedCoating}
        onCoatingSizeChange={calc.setSelectedCoatingSize}
      />

      <SpotUvOptions
        hasSpotUv={calc.hasSpotUv}
        selectedSpotUvSize={calc.selectedSpotUvSize}
        onSpotUvChange={calc.setHasSpotUv}
        onSpotUvSizeChange={calc.setSelectedSpotUvSize}
      />

      <OptionalCostInputs
        hasDieCut={calc.hasDieCut}
        onDieCutChange={calc.setHasDieCut}
        dieCutCost={calc.dieCutCost}
        onDieCutCostChange={calc.setDieCutCost}
        hasBasePrint={calc.hasBasePrint}
        onBasePrintChange={calc.setHasBasePrint}
        basePrintCost={calc.basePrintCost}
        onBasePrintCostChange={calc.setBasePrintCost}
        shippingCost={calc.shippingCost}
        onShippingCostChange={calc.setShippingCost}
        packagingCost={calc.packagingCost}
        onPackagingCostChange={calc.setPackagingCost}
      />

      <AdditionalCostsManager
        additionalCosts={additionalCosts}
        onCostsChange={onAdditionalCostsChange}
      />

      <div className="space-y-2">
        <label className="block font-medium mb-1">ปริมาณที่ต้องการคำนวณ</label>
        <QuantityInputs
          quantities={calc.quantities}
          onAddQuantity={calc.addQuantity}
          onRemoveQuantity={calc.removeQuantity}
          onUpdateQuantity={calc.updateQuantity}
        />
      </div>

      <CalculationSettings
        wastage={calc.wastage}
        onWastageChange={calc.setWastage}
        profitMargin={calc.profitMargin}
        onProfitMarginChange={calc.setProfitMargin}
      />

      <CalculationActions
        paperType={calc.paperType}
        selectedPaperSize={calc.selectedPaperSize}
        width={calc.width}
        height={calc.height}
        hasResults={hasResults}
        onCalculate={onCalculate}
        onGoToSummary={onGoToSummary}
      />
    </div>
  );
};

export default CalculatorFormSection;
