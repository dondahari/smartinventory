'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, RefreshCw, Sparkles, ExternalLink, Layers, ShieldCheck } from 'lucide-react';
import { CompsResponse } from '@/types/inventory';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const CompsValuationView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Vintage Clothing');
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompsResponse | null>(null);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comps/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: searchQuery,
          category,
          condition
        })
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error('Error fetching comps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> PriceCharting & Multi-Platform Resale Valuation
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Search Live Comps & PriceCharting Tiers</h2>
          <p className="text-xs text-indigo-200">
            Compare loose, CIB, sealed, and graded values across eBay, Depop, and Poshmark before buying or listing.
          </p>

          {/* Clean Search Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3 pt-2">
            <div className="relative text-left">
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type item, brand, or model (e.g. Pacman Fever, Air Jordan 1, Game Boy)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-md"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  <span>Fetch Comps</span>
                </button>
              </div>

            </div>

            {/* Quick Category & Condition Controls */}
            <div className="flex items-center justify-center gap-3 text-xs">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl focus:outline-none"
              >
                <option value="Vintage Clothing">Vintage Clothing</option>
                <option value="Sneakers">Sneakers</option>
                <option value="Electronics">Electronics</option>
                <option value="Designer & Luxury">Designer & Luxury</option>
                <option value="Collectibles">Collectibles</option>
              </select>

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl focus:outline-none"
              >
                <option value="New with Tags">New with Tags</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

          </form>

        </div>
      </div>

      {/* Comps Results Section */}
      {result && (
        <div className="space-y-6">
          
          {/* Product Verification & Main Valuation Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Product Reference Photo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                <img
                  src={result.productImageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'}
                  alt={result.itemTitle}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                  Verified
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{result.brand || 'Unbranded'}</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Demand: {result.marketDemand}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug mt-0.5">{result.itemTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Confirm product match for precise resale comps
                </p>
              </div>
            </div>

            {/* Target Value Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center md:text-right w-full md:w-auto shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Est. Market Value</span>
              <div className="text-3xl font-black text-emerald-700 tracking-tight">
                ${result.overallBestValue.toLocaleString()}
              </div>
              <span className="text-xs font-semibold text-slate-600">
                Best Channel: <strong className="text-slate-900">{result.overallBestPlatform}</strong>
              </span>
            </div>

          </div>

          {/* PriceCharting Style Tier Matrix (Loose / CIB / New / Graded) */}
          {result.priceChartingTiers && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">PriceCharting Condition Tier Matrix</h3>
                    <p className="text-xs text-slate-500">Average historical prices by packaging & grading tier</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  Collectors Matrix
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                
                {/* Loose / Ungraded */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loose / Raw</span>
                  <div className="text-2xl font-black text-slate-800">${result.priceChartingTiers.loosePrice}</div>
                  <span className="text-[10px] text-slate-400 font-medium">Unboxed item average</span>
                </div>

                {/* Complete in Box (CIB) */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-center space-y-1">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Complete (CIB)</span>
                  <div className="text-2xl font-black text-blue-900">${result.priceChartingTiers.cibPrice}</div>
                  <span className="text-[10px] text-blue-600 font-medium">With box & manual</span>
                </div>

                {/* Brand New / Sealed */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Sealed / New</span>
                  <div className="text-2xl font-black text-emerald-800">${result.priceChartingTiers.newPrice}</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Unopened factory seal</span>
                </div>

                {/* Graded / PSA / Wata */}
                <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3.5 text-center space-y-1">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Graded (PSA)</span>
                  <div className="text-2xl font-black text-purple-900">${result.priceChartingTiers.gradedPrice}</div>
                  <span className="text-[10px] text-purple-600 font-medium">Encapsulated graded</span>
                </div>

              </div>
            </div>
          )}

          {/* Resale Platform Cards Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.platforms.map((p) => (
              <div key={p.platform} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2 text-center hover:border-slate-300 transition-all">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p.platform}</span>
                <div className="text-2xl font-black text-slate-900">${p.estimatedPrice}</div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {p.activeListingsCount} active listings • Match: {p.matchConfidence}%
                </div>
                <div className="pt-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100">
                  Range: ${p.recommendedPriceRange.min} - ${p.recommendedPriceRange.max}
                </div>
              </div>
            ))}
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">6-Month Market Price Trend</h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.historicalPrices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value ?? 0}`, 'Market Price']} />
                  <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* External Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">Cross-reference live comps on platform:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(result.itemTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search eBay <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://www.depop.com/search/?q=${encodeURIComponent(result.itemTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search Depop <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://poshmark.com/search?query=${encodeURIComponent(result.itemTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search Poshmark <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
