interface DesignerCriteria {
  quantity: number;
  leadTime: string; // "1-3", "4-6", "7-10", "10+"
  location: string;
  priceRange: string;
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
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

// Regional location mapping
const REGION_COUNTRIES: Record<string, string[]> = {
  asia: ['china', 'india', 'bangladesh', 'vietnam', 'pakistan', 'thailand', 'indonesia', 'cambodia', 'sri lanka', 'myanmar', 'philippines', 'japan', 'south korea', 'taiwan', 'malaysia', 'singapore'],
  europe: ['italy', 'spain', 'portugal', 'france', 'germany', 'uk', 'united kingdom', 'poland', 'romania', 'turkey', 'bulgaria', 'greece', 'netherlands', 'belgium'],
  canada: ['canada'],
  'north america': ['usa', 'united states', 'america', 'mexico', 'canada'],
  'central america': ['guatemala', 'honduras', 'el salvador', 'nicaragua', 'costa rica', 'panama'],
  'south america': ['colombia', 'peru', 'brazil', 'ecuador', 'argentina', 'chile'],
  africa: ['egypt', 'morocco', 'tunisia', 'ethiopia', 'kenya', 'mauritius', 'south africa'],
};

function isLocationMatch(designerLocation: string, manufacturerLocation: string): boolean {
  const designerLoc = designerLocation.toLowerCase().trim();
  const manufacturerLoc = manufacturerLocation.toLowerCase().trim();
  
  // If designer chose "any", always match
  if (designerLoc === 'any') return true;
  
  // Exact match
  if (manufacturerLoc === designerLoc) return true;
  
  // Check if designer location is a region and manufacturer is in that region
  const regionCountries = REGION_COUNTRIES[designerLoc];
  if (regionCountries) {
    return regionCountries.some(country => 
      manufacturerLoc.includes(country) || country.includes(manufacturerLoc)
    );
  }
  
  // Check if manufacturer location contains designer location
  if (manufacturerLoc.includes(designerLoc)) return true;
  
  return false;
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
  if (designer.quantity <= 0) {
    quantityScore = 50; // Default if no quantity specified
  } else if (designer.quantity < manufacturer.moq) {
    // Penalty for being below MOQ
    quantityScore = (designer.quantity / manufacturer.moq) * 100;
  } else if (manufacturer.maxCapacity && designer.quantity > manufacturer.maxCapacity) {
    // Penalty for exceeding capacity
    quantityScore = (manufacturer.maxCapacity / designer.quantity) * 100;
  } else {
    // Perfect match - within MOQ and capacity
    quantityScore = 100;
  }

  // 3. Location Score - 20%
  let locationScore = 40; // default for no match
  if (isLocationMatch(designer.location || 'any', manufacturer.location || '')) {
    locationScore = 100;
  }

  // 4. Price Score - 10%
  let priceScore = 50; // default
  
  // If designer specified min/max price, use that for scoring
  if (designer.minPrice !== undefined || designer.maxPrice !== undefined) {
    // Extract price from manufacturer's price_range (format: "$15-$30 per unit")
    const priceMatch = manufacturer.priceTier.match(/\$(\d+)-\$(\d+)/);
    if (priceMatch) {
      const manufacturerMin = parseInt(priceMatch[1]);
      const manufacturerMax = parseInt(priceMatch[2]);
      const userMin = designer.minPrice ?? 0;
      const userMax = designer.maxPrice ?? Infinity;
      
      // Perfect overlap - manufacturer range is within designer range
      if (manufacturerMin >= userMin && manufacturerMax <= userMax) {
        priceScore = 100;
      } 
      // Partial overlap - ranges overlap
      else if (manufacturerMin <= userMax && manufacturerMax >= userMin) {
        const overlapStart = Math.max(manufacturerMin, userMin);
        const overlapEnd = Math.min(manufacturerMax, userMax);
        const overlapSize = overlapEnd - overlapStart;
        const designerRangeSize = userMax - userMin || 1;
        priceScore = (overlapSize / designerRangeSize) * 100;
      }
      // No overlap
      else {
        priceScore = 30;
      }
    }
  } else if (manufacturer.priceTier === designer.priceRange) {
    // Fallback to tier matching if no specific prices
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
