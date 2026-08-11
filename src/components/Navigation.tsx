'use client';

import React from 'react';
import { LayoutDashboard, Grid, Camera, Box, TrendingUp } from 'lucide-react';

export type TabType = 'dashboard' | 'inventory' | 'bins' | 'scan' | 'comps';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const mobileTabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as TabType, label: 'Inventory', icon: Grid },
    { id: 'scan' as TabType, label: 'Scan', icon: Camera, special: true },
    { id: 'bins' as TabType, label: 'Bins', icon: Box },
    { id: 'comps' as TabType, label: 'Comps', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.special) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="-mt-5 w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md cursor-pointer border-4 border-white"
                >
                  <Camera className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1.5 px-3 text-[11px] font-medium ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
