
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
 * Calculate paper usage details
 * @param quantity - Job quantity
 * @param printPerSheet - Prints per sheet
 * @param wastage - Wastage sheets
 * @param cutsPerSheet - Number of cuts from master sheet
 * @param sheetsPerReam - Number of sheets per ream (default: 500)
 */
export function calculatePaperUsage(
  quantity: number,
  printPerSheet: number,
  wastage: number,
  cutsPerSheet: number = 1, 
  sheetsPerReam: number = 500
) {
  // Calculate sheets needed based on quantity and prints per sheet
  const sheetsNeeded = Math.ceil(quantity / printPerSheet);
  
  // Add wastage
  const totalSheets = sheetsNeeded + wastage;
  
  // Calculate master sheets needed based on cuts per sheet
  const masterSheetsNeeded = Math.ceil(totalSheets / cutsPerSheet);
  
  // Calculate reams needed
  const reamsNeeded = masterSheetsNeeded / sheetsPerReam;
  
  return {
    sheetsNeeded,
    totalSheets,
    masterSheetsNeeded,
    reamsNeeded: parseFloat(reamsNeeded.toFixed(3)),
    cutsPerSheet
  };
}

/**
 * Calculate paper cost using the correct formula
 * @param reams - Number of reams needed
 * @param paperWidth - Paper width in inches
 * @param paperHeight - Paper height in inches
 * @param grammage - Paper weight in GSM
 * @param pricePerKg - Price per kilogram
 * @param conversionFactor - Conversion factor (default: 3100)
 * @returns - Total paper cost
 */
export function calculatePaperCost(
  reams: number,
  paperWidth: number,
  paperHeight: number,
  grammage: number,
  pricePerKg: number,
  conversionFactor: number = 3100
) {
  // Formula: (reams × width × height × GSM ÷ 3100 × price_per_kg)
  console.log("Paper cost calculation inputs:", {
    reams, 
    paperWidth, 
    paperHeight, 
    grammage, // Ensure this is the correct grammage value (like 80 for 80 GSM)
    pricePerKg,
    conversionFactor
  });
  
  const paperCost = reams * paperWidth * paperHeight * grammage / conversionFactor * pricePerKg;
  return paperCost;
}
