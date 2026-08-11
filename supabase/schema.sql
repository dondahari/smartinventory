-- Resale Inventory App - Supabase SQL Setup Script
-- Copy and run this script in your Supabase SQL Editor.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile trigger for OAuth signups
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

-- 2. Categories Table (Supports fixed defaults & custom user categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means it's a fixed system category
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  condition TEXT, -- e.g., 'New with Tags', 'Like New', 'Good', 'Fair'
  storage_location TEXT, -- e.g., "Bin A", "Garage Shelf 2"
  image_url TEXT,
  purchase_price NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  best_platform TEXT, -- e.g., 'eBay', 'Depop', 'Poshmark', 'Vinted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 4. Price History (Tracks valuation over time)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  estimated_value NUMERIC,
  best_platform TEXT, -- e.g., 'eBay', 'Depop', 'Poshmark'
  highest_price NUMERIC
);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security (RLS) Policies
DO $$ BEGIN
  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Categories
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

  -- Inventory Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own inventory') THEN
    CREATE POLICY "Users can manage own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Price History
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own price history') THEN
    CREATE POLICY "Users can manage own price history" ON public.price_history FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.inventory_items WHERE id = public.price_history.item_id AND user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 6. Storage Bucket for Item Photos
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory_images', 'inventory_images', true) ON CONFLICT (id) DO NOTHING;

-- 7. Seed Default System Categories
INSERT INTO public.categories (name) 
VALUES ('Vintage Clothing'), ('Sneakers'), ('Electronics'), ('Designer & Luxury'), ('Collectibles'), ('Furniture');
