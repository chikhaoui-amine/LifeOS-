import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { JournalEntry, MoodType } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface JournalContextType {
  entries: JournalEntry[];
  loading: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'plainText'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getStats: () => { totalEntries: number; streak: number; moodDistribution: Record<string, number> };
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await storage.load<JournalEntry[]>(STORAGE_KEYS.JOURNAL);
    if (data) setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const persist = async (updated: JournalEntry[]) => {
    setEntries(updated);
    await storage.save(STORAGE_KEYS.JOURNAL, updated);
  };

  const addEntry = async (data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'plainText'>) => {
    const newEntry: JournalEntry = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      plainText: stripHtml(data.content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await persist([newEntry, ...entries]);
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const updated = entries.map(e => {
      if (e.id === id) {
        const up = { ...e, ...updates };
        if (updates.content) up.plainText = stripHtml(updates.content);
        up.updatedAt = new Date().toISOString();
        return up;
      }
      return e;
    });
    await persist(updated);
  };

  const deleteEntry = async (id: string) => {
    await persist(entries.filter(e => e.id !== id));
  };

  const toggleFavorite = async (id: string) => {
    await persist(entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
  };

  const getStats = () => {
    const totalEntries = entries.length;
    const moodDistribution: Record<string, number> = {};
    entries.forEach(e => { moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1; });
    // Fix: Explicitly type the unique dates as string[] to resolve 'unknown' type errors during sorting in environments where Set spread isn't correctly inferred
    const uniqueDates: string[] = Array.from(new Set(entries.map(e => e.date.split('T')[0])));
    const dates = uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = dates.length > 0 ? 1 : 0; 
    return { totalEntries, streak, moodDistribution };
  };

  return (
    <JournalContext.Provider value={{ entries, loading, addEntry, updateEntry, deleteEntry, toggleFavorite, getStats }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) throw new Error('useJournal must be used within a JournalProvider');
  return context;
};