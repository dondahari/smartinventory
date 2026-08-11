'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem, CompsResponse } from '@/types/inventory';
import { X, Box, TrendingUp, ExternalLink, Trash2, Edit2, Check } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onUpdateItem: (updated: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [compsData, setCompsData] = useState<CompsResponse | null>(null);
  const [, setLoadingComps] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState(item?.storage_location || '');

  useEffect(() => {
    let isMounted = true;
    if (!item) return;

    async function loadComps() {
      setLoadingComps(true);
      try {
        const response = await fetch('/api/comps/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item?.title,
            category: item?.category_name,
            brand: item?.brand,
            condition: item?.condition,
            currentValue: item?.estimated_value
          })
        });
        const json = await response.json();
        if (isMounted && json.data) {
          setCompsData(json.data);
        }
      } catch (e) {
        console.error('Error fetching comps:', e);
      } finally {
        if (isMounted) setLoadingComps(false);
      }
    }

    loadComps();

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const handleSaveLocation = () => {
    if (!newLocation.trim()) return;
    onUpdateItem({
      ...item,
      storage_location: newLocation,
      updated_at: new Date().toISOString()
    });
    setIsEditingLocation(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item.title}" from your inventory?`)) {
      onDeleteItem(item.id);
      onClose();
    }
  };

  const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(item.title)}`;
  const depopUrl = `https://www.depop.com/search/?q=${encodeURIComponent(item.title)}`;
  const poshmarkUrl = `https://poshmark.com/search?query=${encodeURIComponent(item.title)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
              {item.category_name || 'Inventory'}
            </span>
            <span className="text-xs text-slate-500 font-medium">ID: #{item.id.slice(-6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Top Banner: Image & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-5 rounded-2xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>

            <div className="sm:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.brand || 'Unbranded'}</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {item.condition}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 leading-snug">{item.title}</h2>

              {/* Storage Location Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Storage Location</div>
                    {isEditingLocation ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded-md"
                        />
                        <button onClick={handleSaveLocation} className="p-1 bg-emerald-600 text-white rounded-md">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-slate-900">{item.storage_location}</div>
                    )}
                  </div>
                </div>

                {!isEditingLocation && (
                  <button
                    onClick={() => setIsEditingLocation(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Move Bin
                  </button>
                )}
              </div>

              {/* Price & Cost Highlight */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Estimated Resale Value</div>
                  <div className="text-xl font-black text-emerald-700">${item.estimated_value.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Acquisition Cost</div>
                  <div className="text-xl font-bold text-slate-800">${item.purchase_price || 0}</div>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Live Platform Pricing Comps Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Live Comps & Platform Breakdown
                </h3>
                <p className="text-xs text-slate-500">Real-time platform pricing comparisons (eBay, Depop, Poshmark)</p>
              </div>
            </div>

            {compsData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {compsData.platforms.map((p, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-700">{p.platform}</span>
                    <div className="text-lg font-black text-slate-900">${p.estimatedPrice}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{p.activeListingsCount} active listings</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Price Trend Chart */}
          {compsData && compsData.historicalPrices && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Item Price Valuation Trend</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compsData.historicalPrices} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value) => [`$${value ?? 0}`, 'Market Value']} />
                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* External Search Direct Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Cross-reference live comps on platform:</span>
            <div className="flex items-center gap-2">
              <a
                href={ebayUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search eBay <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={depopUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search Depop <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={poshmarkUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                Search Poshmark <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
