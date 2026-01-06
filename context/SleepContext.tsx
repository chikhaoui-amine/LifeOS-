
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SleepLog, SleepSettings } from '../types';
import { storage } from '../utils/storage';
import { getTodayKey } from '../utils/dateUtils';

interface SleepContextType {
  logs: SleepLog[];
  settings: SleepSettings;
  loading: boolean;
  
  // Actions
  addSleepLog: (log: Omit<SleepLog, 'id'>) => Promise<void>;
  updateSleepLog: (id: string, updates: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<SleepSettings>) => Promise<void>;
  
  // Helpers
  getLogForDate: (date: string) => SleepLog | undefined;
  getAverageSleep: (days: number) => number;
  calculateSleepScore: (log: SleepLog) => number;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

const SLEEP_LOGS_KEY = 'lifeos_sleep_logs_v1';
const SLEEP_SETTINGS_KEY = 'lifeos_sleep_settings_v1';

const DEFAULT_SLEEP_SETTINGS: SleepSettings = {
  targetHours: 8,
  minHours: 6,
  bedTimeGoal: '23:00',
  wakeTimeGoal: '07:00',
  windDownMinutes: 45
};

export const SleepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [settings, setSettings] = useState<SleepSettings>(DEFAULT_SLEEP_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const storedLogs = await storage.load<SleepLog[]>(SLEEP_LOGS_KEY);
      const storedSettings = await storage.load<SleepSettings>(SLEEP_SETTINGS_KEY);

      if (storedLogs) setLogs(storedLogs);
      if (storedSettings) {
          // Merge with defaults to ensure new properties like minHours exist
          setSettings({ ...DEFAULT_SLEEP_SETTINGS, ...storedSettings });
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync Data
  useEffect(() => { if (!loading) storage.save(SLEEP_LOGS_KEY, logs); }, [logs, loading]);
  useEffect(() => { if (!loading) storage.save(SLEEP_SETTINGS_KEY, settings); }, [settings, loading]);

  const addSleepLog = async (data: Omit<SleepLog, 'id'>) => {
    const newLog = { ...data, id: Date.now().toString() };
    setLogs(prev => {
        const exists = prev.find(l => l.date === data.date);
        if(exists) {
            return prev.map(l => l.date === data.date ? { ...newLog, id: l.id } : l);
        }
        return [...prev, newLog];
    });
  };

  const updateSleepLog = async (id: string, updates: Partial<SleepLog>) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteSleepLog = async (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const updateSettings = async (updates: Partial<SleepSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getLogForDate = (date: string) => {
    return logs.find(l => l.date === date);
  };

  const getAverageSleep = (days: number) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentLogs = sortedLogs.slice(0, days);
    if (recentLogs.length === 0) return 0;
    
    const totalMinutes = recentLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
    return Math.round(totalMinutes / recentLogs.length);
  };

  const calculateSleepScore = (log: SleepLog) => {
    // 50% Duration, 40% Quality, 10% Mood
    const durationTarget = settings.targetHours * 60;
    const durationScore = Math.min(1, log.durationMinutes / durationTarget) * 50;
    const qualityScore = (log.qualityRating / 100) * 40;
    
    const moodMap: Record<string, number> = { 'refreshed': 10, 'normal': 7, 'groggy': 4, 'tired': 2, 'anxious': 0 };
    const moodScore = moodMap[log.mood] ?? 5;

    return Math.round(durationScore + qualityScore + moodScore);
  };

  return (
    <SleepContext.Provider value={{
      logs, settings, loading,
      addSleepLog, updateSleepLog, deleteSleepLog, updateSettings,
      getLogForDate, getAverageSleep, calculateSleepScore
    }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (context === undefined) throw new Error('useSleep must be used within a SleepProvider');
  return context;
};
