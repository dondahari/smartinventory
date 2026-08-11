'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { Box, Plus } from 'lucide-react';

interface StorageBinsViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onOpenScan: () => void;
}

export const StorageBinsView: React.FC<StorageBinsViewProps> = ({ items, onSelectItem, onOpenScan }) => {
  const [newBinName, setNewBinName] = useState('');
  const [customBins, setCustomBins] = useState<string[]>([]);

  // Group items by storage_location
  const binGroups: Record<string, InventoryItem[]> = {};

  items.forEach((item) => {
    const loc = item.storage_location || 'Unassigned Bin';
    if (!binGroups[loc]) binGroups[loc] = [];
    binGroups[loc].push(item);
  });

  // Include custom created bins even if empty
  customBins.forEach((b) => {
    if (!binGroups[b]) binGroups[b] = [];
  });

  const handleAddBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinName.trim()) return;
    if (!customBins.includes(newBinName)) {
      setCustomBins([...customBins, newBinName]);
    }
    setNewBinName('');
  };

  const binNames = Object.keys(binGroups);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Box className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Physical Storage Location Tracker</h2>
          </div>
          <p className="text-xs text-slate-500">
            Organize inventory by Bin, Box, or Shelf to easily locate physical items when sold.
          </p>
        </div>

        {/* Add New Bin Form */}
        <form onSubmit={handleAddBin} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. Bin C - Electronics..."
            value={newBinName}
            onChange={(e) => setNewBinName(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Create Bin
          </button>
        </form>
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {binNames.map((binName) => {
          const binItems = binGroups[binName] || [];
          const binValue = binItems.reduce((acc, i) => acc + (i.estimated_value || 0), 0);

          return (
            <div
              key={binName}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Bin Header */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{binName}</h3>
                      <span className="text-[11px] text-slate-500 font-semibold">{binItems.length} items stored</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Stored Capital</div>
                    <div className="text-base font-black text-emerald-700">${binValue.toLocaleString()}</div>
                  </div>
                </div>

                {/* Bin Item Preview Thumbnails */}
                {binItems.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contents:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {binItems.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity relative group"
                          title={item.title}
                        >
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                            ${item.estimated_value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-4">
                    Bin is currently empty.
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <button
                onClick={onOpenScan}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" /> Add Item to {binName}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
