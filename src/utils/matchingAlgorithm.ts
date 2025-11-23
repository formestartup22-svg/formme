interface DesignerCriteria {
  quantity: number;
  leadTime: string; // "1-3", "4-6", "7-10", "10+"
  location: string;
  priceRange: string;
  categories: string[];
}

interface ManufacturerProfile {
  moq: number;
  maxCapacity?: number;
  leadTime: number; // in days
  location: string;
  priceTier: string;
  rating?: number;
  categories: string[];
}

export function calculateMatchScore(
  designer: DesignerCriteria,
  manufacturer: ManufacturerProfile
): number {
  // 1. Category Score (HIGHEST PRIORITY - 40%)
  let categoryScore = 0;
  if (designer.categories && designer.categories.length > 0 && 
      manufacturer.categories && manufacturer.categories.length > 0) {
    const matchingCategories = designer.categories.filter(dc => 
      manufacturer.categories.some(mc => 
        mc.toLowerCase() === dc.toLowerCase()
      )
    );
    categoryScore = (matchingCategories.length / designer.categories.length) * 100;
  }

  // 2. Quantity Score (MOQ) - 20%
  let quantityScore = 0;
  if (designer.quantity < manufacturer.moq) {
    quantityScore = (designer.quantity / manufacturer.moq) * 100;
  } else if (manufacturer.maxCapacity && designer.quantity > manufacturer.maxCapacity) {
    quantityScore = (manufacturer.maxCapacity / designer.quantity) * 100;
  } else {
    quantityScore = 100;
  }

  // 3. Location Score - 20%
  let locationScore = 40; // default
  if (manufacturer.location?.toLowerCase() === designer.location?.toLowerCase()) {
    locationScore = 100;
  }

  // 4. Price Score - 10%
  let priceScore = 50;
  if (manufacturer.priceTier === designer.priceRange) {
    priceScore = 100;
  }

  // 5. Lead Time Score - 5%
  const leadRanges: Record<string, [number, number]> = {
    "1-3": [7, 21],
    "4-6": [28, 42],
    "7-10": [49, 70],
    "10+": [70, 365]
  };
  
  const [minDays, maxDays] = leadRanges[designer.leadTime] || [0, 365];
  let leadTimeScore = 0;
  
  if (manufacturer.leadTime >= minDays && manufacturer.leadTime <= maxDays) {
    leadTimeScore = 100;
  } else if (manufacturer.leadTime > maxDays) {
    leadTimeScore = (maxDays / manufacturer.leadTime) * 100;
  }

  // 6. Reliability Score - 5%
  const reliabilityScore = manufacturer.rating
    ? (manufacturer.rating / 5) * 100
    : 50;

  // Final Weighted Score
  const finalScore =
    0.40 * categoryScore +
    0.20 * quantityScore +
    0.20 * locationScore +
    0.10 * priceScore +
    0.05 * leadTimeScore +
    0.05 * reliabilityScore;

  return Math.round(finalScore);
}
