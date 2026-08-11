'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { InventoryCard } from './InventoryCard';
import { Grid, List, Box, Plus } from 'lucide-react';

interface InventoryGridProps {
  items: InventoryItem[];
  categories: string[];
  onSelectItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenScan: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  categories,
  onSelectItem,
  onDeleteItem,
  onOpenScan,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'value-desc' | 'value-asc' | 'recent' | 'location'>('value-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Unique storage locations
  const storageLocations = Array.from(new Set(items.map(i => i.storage_location).filter(Boolean)));

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.storage_location && item.storage_location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || item.storage_location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'value-desc') return b.estimated_value - a.estimated_value;
    if (sortBy === 'value-asc') return a.estimated_value - b.estimated_value;
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'location') return (a.storage_location || '').localeCompare(b.storage_location || '');
    return 0;
  });

  const filteredTotalValue = sortedItems.reduce((acc, i) => acc + (i.estimated_value || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Sleek Minimalist Control Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category & Bin Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Categories ({items.length})</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Storage Bins</option>
            {storageLocations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'value-desc' | 'value-asc' | 'recent' | 'location')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="value-desc">Sort: Highest Value</option>
            <option value="value-asc">Sort: Lowest Value</option>
            <option value="recent">Sort: Recently Added</option>
            <option value="location">Sort: Storage Bin</option>
          </select>

        </div>

        {/* View Toggle & Summary */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
          <span className="text-slate-500 font-medium">
            {sortedItems.length} items • <strong className="text-emerald-700 font-bold">${filteredTotalValue.toLocaleString()}</strong>
          </span>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Inventory Grid / List Display */}
      {sortedItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Box className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No inventory items found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or filter tags, or scan a new item with AI vision.
          </p>
          <button
            onClick={onOpenScan}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Scan New Inventory Item
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onSelectItem={onSelectItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {item.brand || 'Unbranded'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {item.category_name}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-700">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Box className="w-3 h-3 text-indigo-600" /> {item.storage_location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-black text-emerald-700">
                  ${item.estimated_value}
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  On {item.best_platform}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
