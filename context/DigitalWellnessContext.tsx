import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { BlockedApp, WellnessSettings, BlockMode } from '../types';
import { storage } from '../utils/storage';
import { getTodayKey } from '../utils/dateUtils';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface DigitalWellnessStats {
  date: string;
  unlocks: number;
  screenTimeMinutes: number;
  completedFocusMinutes: number;
}

interface DigitalWellnessContextType {
  blockedApps: BlockedApp[];
  settings: WellnessSettings;
  activeMode: BlockMode;
  strictModeTimeLeft: number;
  stats: DigitalWellnessStats;
  addBlockedApp: (app: Omit<BlockedApp, 'id'>) => void;
  removeBlockedApp: (id: string) => void;
  toggleAppBlock: (id: string) => void;
  enableStrictMode: (durationMinutes: number) => void;
  disableStrictMode: () => boolean;
  setActiveMode: (mode: BlockMode) => void;
  emergencyUnlock: () => void;
  recordFocusSession: (minutes: number) => void;
}

const DigitalWellnessContext = createContext<DigitalWellnessContextType | undefined>(undefined);

const DEFAULT_APPS: BlockedApp[] = [
  { id: '1', name: 'Facebook', url: 'facebook.com', category: 'social', isBlocked: false },
  { id: '2', name: 'Instagram', url: 'instagram.com', category: 'social', isBlocked: false },
  { id: '3', name: 'Twitter / X', url: 'twitter.com', category: 'social', isBlocked: false },
  { id: '4', name: 'YouTube', url: 'youtube.com', category: 'entertainment', isBlocked: false },
  { id: '5', name: 'Netflix', url: 'netflix.com', category: 'entertainment', isBlocked: false },
  { id: '6', name: 'Reddit', url: 'reddit.com', category: 'social', isBlocked: false },
];

const INITIAL_STATS: DigitalWellnessStats = {
  date: getTodayKey(),
  unlocks: 0,
  screenTimeMinutes: 0,
  completedFocusMinutes: 0
};

export const DigitalWellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [settings, setSettings] = useState<WellnessSettings>({ strictMode: false, emergencyUnlockUsed: false });
  const [activeMode, setActiveMode] = useState<BlockMode>('none');
  const [strictModeTimeLeft, setStrictModeTimeLeft] = useState(0);
  const [stats, setStats] = useState<DigitalWellnessStats>(INITIAL_STATS);

  const loadData = useCallback(async () => {
    const storedApps = await storage.load<BlockedApp[]>(STORAGE_KEYS.WELLNESS_APPS);
    const storedSettings = await storage.load<WellnessSettings>(STORAGE_KEYS.WELLNESS_SETTINGS);
    const storedStats = await storage.load<DigitalWellnessStats>(STORAGE_KEYS.WELLNESS_STATS);
    
    const today = getTodayKey();
    setBlockedApps(storedApps || DEFAULT_APPS);
    
    if (storedSettings) {
      setSettings(storedSettings);
      if (storedSettings.strictMode && storedSettings.strictModeEndTime) {
        const end = new Date(storedSettings.strictModeEndTime).getTime();
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        if (left > 0) {
          setStrictModeTimeLeft(left);
          setActiveMode('focus');
        } else {
          setSettings(prev => ({ ...prev, strictMode: false, strictModeEndTime: undefined }));
        }
      }
    }

    if (storedStats && storedStats.date === today) {
      setStats(storedStats);
    } else {
      const freshStats = { ...INITIAL_STATS, date: today, unlocks: 1 };
      setStats(freshStats);
      storage.save(STORAGE_KEYS.WELLNESS_STATS, freshStats);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  useEffect(() => {
    const trackTime = () => {
      if (!document.hidden) {
        setStats(prev => {
          const newStats = { ...prev, screenTimeMinutes: prev.screenTimeMinutes + 1 };
          storage.save(STORAGE_KEYS.WELLNESS_STATS, newStats);
          return newStats;
        });
      }
    };
    const intervalId = window.setInterval(trackTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (settings.strictMode && strictModeTimeLeft > 0) {
      interval = setInterval(() => {
        setStrictModeTimeLeft(prev => {
          if (prev <= 1) {
            setSettings(s => ({ ...s, strictMode: false, strictModeEndTime: undefined }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [settings.strictMode, strictModeTimeLeft]);

  const addBlockedApp = (app: Omit<BlockedApp, 'id'>) => {
    const updated = [...blockedApps, { ...app, id: Date.now().toString() }];
    setBlockedApps(updated);
    storage.save(STORAGE_KEYS.WELLNESS_APPS, updated);
  };

  const removeBlockedApp = (id: string) => {
    const updated = blockedApps.filter(a => a.id !== id);
    setBlockedApps(updated);
    storage.save(STORAGE_KEYS.WELLNESS_APPS, updated);
  };

  const toggleAppBlock = (id: string) => {
    const updated = blockedApps.map(a => a.id === id ? { ...a, isBlocked: !a.isBlocked } : a);
    setBlockedApps(updated);
    storage.save(STORAGE_KEYS.WELLNESS_APPS, updated);
  };

  const enableStrictMode = (durationMinutes: number) => {
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const newSettings = { ...settings, strictMode: true, strictModeEndTime: endTime, emergencyUnlockUsed: false };
    setSettings(newSettings);
    setStrictModeTimeLeft(durationMinutes * 60);
    setActiveMode('focus');
    storage.save(STORAGE_KEYS.WELLNESS_SETTINGS, newSettings);
  };

  const disableStrictMode = () => {
    if (settings.strictMode && strictModeTimeLeft > 0) return false;
    const newSettings = { ...settings, strictMode: false, strictModeEndTime: undefined };
    setSettings(newSettings);
    setActiveMode('none');
    storage.save(STORAGE_KEYS.WELLNESS_SETTINGS, newSettings);
    return true;
  };

  const emergencyUnlock = () => {
    if (!settings.strictMode) return;
    const newSettings = { ...settings, strictMode: false, strictModeEndTime: undefined, emergencyUnlockUsed: true };
    setSettings(newSettings);
    setStrictModeTimeLeft(0);
    setActiveMode('none');
    storage.save(STORAGE_KEYS.WELLNESS_SETTINGS, newSettings);
  };

  const recordFocusSession = (minutes: number) => {
    setStats(prev => {
      const newStats = { ...prev, completedFocusMinutes: prev.completedFocusMinutes + minutes };
      storage.save(STORAGE_KEYS.WELLNESS_STATS, newStats);
      return newStats;
    });
  };

  return (
    <DigitalWellnessContext.Provider value={{
      blockedApps, settings, activeMode, strictModeTimeLeft, stats,
      addBlockedApp, removeBlockedApp, toggleAppBlock, enableStrictMode, disableStrictMode,
      setActiveMode, emergencyUnlock, recordFocusSession
    }}>
      {children}
    </DigitalWellnessContext.Provider>
  );
};

export const useDigitalWellness = () => {
  const context = useContext(DigitalWellnessContext);
  if (context === undefined) throw new Error('useDigitalWellness must be used within a DigitalWellnessProvider');
  return context;
};