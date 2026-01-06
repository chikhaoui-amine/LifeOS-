
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VisionItem } from '../types';
import { storage } from '../utils/storage';

interface VisionBoardContextType {
  items: VisionItem[];
  loading: boolean;
  addItem: (item: Omit<VisionItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<VisionItem>) => Promise<void>;
}

const VisionBoardContext = createContext<VisionBoardContextType | undefined>(undefined);

const VISION_STORAGE_KEY = 'lifeos_vision_board_v1';

export const VisionBoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const storedItems = await storage.load<VisionItem[]>(VISION_STORAGE_KEY);
      if (storedItems) setItems(storedItems);
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (!loading) {
      storage.save(VISION_STORAGE_KEY, items);
    }
  }, [items, loading]);

  const addItem = async (data: Omit<VisionItem, 'id' | 'createdAt'>) => {
    const newItem: VisionItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = async (id: string, updates: Partial<VisionItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
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
