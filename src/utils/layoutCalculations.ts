
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
  // Handle incomplete data gracefully
  if (!paperWidth || !paperHeight || !jobWidth || !jobHeight) {
    return { printPerSheet: 0, layout: [], wastePercentage: 0 };
  }
  
  // Convert cm to inches for job dimensions
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
  
  // Create layout grid
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
  const usedArea = layout.length * (jobWidthInch * jobHeightInch);
  const totalArea = paperWidth * paperHeight;
  const wastePercentage = ((totalArea - usedArea) / totalArea) * 100;
  
  // Log calculations for debugging the 50-piece issue
  console.log("Layout calculation:", {
    paperDimensions: { width: paperWidth, height: paperHeight },
    jobDimensions: { width: jobWidthInch, height: jobHeightInch },
    fits: { portrait: { cols: portraitCols, rows: portraitRows, total: portraitPerSheet },
            landscape: { cols: landscapeCols, rows: landscapeRows, total: landscapePerSheet }},
    selected: { cols, rows, total: cols * rows, rotated: shouldRotate },
    layoutItems: layout.length,
    waste: wastePercentage
  });
  
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

/**
 * Get suitable paper sizes for a job
 * @param paperSizes - Available paper sizes
 * @param jobWidth - Job width in cm
 * @param jobHeight - Job height in cm
 * @returns Sorted array of suitable paper sizes with efficiency metrics
 */
export const getSuitablePaperSizes = (
  paperSizes: { id: string; name: string; width: number; height: number }[],
  jobWidth: number,
  jobHeight: number
) => {
  if (!paperSizes || !jobWidth || !jobHeight) {
    return [];
  }

  // Convert job dimensions to inches
  const jobWidthInch = jobWidth / 2.54;
  const jobHeightInch = jobHeight / 2.54;

  const suitableSizes = paperSizes.map(size => {
    // Calculate layout for both orientations
    const portraitCols = Math.floor(size.width / jobWidthInch);
    const portraitRows = Math.floor(size.height / jobHeightInch);
    const portraitPerSheet = portraitCols * portraitRows;
    
    const landscapeCols = Math.floor(size.width / jobHeightInch);
    const landscapeRows = Math.floor(size.height / jobWidthInch);
    const landscapePerSheet = landscapeCols * landscapeRows;

    // Take the better orientation
    const rotated = landscapePerSheet > portraitPerSheet;
    const printPerSheet = Math.max(portraitPerSheet, landscapePerSheet);
    
    // Calculate waste percentage
    const usedArea = printPerSheet * (jobWidthInch * jobHeightInch);
    const totalArea = size.width * size.height;
    const wastePercentage = ((totalArea - usedArea) / totalArea) * 100;
    
    // Calculate efficiency score (higher is better)
    const efficiencyScore = printPerSheet * (100 - wastePercentage);

    return {
      ...size,
      printPerSheet,
      wastePercentage: parseFloat(wastePercentage.toFixed(2)),
      rotated,
      efficiencyScore
    };
  })
  // Filter out sizes that can't fit the job
  .filter(size => size.printPerSheet > 0)
  // Sort by efficiency score (most efficient first)
  .sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  return suitableSizes;
};
