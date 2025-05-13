
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
