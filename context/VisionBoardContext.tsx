import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { VisionItem } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface VisionBoardContextType {
  items: VisionItem[];
  loading: boolean;
  addItem: (item: Omit<VisionItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<VisionItem>) => Promise<void>;
}

const VisionBoardContext = createContext<VisionBoardContextType | undefined>(undefined);

export const VisionBoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await storage.load<VisionItem[]>(STORAGE_KEYS.VISION_BOARD);
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const persist = async (updated: VisionItem[]) => {
    setItems(updated);
    await storage.save(STORAGE_KEYS.VISION_BOARD, updated);
  };

  const addItem = async (data: Omit<VisionItem, 'id' | 'createdAt'>) => {
    const newItem: VisionItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    await persist([newItem, ...items]);
  };

  const deleteItem = async (id: string) => {
    await persist(items.filter(i => i.id !== id));
  };

  const updateItem = async (id: string, updates: Partial<VisionItem>) => {
    await persist(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  return (
    <VisionBoardContext.Provider value={{ items, loading, addItem, deleteItem, updateItem }}>
      {children}
    </VisionBoardContext.Provider>
  );
};

export const useVisionBoard = () => {
  const context = useContext(VisionBoardContext);
  if (context === undefined) throw new Error('useVisionBoard must be used within a VisionBoardProvider');
  return context;
};