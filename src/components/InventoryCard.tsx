'use client';

import React from 'react';
import { InventoryItem, ResalePlatform } from '@/types/inventory';
import { Box } from 'lucide-react';

interface InventoryCardProps {
  item: InventoryItem;
  onSelectItem: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

const PLATFORM_STYLES: Record<ResalePlatform, string> = {
  eBay: 'bg-blue-50 text-blue-700 border-blue-200',
  Depop: 'bg-red-50 text-red-700 border-red-200',
  Poshmark: 'bg-rose-50 text-rose-800 border-rose-200',
  Vinted: 'bg-teal-50 text-teal-700 border-teal-200'
};

const CONDITION_STYLES: Record<string, string> = {
  'New with Tags': 'bg-emerald-100 text-emerald-800',
  'Like New': 'bg-teal-100 text-teal-800',
  'Good': 'bg-slate-100 text-slate-700',
  'Fair': 'bg-amber-100 text-amber-800',
  'Poor': 'bg-rose-100 text-rose-800'
};

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onSelectItem }) => {
  const profit = item.estimated_value - (item.purchase_price || 0);

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Top Image & Floating Badges */}
      <div>
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Condition Pill */}
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${CONDITION_STYLES[item.condition || 'Good']}`}>
            {item.condition || 'Good'}
          </span>

          {/* Platform Badge */}
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${PLATFORM_STYLES[item.best_platform || 'eBay']}`}>
            {item.best_platform}
          </span>
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span className="truncate max-w-[130px]">{item.brand || 'Unbranded'}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item.category_name || 'Inventory'}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
          {item.title}
        </h3>
      </div>

      {/* Bottom Section: Storage Bin & Financials */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        
        {/* Storage Bin Location */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Box className="w-3.5 h-3.5 text-indigo-600" />
            <span>{item.storage_location || 'Unassigned Bin'}</span>
          </div>

          {/* Profit badge */}
          {profit > 0 && (
            <span className="text-[11px] font-bold text-emerald-600">
              +${profit} profit
            </span>
          )}
        </div>

        {/* Valuation & Cost */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Purchased</div>
            <div className="text-xs font-semibold text-slate-700">
              ${item.purchase_price || 0}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Est. Value</div>
            <div className="text-base font-black text-emerald-700 leading-tight">
              ${item.estimated_value.toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
