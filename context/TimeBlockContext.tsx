import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TimeBlock } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface TimeBlockContextType {
  timeBlocks: TimeBlock[];
  loading: boolean;
  addBlock: (block: Omit<TimeBlock, 'id' | 'duration' | 'completed'>) => Promise<void>;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  toggleBlock: (id: string) => Promise<void>;
  getBlocksForDate: (date: string) => TimeBlock[];
}

const TimeBlockContext = createContext<TimeBlockContextType | undefined>(undefined);

export const TimeBlockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const storedBlocks = await storage.load<TimeBlock[]>(STORAGE_KEYS.TIME_BLOCKS);
    if (storedBlocks) setTimeBlocks(storedBlocks);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const calcDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const persist = async (updated: TimeBlock[]) => {
    setTimeBlocks(updated);
    await storage.save(STORAGE_KEYS.TIME_BLOCKS, updated);
  };

  const addBlock = async (data: Omit<TimeBlock, 'id' | 'duration' | 'completed'>) => {
    const duration = calcDuration(data.startTime, data.endTime);
    const newBlock: TimeBlock = { ...data, id: Date.now().toString(), duration, completed: false };
    await persist([...timeBlocks, newBlock]);
  };

  const updateBlock = async (id: string, updates: Partial<TimeBlock>) => {
    const updated = timeBlocks.map(b => {
      if (b.id === id) {
        const up = { ...b, ...updates };
        if (updates.startTime || updates.endTime) up.duration = calcDuration(up.startTime, up.endTime);
        return up;
      }
      return b;
    });
    await persist(updated);
  };

  const deleteBlock = async (id: string) => {
    await persist(timeBlocks.filter(b => b.id !== id));
  };

  const toggleBlock = async (id: string) => {
    await persist(timeBlocks.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  const getBlocksForDate = (date: string) => {
    return timeBlocks
      .filter(b => b.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <TimeBlockContext.Provider value={{ timeBlocks, loading, addBlock, updateBlock, deleteBlock, toggleBlock, getBlocksForDate }}>
      {children}
    </TimeBlockContext.Provider>
  );
};

export const useTimeBlocks = () => {
  const context = useContext(TimeBlockContext);
  if (context === undefined) throw new Error('useTimeBlocks must be used within a TimeBlockProvider');
  return context;
};