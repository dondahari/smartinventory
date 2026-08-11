'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation, TabType } from '@/components/Navigation';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { InventoryGrid } from '@/components/InventoryGrid';
import { CameraUploader } from '@/components/CameraUploader';
import { StorageBinsView } from '@/components/StorageBinsView';
import { CompsValuationView } from '@/components/CompsValuationView';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { SupabaseSQLModal } from '@/components/SupabaseSQLModal';
import { InventoryItem } from '@/types/inventory';
import { loadLocalInventory, saveLocalInventory, loadLocalCategories } from '@/lib/supabase/client';

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>(() => loadLocalInventory());
  const [categories] = useState<string[]>(() => loadLocalCategories().map(c => c.name));
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [, setShowScanModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state to local storage
  const updateItemsState = (newItems: InventoryItem[]) => {
    setItems(newItems);
    saveLocalInventory(newItems);
  };

  // Add Item handler
  const handleSaveItem = (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      price_history: [
        {
          id: `ph-${Date.now()}`,
          item_id: `item-${Date.now()}`,
          recorded_at: new Date().toISOString(),
          estimated_value: itemData.estimated_value,
          best_platform: itemData.best_platform
        }
      ]
    };

    const updated = [newItem, ...items];
    updateItemsState(updated);
    setShowScanModal(false);
    setActiveTab('inventory');
  };

  // Update existing item
  const handleUpdateItem = (updated: InventoryItem) => {
    const updatedList = items.map((i) => (i.id === updated.id ? updated : i));
    updateItemsState(updatedList);
    setSelectedItem(updated);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updatedList = items.filter((i) => i.id !== id);
    updateItemsState(updatedList);
  };

  const totalValue = items.reduce((acc, i) => acc + (i.estimated_value || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col pb-20 md:pb-8">
      
      {/* Streamlined Header */}
      <Header
        totalValue={totalValue}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Navigation Bar (Mobile) */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Tab 1: Portfolio Dashboard */}
        {activeTab === 'dashboard' && (
          <PortfolioDashboard
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenScan={() => { setActiveTab('scan'); setShowScanModal(true); }}
          />
        )}

        {/* Tab 2: Inventory List & Grid */}
        {activeTab === 'inventory' && (
          <InventoryGrid
            items={items}
            categories={categories}
            onSelectItem={(item) => setSelectedItem(item)}
            onDeleteItem={handleDeleteItem}
            onOpenScan={() => { setActiveTab('scan'); setShowScanModal(true); }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Tab 3: AI Camera Scanner */}
        {activeTab === 'scan' && (
          <CameraUploader
            onSaveItem={handleSaveItem}
            onCancel={() => setActiveTab('inventory')}
            categories={categories}
          />
        )}

        {/* Tab 4: Physical Storage Bins View */}
        {activeTab === 'bins' && (
          <StorageBinsView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenScan={() => { setActiveTab('scan'); setShowScanModal(true); }}
          />
        )}

        {/* Tab 5: Live Comps Search */}
        {activeTab === 'comps' && <CompsValuationView />}

      </main>

      {/* Item Detail & Comps Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Supabase SQL Setup Modal */}
      {showSupabaseModal && (
        <SupabaseSQLModal onClose={() => setShowSupabaseModal(false)} />
      )}

    </div>
  );
}
