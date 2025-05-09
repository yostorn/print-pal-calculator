
/**
 * Utility functions for calculating optimal layout of printing jobs on paper sheets
 */

/**
 * Calculate the optimal layout for a print job on a sheet of paper
 * 
 * @param paperWidth - Width of paper in inches
 * @param paperHeight - Height of paper in inches
 * @param jobWidth - Width of job in cm
 * @param jobHeight - Height of job in cm
 * @returns Layout information including prints per sheet, layout array, and waste percentage
 */
export const calculateLayout = (
  paperWidth: number,
  paperHeight: number,
  jobWidth: number,
  jobHeight: number
) => {
  if (!jobWidth || !jobHeight || !paperWidth || !paperHeight) {
    return { printPerSheet: 0, layout: [], wastePercentage: 0 };
  }
  
  // Convert cm to inches
  const jobWidthInch = jobWidth / 2.54;
  const jobHeightInch = jobHeight / 2.54;
  
  // Try both orientations and use the one that fits more prints
  const portraitCols = Math.floor(paperWidth / jobWidthInch);
  const portraitRows = Math.floor(paperHeight / jobHeightInch);
  const portraitPerSheet = portraitCols * portraitRows;
  
  const landscapeCols = Math.floor(paperWidth / jobHeightInch);
  const landscapeRows = Math.floor(paperHeight / jobWidthInch);
  const landscapePerSheet = landscapeCols * landscapeRows;
  
  // Determine if rotation gives better results
  const shouldRotate = landscapePerSheet > portraitPerSheet;
  
  const layout = [];
  const cols = shouldRotate ? landscapeCols : portraitCols;
  const rows = shouldRotate ? landscapeRows : portraitRows;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      layout.push({
        x: x * (shouldRotate ? jobHeightInch : jobWidthInch),
        y: y * (shouldRotate ? jobWidthInch : jobHeightInch),
        rotated: shouldRotate
      });
    }
  }
  
  // Calculate waste percentage
  const usedArea = layout.length * (shouldRotate ? jobWidthInch * jobHeightInch : jobWidthInch * jobHeightInch);
  const totalArea = paperWidth * paperHeight;
  const wastePercentage = ((totalArea - usedArea) / totalArea) * 100;
  
  return {
    printPerSheet: cols * rows,
    layout,
    wastePercentage: parseFloat(wastePercentage.toFixed(2)),
    shouldRotate,
    cols,
    rows
  };
};

/**
 * Get a user-friendly description of the layout
 */
export const getLayoutDescription = (
  jobWidth: number,
  jobHeight: number,
  paperWidth: number,
  paperHeight: number,
  printPerSheet: number,
  rotation: boolean
) => {
  if (!jobWidth || !jobHeight) return "กรุณาระบุขนาดงาน";
  if (!paperWidth || !paperHeight) return "กรุณาเลือกประเภทกระดาษ";
  if (printPerSheet === 0) return "ไม่สามารถจัดวางงานได้ (ขนาดใหญ่เกินไป)";
  
  const jobWidthInch = jobWidth / 2.54;
  const jobHeightInch = jobHeight / 2.54;
  
  const effectiveJobWidth = rotation ? jobHeightInch : jobWidthInch;
  const effectiveJobHeight = rotation ? jobWidthInch : jobHeightInch;
  
  const cols = Math.floor(paperWidth / effectiveJobWidth);
  const rows = Math.floor(paperHeight / effectiveJobHeight);
  
  return `วางได้ ${cols} × ${rows} = ${printPerSheet} ชิ้น/แผ่น ${rotation ? '(หมุนงาน)' : ''}`;
};
