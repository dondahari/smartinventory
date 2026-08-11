'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, RefreshCw } from 'lucide-react';
import { AutoTagResult, InventoryItem, ItemCondition, ResalePlatform } from '@/types/inventory';
import confetti from 'canvas-confetti';

interface CameraUploaderProps {
  onSaveItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  categories: string[];
}

const SAMPLE_PHOTOS = [
  { label: 'Vintage Nike Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' },
  { label: 'Air Jordan 1s', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sony Vintage Walkman', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nintendo Game Boy', url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bbe97?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hermes Scarf', url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80' }
];

export const CameraUploader: React.FC<CameraUploaderProps> = ({
  onSaveItem,
  onCancel,
  categories,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AutoTagResult | null>(null);
  const [, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Vintage Clothing');
  const [condition, setCondition] = useState<ItemCondition>('Good');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [storageLocation, setStorageLocation] = useState('Bin A - Apparel');
  const [bestPlatform, setBestPlatform] = useState<ResalePlatform>('eBay');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      processAiVision(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (imageUrl: string) => {
    setSelectedImage(imageUrl);
    processAiVision(imageUrl);
  };

  const processAiVision = async (imageData: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      const json = await response.json();
      if (!response.ok || !json.data) {
        throw new Error(json.error || 'AI vision processing failed');
      }

      const res: AutoTagResult = json.data;
      setAiResult(res);
      setTitle(res.title);
      setBrand(res.brand);
      if (res.category && categories.includes(res.category)) setCategory(res.category);
      if (res.condition) setCondition(res.condition);
      setEstimatedValue(res.estimatedValue);
      setPurchasePrice(res.purchasePriceEstimate || 10);
      setStorageLocation(res.suggestedStorageLocation || 'Bin A');
      if (res.suggestedPlatform) setBestPlatform(res.suggestedPlatform);
      setDescription(res.description);

      if (res.estimatedValue > 100) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: unknown) {
      console.error('AI Scan Error:', err);
      setError('Could not complete full AI Vision scan. Auto-filled defaults.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedImage) {
      setError('Please upload a photo and provide a title.');
      return;
    }

    onSaveItem({
      title,
      brand,
      category_name: category,
      condition,
      estimated_value: Number(estimatedValue),
      purchase_price: Number(purchasePrice),
      storage_location: storageLocation,
      best_platform: bestPlatform,
      image_url: selectedImage,
      description
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Vision Inventory Scanner</h2>
            <p className="text-xs text-slate-500">Snap a photo to automatically extract brand, condition, value & storage bin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-2 text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {!selectedImage ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Take Photo or Upload Image</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-3">
              Works directly with your phone camera or desktop file chooser
            </p>
            <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs">
              <Upload className="w-3.5 h-3.5" /> Choose Image File
            </span>
          </div>

          {/* Quick Demo Samples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Or test with a sample item photo:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SAMPLE_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 transition-all text-left bg-slate-100 aspect-4/3 cursor-pointer"
                >
                  <img src={sample.url} alt={sample.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-2 flex items-end">
                    <span className="text-[11px] font-medium text-white leading-tight drop-shadow-xs">{sample.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Image Preview & AI Scanner Status */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square group">
              <img src={selectedImage} alt="Selected item" className="w-full h-full object-cover" />

              {/* Laser Scan Overlay when processing */}
              {isScanning && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse absolute top-1/3 shadow-lg"></div>
                  <Sparkles className="w-10 h-10 text-indigo-300 animate-spin mb-2" />
                  <span className="text-sm font-bold tracking-wide">Gemini AI Analyzing...</span>
                  <span className="text-[11px] text-indigo-200 mt-1">Extracting brand, condition & pricing comps</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setSelectedImage(null); setAiResult(null); }}
                className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 backdrop-blur-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
            </div>

            {/* AI Vision Badge Box */}
            {aiResult && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Gemini AI Vision Extraction Complete</span>
                </div>
                <p className="text-indigo-700 text-[11px]">
                  Detected <strong>{aiResult.brand}</strong> in <strong>{aiResult.category}</strong>. Suggested storage location: <strong>{aiResult.suggestedStorageLocation}</strong>.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {aiResult.tags.map((t, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Auto-Populated Form */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage 90s Nike Swoosh Windbreaker"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Nike, Sony, Gucci"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition & Storage Location Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="New with Tags">New with Tags</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location (Bin/Shelf)</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Bin A, Shelf 2, Box 04"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Pricing Valuation & Cost */}
            <div className="grid grid-cols-3 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Est. Resale Value ($)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-extrabold text-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Purchase Cost ($)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Best Platform</label>
                <select
                  value={bestPlatform}
                  onChange={(e) => setBestPlatform(e.target.value as ResalePlatform)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="eBay">eBay</option>
                  <option value="Depop">Depop</option>
                  <option value="Poshmark">Poshmark</option>
                  <option value="Vinted">Vinted</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Item history, style, flaws or highlights..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save to Inventory
              </button>
            </div>

          </div>

        </form>
      )}
    </div>
  );
};
