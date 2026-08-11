# Resale Inventory App - Project Guidelines

## 1. Project Concept
An application designed for consolidating and holding onto items with good reselling value. Users can quickly photograph inventory, add brief descriptions, and automatically cross-reference items with reselling platforms (eBay, Depop, Vinted, Poshmark) to track estimated value over time.

## 2. Core Features (MVP)
* **AI Vision & Auto-Tagging:** Automatically extract brand, condition, and search query parameters from uploaded images.
* **Live Comps Pricing Engine:** Integrate external APIs (e.g., eBay Browse API, Poshmark via RapidAPI) to fetch real-time estimated values.
* **Storage Location Tracking:** Assign "Bin/Box/Shelf" locations to inventory for easy retrieval.
* **Portfolio Dashboard:** Visual representation of total liquid capital stored, categorized by item type (Electronics, Vintage Clothing, etc.).
* **Price History Tracking:** Monitor valuation changes over time to identify the best time and platform to sell.

## 3. Architecture Selection
**Next.js Progressive Web App (PWA)**
* **Mobile View:** Optimized for the physical workflow—fast HTML5 camera access, rapid tagging, and location assignment.
* **Desktop View:** Optimized for management—dense dashboard, historical price charts, bulk inventory editing.
* **Backend:** Next.js Server Actions/API routes to securely connect to external pricing APIs without exposing keys to the client.

## 4. Supabase Database Schema
This schema supports OAuth authentication, hybrid categorization (system + custom), location tracking, and historical price monitoring.

### Instructions:
1. Navigate to your Supabase project's SQL Editor.
2. Copy and run the following SQL script to set up tables, Row Level Security (RLS), and Storage buckets.

```sql
-- 1. Profiles Table
CREATE TABLE public.profiles (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Categories Table (Supports fixed defaults & custom user categories)
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means it's a fixed system category
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Inventory Items
CREATE TABLE public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  storage_location TEXT, -- e.g., "Bin A", "Garage Shelf 2"
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 4. Price History (Tracks valuation over time)
CREATE TABLE public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  estimated_value NUMERIC,
  best_platform TEXT, -- e.g., 'eBay', 'Depop', 'Vinted'
  highest_price NUMERIC
);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security (RLS) Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view system and own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Inventory Items
CREATE POLICY "Users can manage own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);

-- Price History
CREATE POLICY "Users can manage own price history" ON public.price_history FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.inventory_items WHERE id = public.price_history.item_id AND user_id = auth.uid()
  )
);

-- 6. Storage Bucket for Item Photos
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory_images', 'inventory_images', true);
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inventory_images');
CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'inventory_images');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inventory_images');
```

## 5. Next Steps & Initialization
1. **Seed Default Categories (Optional):** Run the following to add base categories for all users.
   `INSERT INTO public.categories (name) VALUES ('Vintage Clothing'), ('Electronics'), ('Sneakers'), ('Furniture');`
2. **Configure OAuth:** Head over to **Authentication > Providers** in the Supabase dashboard to toggle on Google and Apple. Provide the respective Client IDs and Secrets.
3. **Initialize Frontend:** Create a Next.js project and install Supabase client packages (`@supabase/supabase-js` or `@supabase/ssr`).
