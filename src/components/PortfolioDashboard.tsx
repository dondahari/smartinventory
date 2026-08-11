'use client';

import React from 'react';
import { DollarSign, TrendingUp, Package, Box } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

interface PortfolioDashboardProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onOpenScan: () => void;
}

const CATEGORY_COLORS = ['#059669', '#4F46E5', '#2563EB', '#DC2626', '#D97706', '#0D9488'];

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  items,
  onSelectItem,
  onOpenScan,
}) => {
  // Calculations
  const totalValue = items.reduce((acc, i) => acc + (i.estimated_value || 0), 0);
  const totalCost = items.reduce((acc, i) => acc + (i.purchase_price || 0), 0);
  const netProfit = totalValue - totalCost;
  const roiPercentage = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  // Category breakdown
  const categoryMap: { [key: string]: number } = {};
  items.forEach((item) => {
    const cat = item.category_name || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (item.estimated_value || 0);
  });
  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat]
  }));

  // Simulated 6-Month Portfolio Trend
  const trendData = [
    { month: 'Mar', capital: Math.round(totalValue * 0.55) },
    { month: 'Apr', capital: Math.round(totalValue * 0.68) },
    { month: 'May', capital: Math.round(totalValue * 0.79) },
    { month: 'Jun', capital: Math.round(totalValue * 0.86) },
    { month: 'Jul', capital: Math.round(totalValue * 0.92) },
    { month: 'Aug', capital: totalValue }
  ];

  // Top Value Items
  const sortedItems = [...items].sort((a, b) => b.estimated_value - a.estimated_value);
  const topItems = sortedItems.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Clean Single Portfolio Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Liquid Capital</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              +{roiPercentage}% ROI
            </span>
          </div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            ${totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Net Gain: <strong className="text-emerald-700 font-bold">+${netProfit.toLocaleString()}</strong>
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Investment</div>
            <div className="text-lg font-bold text-slate-800">${totalCost.toLocaleString()}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Stored Items</div>
            <div className="text-lg font-bold text-slate-800">{items.length} items</div>
          </div>

          <button
            onClick={onOpenScan}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            + Add Inventory
          </button>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Liquid Capital Portfolio Growth Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Portfolio Growth Trend</h3>
              <p className="text-xs text-slate-500">6-Month stored value progression</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${value ?? 0}`, 'Capital Value']} />
                <Area type="monotone" dataKey="capital" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCapital)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Category Breakdown Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-sm">Category Allocation</h3>
            <p className="text-xs text-slate-500">Value distribution by type</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value ?? 0}`, 'Valuation']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></span>
                <span>{cat.name} (${cat.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Assets List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Top Value Assets</h3>
          <span className="text-xs text-slate-400 font-medium">Sorted by highest market value</span>
        </div>
        <div className="divide-y divide-slate-100">
          {topItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.title} className="w-11 h-11 rounded-lg object-cover border border-slate-200" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-700">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span>{item.brand || 'Unbranded'}</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-600">{item.storage_location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-emerald-700">
                  ${item.estimated_value}
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {item.best_platform}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
