'use client';

import React from 'react';
import { Sparkles, Plus, Search, DollarSign } from 'lucide-react';
import { TabType } from './Navigation';

interface HeaderProps {
  totalValue: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalValue,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard' },
    { id: 'inventory' as TabType, label: 'Inventory' },
    { id: 'bins' as TabType, label: 'Storage Bins' },
    { id: 'comps' as TabType, label: 'Live Comps' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Logo & Tab Navigation */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-600 transition-colors">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-white" />
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">SmartResale</span>
            </div>

            {/* Desktop Navigation Tabs - Sleek & Uncluttered */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Search, Liquid Capital & Action */}
          <div className="flex items-center gap-3">
            
            {/* Search Input - Clean minimal design */}
            <div className="hidden lg:block relative w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none transition-all"
              />
            </div>

            {/* Total Stored Liquid Capital Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-xs font-bold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>${totalValue.toLocaleString()}</span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Scan Item</span>
            </button>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                activeTab === tab.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
