
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeBlock } from '../types';
import { storage } from '../utils/storage';

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

const BLOCKS_STORAGE_KEY = 'lifeos_time_blocks_v1';

export const TimeBlockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const storedBlocks = await storage.load<TimeBlock[]>(BLOCKS_STORAGE_KEY);
      if (storedBlocks) setTimeBlocks(storedBlocks);
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (!loading) {
      storage.save(BLOCKS_STORAGE_KEY, timeBlocks);
    }
  }, [timeBlocks, loading]);

  // Helper: Calculate duration in minutes from "HH:mm" strings
  const calcDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const addBlock = async (data: Omit<TimeBlock, 'id' | 'duration' | 'completed'>) => {
    const duration = calcDuration(data.startTime, data.endTime);
    const newBlock: TimeBlock = {
      ...data,
      id: Date.now().toString(),
      duration,
      completed: false,
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = async (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...updates };
        if (updates.startTime || updates.endTime) {
          updated.duration = calcDuration(updated.startTime, updated.endTime);
        }
        return updated;
      }
      return b;
    }));
  };

  const deleteBlock = async (id: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== id));
  };

  const toggleBlock = async (id: string) => {
    setTimeBlocks(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  const getBlocksForDate = (date: string) => {
    return timeBlocks
      .filter(b => b.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <TimeBlockContext.Provider value={{
      timeBlocks,
      loading,
      addBlock,
      updateBlock,
      deleteBlock,
      toggleBlock,
      getBlocksForDate
    }}>
      {children}
    </TimeBlockContext.Provider>
  );
};

export const useTimeBlocks = () => {
  const context = useContext(TimeBlockContext);
  if (context === undefined) throw new Error('useTimeBlocks must be used within a TimeBlockProvider');
  return context;
};
