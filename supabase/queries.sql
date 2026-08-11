-- ========================================================
-- SMART RESALE AI - COMPLETE SUPABASE DATABASE SETUP & QUERIES
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ========================================================

-- --------------------------------------------------------
-- SECTION 1: CREATE TABLES
-- --------------------------------------------------------

-- 1. Profiles Table (Stores auth user metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Categories Table (System defaults + user custom categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means system default
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  condition TEXT, -- 'New with Tags', 'Like New', 'Good', 'Fair', 'Poor'
  storage_location TEXT, -- e.g. "Bin A", "Box 04", "Shelf 2"
  image_url TEXT,
  purchase_price NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  best_platform TEXT, -- 'eBay', 'Depop', 'Poshmark', 'Vinted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 4. Price History Table (Valuation timeline tracking)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  estimated_value NUMERIC,
  best_platform TEXT,
  highest_price NUMERIC
);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;


-- --------------------------------------------------------
-- SECTION 2: ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

DO $$ BEGIN
  -- Profiles Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Categories Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view system and own categories') THEN
    CREATE POLICY "Users can view system and own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own categories') THEN
    CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own categories') THEN
    CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own categories') THEN
    CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Inventory Items Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own inventory') THEN
    CREATE POLICY "Users can manage own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Price History Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own price history') THEN
    CREATE POLICY "Users can manage own price history" ON public.price_history FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.inventory_items WHERE id = public.price_history.item_id AND user_id = auth.uid()
      )
    );
  END IF;
END $$;


-- --------------------------------------------------------
-- SECTION 3: STORAGE BUCKET SETUP FOR PHOTOS
-- --------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) VALUES ('inventory_images', 'inventory_images', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images') THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inventory_images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Images are publicly accessible') THEN
    CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'inventory_images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own images') THEN
    CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inventory_images');
  END IF;
END $$;


-- --------------------------------------------------------
-- SECTION 4: DEFAULT SYSTEM CATEGORIES SEED DATA
-- --------------------------------------------------------

INSERT INTO public.categories (name) 
VALUES ('Vintage Clothing'), ('Sneakers'), ('Electronics'), ('Designer & Luxury'), ('Collectibles'), ('Furniture');


-- --------------------------------------------------------
-- SECTION 5: USEFUL ANALYTICS & QUERY EXAMPLES
-- --------------------------------------------------------

-- Query A: Get Total Liquid Capital & Net Profit by User
-- SELECT 
--   user_id,
--   COUNT(id) AS total_items,
--   SUM(estimated_value) AS total_liquid_capital,
--   SUM(purchase_price) AS total_investment_cost,
--   (SUM(estimated_value) - SUM(purchase_price)) AS total_net_gain
-- FROM public.inventory_items
-- GROUP BY user_id;

-- Query B: Get Inventory Held Inside a Specific Storage Bin (e.g. "Bin A")
-- SELECT id, title, brand, estimated_value, best_platform, created_at
-- FROM public.inventory_items
-- WHERE storage_location = 'Bin A - Clothing'
-- ORDER BY estimated_value DESC;

-- Query C: Get Stored Capital Allocation by Storage Location
-- SELECT 
--   storage_location,
--   COUNT(id) AS item_count,
--   SUM(estimated_value) AS total_value_stored
-- FROM public.inventory_items
-- GROUP BY storage_location
-- ORDER BY total_value_stored DESC;
