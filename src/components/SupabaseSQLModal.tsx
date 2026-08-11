'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, X } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface SupabaseSQLModalProps {
  onClose: () => void;
}

const SQL_SCRIPT = `-- Resale Inventory App - Supabase SQL Setup Script
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  condition TEXT,
  storage_location TEXT,
  image_url TEXT,
  purchase_price NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  best_platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.categories (name) VALUES 
('Vintage Clothing'), ('Sneakers'), ('Electronics'), ('Designer & Luxury'), ('Collectibles');
`;

export const SupabaseSQLModal: React.FC<SupabaseSQLModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Supabase Database Integration</h3>
              <p className="text-xs text-slate-500">
                {isSupabaseConfigured ? 'Connected to live Supabase DB' : 'Currently running in Local Demo Storage mode'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p>
            To connect to your cloud database, add <code className="bg-slate-100 px-1.5 py-0.5 rounded border text-indigo-700">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded border text-indigo-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="bg-slate-100 px-1.5 py-0.5 rounded border">.env.local</code> file.
          </p>
          <p className="font-semibold text-slate-800">
            Copy and run this SQL script in your Supabase SQL Editor:
          </p>
        </div>

        <div className="relative">
          <pre className="bg-slate-900 text-slate-200 text-[11px] p-3.5 rounded-xl font-mono overflow-x-auto max-h-48 border border-slate-800">
            {SQL_SCRIPT}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
