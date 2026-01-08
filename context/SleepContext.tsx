import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SleepLog, SleepSettings } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface SleepContextType {
  logs: SleepLog[];
  settings: SleepSettings;
  loading: boolean;
  addSleepLog: (log: Omit<SleepLog, 'id'>) => Promise<void>;
  updateSleepLog: (id: string, updates: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<SleepSettings>) => Promise<void>;
  getLogForDate: (date: string) => SleepLog | undefined;
  getAverageSleep: (days: number) => number;
  calculateSleepScore: (log: SleepLog) => number;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

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

  const loadData = useCallback(async () => {
    const storedLogs = await storage.load<SleepLog[]>(STORAGE_KEYS.SLEEP_LOGS);
    const storedSettings = await storage.load<SleepSettings>(STORAGE_KEYS.SLEEP_SETTINGS);
    if (storedLogs) setLogs(storedLogs);
    if (storedSettings) setSettings({ ...DEFAULT_SLEEP_SETTINGS, ...storedSettings });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const addSleepLog = async (data: Omit<SleepLog, 'id'>) => {
    const newLog = { ...data, id: Date.now().toString() };
    const updated = logs.some(l => l.date === data.date) ? logs.map(l => l.date === data.date ? { ...newLog, id: l.id } : l) : [...logs, newLog];
    setLogs(updated);
    await storage.save(STORAGE_KEYS.SLEEP_LOGS, updated);
  };

  const updateSleepLog = async (id: string, updates: Partial<SleepLog>) => {
    const updated = logs.map(l => l.id === id ? { ...l, ...updates } : l);
    setLogs(updated);
    await storage.save(STORAGE_KEYS.SLEEP_LOGS, updated);
  };

  const deleteSleepLog = async (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    await storage.save(STORAGE_KEYS.SLEEP_LOGS, updated);
  };

  const updateSettings = async (updates: Partial<SleepSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await storage.save(STORAGE_KEYS.SLEEP_SETTINGS, updated);
  };

  const getLogForDate = (date: string) => logs.find(l => l.date === date);

  const getAverageSleep = (days: number) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentLogs = sortedLogs.slice(0, days);
    if (recentLogs.length === 0) return 0;
    return Math.round(recentLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / recentLogs.length);
  };

  const calculateSleepScore = (log: SleepLog) => {
    const durationTarget = settings.targetHours * 60;
    const durationScore = Math.min(1, log.durationMinutes / durationTarget) * 50;
    const qualityScore = (log.qualityRating / 100) * 40;
    const moodMap: Record<string, number> = { 'refreshed': 10, 'normal': 7, 'groggy': 4, 'tired': 2, 'anxious': 0 };
    return Math.round(durationScore + qualityScore + (moodMap[log.mood] ?? 5));
  };

  return (
    <SleepContext.Provider value={{ logs, settings, loading, addSleepLog, updateSleepLog, deleteSleepLog, updateSettings, getLogForDate, getAverageSleep, calculateSleepScore }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (context === undefined) throw new Error('useSleep must be used within a SleepProvider');
  return context;
};