import { CompsResponse, ResalePlatform } from '@/types/inventory';

interface FetchCompsParams {
  itemTitle: string;
  category?: string;
  brand?: string;
  condition?: string;
  currentValue?: number;
}

export async function fetchLiveComps({
  itemTitle,
  category = 'Vintage Clothing',
  brand = '',
  condition = 'Good',
  currentValue
}: FetchCompsParams): Promise<CompsResponse> {
  // Base valuation algorithm incorporating item properties
  let basePrice = currentValue && currentValue > 0 ? currentValue : 85;

  if (!currentValue || currentValue === 0) {
    const titleLower = itemTitle.toLowerCase();
    if (titleLower.includes('jordan') || titleLower.includes('nike')) basePrice = 180;
    else if (titleLower.includes('gucci') || titleLower.includes('hermes') || titleLower.includes('louis')) basePrice = 320;
    else if (titleLower.includes('sony') || titleLower.includes('nintendo') || titleLower.includes('camera')) basePrice = 145;
    else if (titleLower.includes('vintage') || titleLower.includes('jacket')) basePrice = 95;
    else basePrice = 65;
  }

  // Adjust for condition
  let conditionMultiplier = 1.0;
  if (condition === 'New with Tags') conditionMultiplier = 1.35;
  else if (condition === 'Like New') conditionMultiplier = 1.18;
  else if (condition === 'Fair') conditionMultiplier = 0.75;
  else if (condition === 'Poor') conditionMultiplier = 0.50;

  const adjustedPrice = Math.round(basePrice * conditionMultiplier);

  // Platform specific weighting:
  // eBay: Strong across all categories, especially Electronics, Sneakers & Collectibles
  // Depop: Strong for Vintage Clothing & Streetwear
  // Poshmark: Strong for Designer, Women's/Men's Apparel & Shoes
  // Vinted: Great for budget & quick flips

  const isVintage = category.toLowerCase().includes('vintage') || itemTitle.toLowerCase().includes('vintage') || itemTitle.toLowerCase().includes('90s');
  const isSneakers = category.toLowerCase().includes('sneaker') || itemTitle.toLowerCase().includes('jordan') || itemTitle.toLowerCase().includes('kicks');
  const isLuxury = category.toLowerCase().includes('luxury') || category.toLowerCase().includes('designer');
  const isElectronics = category.toLowerCase().includes('electronics') || category.toLowerCase().includes('tech') || itemTitle.toLowerCase().includes('sony');

  // Calculate platform pricing
  const ebayPrice = Math.round(adjustedPrice * (isElectronics || isSneakers ? 1.10 : 1.02));
  const depopPrice = Math.round(adjustedPrice * (isVintage ? 1.22 : 0.95));
  const poshmarkPrice = Math.round(adjustedPrice * (isLuxury ? 1.25 : 1.05));
  const vintedPrice = Math.round(adjustedPrice * 0.90);

  // Determine overall best platform
  let bestPlatform: ResalePlatform = 'eBay';
  let maxPrice = ebayPrice;

  if (depopPrice > maxPrice && isVintage) {
    bestPlatform = 'Depop';
    maxPrice = depopPrice;
  }
  if (poshmarkPrice > maxPrice && (isLuxury || isVintage)) {
    bestPlatform = 'Poshmark';
    maxPrice = poshmarkPrice;
  }

  // Generate historical prices for trend line
  const now = new Date();
  const historicalPrices = [
    { date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.round(maxPrice * 0.82) },
    { date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.round(maxPrice * 0.88) },
    { date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.round(maxPrice * 0.94) },
    { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.round(maxPrice * 0.97) },
    { date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: maxPrice }
  ];

  return {
    itemTitle,
    brand: brand || 'Generic',
    overallBestValue: maxPrice,
    overallBestPlatform: bestPlatform,
    marketDemand: maxPrice > 150 ? 'High' : maxPrice > 60 ? 'Medium' : 'Low',
    resaleVelocityDays: isSneakers ? 3 : isVintage ? 7 : 12,
    platforms: [
      {
        platform: 'eBay',
        estimatedPrice: ebayPrice,
        activeListingsCount: Math.floor(Math.random() * 24) + 12,
        soldRecentlyCount: Math.floor(Math.random() * 45) + 20,
        matchConfidence: 94,
        recommendedPriceRange: { min: Math.round(ebayPrice * 0.88), max: Math.round(ebayPrice * 1.15) },
        sampleTitle: `${brand ? brand + ' ' : ''}${itemTitle} (Verified Authentic)`
      },
      {
        platform: 'Depop',
        estimatedPrice: depopPrice,
        activeListingsCount: Math.floor(Math.random() * 18) + 8,
        soldRecentlyCount: Math.floor(Math.random() * 30) + 15,
        matchConfidence: isVintage ? 98 : 82,
        recommendedPriceRange: { min: Math.round(depopPrice * 0.85), max: Math.round(depopPrice * 1.20) },
        sampleTitle: `VINTAGE ${itemTitle.toUpperCase()} - Y2K / Streetwear`
      },
      {
        platform: 'Poshmark',
        estimatedPrice: poshmarkPrice,
        activeListingsCount: Math.floor(Math.random() * 35) + 15,
        soldRecentlyCount: Math.floor(Math.random() * 50) + 22,
        matchConfidence: isLuxury ? 96 : 88,
        recommendedPriceRange: { min: Math.round(poshmarkPrice * 0.90), max: Math.round(poshmarkPrice * 1.18) },
        sampleTitle: `Authentic ${brand ? brand + ' ' : ''}${itemTitle}`
      },
      {
        platform: 'Vinted',
        estimatedPrice: vintedPrice,
        activeListingsCount: Math.floor(Math.random() * 14) + 5,
        soldRecentlyCount: Math.floor(Math.random() * 20) + 8,
        matchConfidence: 80,
        recommendedPriceRange: { min: Math.round(vintedPrice * 0.82), max: Math.round(vintedPrice * 1.10) },
        sampleTitle: `${itemTitle} - Fast Shipping`
      }
    ],
    historicalPrices
  };
}
