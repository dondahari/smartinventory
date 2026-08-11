'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, RefreshCw, Sparkles, Award } from 'lucide-react';
import { CompsResponse } from '@/types/inventory';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const CompsValuationView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Vintage Clothing');
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompsResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comps/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: query,
          category,
          condition
        })
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Multi-Platform Resale Valuation Engine
          </div>
          <h2 className="text-2xl font-black tracking-tight">Search Live Comps Across eBay, Depop & Poshmark</h2>
          <p className="text-xs text-indigo-200">
            Compare active market prices, recent sold listings, and demand velocity before buying or listing.
          </p>

          <form onSubmit={handleSearch} className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter item name, brand, or model (e.g. Nike Dunk Low Panda, Sony Camcorder)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-md"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span>Fetch Comps</span>
              </button>
            </div>

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
          
          {/* Top Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Market Value</span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ${result.overallBestValue.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target platform: <strong className="text-emerald-700 font-bold">{result.overallBestPlatform}</strong> • Demand: <strong className="text-slate-800">{result.marketDemand}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-600" /> Best Platform: {result.overallBestPlatform}
              </span>
            </div>
          </div>

          {/* Platform Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.platforms.map((p) => (
              <div key={p.platform} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 text-center hover:border-slate-300 transition-all">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">6-Month Price Trend Comparison</h3>
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

        </div>
      )}

    </div>
  );
};
