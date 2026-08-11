import { createBrowserClient } from '@supabase/ssr';
import { InventoryItem, Category, ItemCondition, ResalePlatform } from '@/types/inventory';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase') &&
  !SUPABASE_URL.includes('placeholder')
);

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

// Initial demo seed inventory items
export const INITIAL_DEMO_ITEMS: InventoryItem[] = [
  {
    id: 'demo-item-1',
    user_id: 'demo-user-123',
    title: 'Vintage 90s Nike Swoosh Track Jacket',
    description: 'Authentic 1990s colorblock jacket, excellent vintage condition with embroidery logo.',
    brand: 'Nike',
    category_name: 'Vintage Clothing',
    condition: 'Good' as ItemCondition,
    storage_location: 'Bin A - Clothing',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    purchase_price: 15,
    estimated_value: 125,
    best_platform: 'Depop',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    price_history: [
      { id: 'ph-1', item_id: 'demo-item-1', recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 95, best_platform: 'eBay' },
      { id: 'ph-2', item_id: 'demo-item-1', recorded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 110, best_platform: 'Depop' },
      { id: 'ph-3', item_id: 'demo-item-1', recorded_at: new Date().toISOString(), estimated_value: 125, best_platform: 'Depop' }
    ]
  },
  {
    id: 'demo-item-2',
    user_id: 'demo-user-123',
    title: 'Air Jordan 1 High OG "Chicago Lost & Found"',
    description: 'Size 10.5 US. Deadstock with original box and extra laces.',
    brand: 'Jordan / Nike',
    category_name: 'Sneakers',
    condition: 'New with Tags' as ItemCondition,
    storage_location: 'Box 04 - Kicks',
    image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    purchase_price: 180,
    estimated_value: 410,
    best_platform: 'eBay',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    price_history: [
      { id: 'ph-4', item_id: 'demo-item-2', recorded_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 360, best_platform: 'eBay' },
      { id: 'ph-5', item_id: 'demo-item-2', recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 385, best_platform: 'eBay' },
      { id: 'ph-6', item_id: 'demo-item-2', recorded_at: new Date().toISOString(), estimated_value: 410, best_platform: 'eBay' }
    ]
  },
  {
    id: 'demo-item-3',
    user_id: 'demo-user-123',
    title: 'Sony Walkman TPS-L2 Vintage Personal Cassette Player',
    description: 'Original 1979 edition cassette player. Tested and functional with fresh belts installed.',
    brand: 'Sony',
    category_name: 'Electronics',
    condition: 'Good' as ItemCondition,
    storage_location: 'Shelf 2 - Tech',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    purchase_price: 45,
    estimated_value: 340,
    best_platform: 'eBay',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    price_history: [
      { id: 'ph-7', item_id: 'demo-item-3', recorded_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 290, best_platform: 'eBay' },
      { id: 'ph-8', item_id: 'demo-item-3', recorded_at: new Date().toISOString(), estimated_value: 340, best_platform: 'eBay' }
    ]
  },
  {
    id: 'demo-item-4',
    user_id: 'demo-user-123',
    title: 'Nintendo Game Boy Color Atomic Purple',
    description: 'Clean battery contacts, original shell and screen glass replaced. Tested working.',
    brand: 'Nintendo',
    category_name: 'Electronics',
    condition: 'Good' as ItemCondition,
    storage_location: 'Shelf 2 - Tech',
    image_url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bbe97?auto=format&fit=crop&w=800&q=80',
    purchase_price: 20,
    estimated_value: 95,
    best_platform: 'eBay' as ResalePlatform,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    price_history: [
      { id: 'ph-9', item_id: 'demo-item-4', recorded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 80, best_platform: 'eBay' },
      { id: 'ph-10', item_id: 'demo-item-4', recorded_at: new Date().toISOString(), estimated_value: 95, best_platform: 'Poshmark' }
    ]
  },
  {
    id: 'demo-item-5',
    user_id: 'demo-user-123',
    title: 'Hermès Silk Twill Scarf "Bride de Gala"',
    description: '100% silk twill printed scarf with hand-rolled edges. Excellent condition with care tag intact.',
    brand: 'Hermès',
    category_name: 'Designer & Luxury',
    condition: 'Like New' as ItemCondition,
    storage_location: 'Bin B - Luxury Accs',
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
    purchase_price: 35,
    estimated_value: 280,
    best_platform: 'Poshmark',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    price_history: [
      { id: 'ph-11', item_id: 'demo-item-5', recorded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), estimated_value: 250, best_platform: 'Poshmark' },
      { id: 'ph-12', item_id: 'demo-item-5', recorded_at: new Date().toISOString(), estimated_value: 280, best_platform: 'Poshmark' }
    ]
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Vintage Clothing' },
  { id: 'cat-2', name: 'Sneakers' },
  { id: 'cat-3', name: 'Electronics' },
  { id: 'cat-4', name: 'Designer & Luxury' },
  { id: 'cat-5', name: 'Collectibles' },
  { id: 'cat-6', name: 'Furniture' }
];

const STORAGE_KEY = 'smart_resale_inventory';
const CAT_STORAGE_KEY = 'smart_resale_categories';

export function loadLocalInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local inventory', err);
    return INITIAL_DEMO_ITEMS;
  }
}

export function saveLocalInventory(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save local inventory', err);
  }
}

export function loadLocalCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}
