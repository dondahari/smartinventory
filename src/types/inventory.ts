export type ItemCondition = 'New with Tags' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export type ResalePlatform = 'eBay' | 'Depop' | 'Poshmark' | 'Vinted';

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  user_id?: string;
  category_id?: string;
  category_name?: string;
  title: string;
  description?: string;
  brand?: string;
  condition?: ItemCondition;
  storage_location: string; // e.g. "Bin A", "Box 2", "Shelf 4"
  image_url: string;
  purchase_price: number;
  estimated_value: number;
  best_platform: ResalePlatform;
  created_at: string;
  updated_at: string;
  price_history?: PriceHistory[];
}

export interface PriceHistory {
  id: string;
  item_id: string;
  recorded_at: string;
  estimated_value: number;
  best_platform: ResalePlatform;
  highest_price?: number;
}

export interface CompPlatformDetails {
  platform: ResalePlatform;
  estimatedPrice: number;
  activeListingsCount: number;
  soldRecentlyCount: number;
  matchConfidence: number; // 0 to 100
  recommendedPriceRange: { min: number; max: number };
  sampleTitle: string;
}

export interface PriceChartingTiers {
  loosePrice: number;
  cibPrice: number;
  newPrice: number;
  gradedPrice: number;
}

export interface CompsResponse {
  itemId?: string;
  itemTitle: string;
  brand?: string;
  productImageUrl?: string;
  overallBestValue: number;
  overallBestPlatform: ResalePlatform;
  platforms: CompPlatformDetails[];
  historicalPrices: { date: string; value: number }[];
  priceChartingTiers: PriceChartingTiers;
  marketDemand: 'High' | 'Medium' | 'Low';
  resaleVelocityDays: number;
}

export interface AutoTagResult {
  title: string;
  brand: string;
  category: string;
  condition: ItemCondition;
  estimatedValue: number;
  purchasePriceEstimate?: number;
  suggestedStorageLocation: string;
  suggestedPlatform: ResalePlatform;
  searchKeywords: string[];
  description: string;
  tags: string[];
}
