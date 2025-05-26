
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Calculate paper usage details with pack-based rounding
 * @param quantity - Job quantity
 * @param printPerSheet - Prints per sheet
 * @param wastage - Wastage sheets
 * @param cutsPerSheet - Number of cuts from master sheet
 * @param sheetsPerReam - Number of sheets per ream (default: 500)
 * @param sheetsPerPack - Number of sheets per pack (default: 100)
 */
export function calculatePaperUsage(
  quantity: number,
  printPerSheet: number,
  wastage: number,
  cutsPerSheet: number = 1, 
  sheetsPerReam: number = 500,
  sheetsPerPack: number = 100
) {
  // Calculate sheets needed based on quantity and prints per sheet
  const sheetsNeeded = Math.ceil(quantity / printPerSheet);
  
  // Add wastage
  const totalSheets = sheetsNeeded + wastage;
  
  // Calculate master sheets needed based on cuts per sheet
  const masterSheetsNeeded = Math.ceil(totalSheets / cutsPerSheet);
  
  // New logic for pack-based calculation
  const fullReams = Math.floor(masterSheetsNeeded / sheetsPerReam);
  const remainingSheets = masterSheetsNeeded % sheetsPerReam;
  
  // Calculate packs needed for remaining sheets
  const packsNeeded = remainingSheets > 0 ? Math.ceil(remainingSheets / sheetsPerPack) : 0;
  
  // Calculate total sheets including pack rounding
  const totalSheetsWithPacks = fullReams * sheetsPerReam + packsNeeded * sheetsPerPack;
  
  // Calculate final reams needed (for cost calculation)
  const reamsNeeded = totalSheetsWithPacks / sheetsPerReam;
  
  return {
    sheetsNeeded,
    totalSheets,
    masterSheetsNeeded,
    fullReams,
    remainingSheets,
    packsNeeded,
    totalSheetsWithPacks,
    reamsNeeded: parseFloat(reamsNeeded.toFixed(3)),
    cutsPerSheet,
    sheetsPerPack
  };
}

/**
 * Calculate paper cost using pack-based logic
 * @param reams - Number of reams needed (after pack calculation)
 * @param paperWidth - Paper width in inches
 * @param paperHeight - Paper height in inches
 * @param grammage - Paper weight in GSM
 * @param pricePerKg - Price per kilogram
 * @param conversionFactor - Conversion factor (default: 3100)
 * @param sheetsPerPack - Number of sheets per pack for detailed breakdown
 * @param fullReams - Number of full reams
 * @param packsNeeded - Number of packs needed
 * @returns - Total paper cost with breakdown
 */
export function calculatePaperCost(
  reams: number,
  paperWidth: number,
  paperHeight: number,
  grammage: number,
  pricePerKg: number,
  conversionFactor: number = 3100,
  sheetsPerPack: number = 100,
  fullReams: number = 0,
  packsNeeded: number = 0
) {
  console.log("Paper cost calculation inputs:", {
    reams, 
    paperWidth, 
    paperHeight, 
    grammage, 
    pricePerKg,
    conversionFactor,
    sheetsPerPack,
    fullReams,
    packsNeeded
  });
  
  // Use the standard formula but with pack-adjusted reams
  const paperCost = reams * paperWidth * paperHeight * grammage / conversionFactor * pricePerKg;
  
  return {
    totalCost: paperCost,
    fullReams,
    packsNeeded,
    breakdown: {
      fullReamsCost: fullReams > 0 ? (fullReams * paperWidth * paperHeight * grammage / conversionFactor * pricePerKg) : 0,
      packsCost: packsNeeded > 0 ? (packsNeeded * sheetsPerPack * paperWidth * paperHeight * grammage / conversionFactor * pricePerKg / 500) : 0
    }
  };
}
