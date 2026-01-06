
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BlockedApp, WellnessSettings, BlockMode } from '../types';
import { storage } from '../utils/storage';
import { getTodayKey } from '../utils/dateUtils';

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
  
  // Actions
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

const WELLNESS_APPS_KEY = 'lifeos_wellness_apps_v1';
const WELLNESS_SETTINGS_KEY = 'lifeos_wellness_settings_v1';
const WELLNESS_STATS_KEY = 'lifeos_wellness_stats_v1';

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
  const [settings, setSettings] = useState<WellnessSettings>({
    strictMode: false,
    emergencyUnlockUsed: false,
  });
  const [activeMode, setActiveMode] = useState<BlockMode>('none');
  const [strictModeTimeLeft, setStrictModeTimeLeft] = useState(0);
  const [stats, setStats] = useState<DigitalWellnessStats>(INITIAL_STATS);
  const screenTimeTimerRef = useRef<number | null>(null);

  // Load Data
  useEffect(() => {
    const load = async () => {
      const storedApps = await storage.load<BlockedApp[]>(WELLNESS_APPS_KEY);
      const storedSettings = await storage.load<WellnessSettings>(WELLNESS_SETTINGS_KEY);
      const storedStats = await storage.load<DigitalWellnessStats>(WELLNESS_STATS_KEY);
      
      const today = getTodayKey();

      setBlockedApps(storedApps || DEFAULT_APPS);
      
      if (storedSettings) {
        setSettings(storedSettings);
        if (storedSettings.strictMode && storedSettings.strictModeEndTime) {
          const end = new Date(storedSettings.strictModeEndTime).getTime();
          const now = Date.now();
          const left = Math.max(0, Math.ceil((end - now) / 1000));
          if (left > 0) {
            setStrictModeTimeLeft(left);
            setActiveMode('focus');
          } else {
            setSettings(prev => ({ ...prev, strictMode: false, strictModeEndTime: undefined }));
          }
        }
      }

      // Handle Stats Initialization/Reset for new day
      if (storedStats && storedStats.date === today) {
        // Increment unlocks for the new session/load
        const updatedStats = { ...storedStats, unlocks: storedStats.unlocks + 1 };
        setStats(updatedStats);
        storage.save(WELLNESS_STATS_KEY, updatedStats);
      } else {
        // New day, start at 1 unlock (this load)
        const freshStats = { ...INITIAL_STATS, date: today, unlocks: 1 };
        setStats(freshStats);
        storage.save(WELLNESS_STATS_KEY, freshStats);
      }
    };
    load();
  }, []);

  // Screen Time Tracking (Accumulate minutes while tab is visible)
  useEffect(() => {
    const trackTime = () => {
      if (!document.hidden) {
        setStats(prev => {
          const newStats = { ...prev, screenTimeMinutes: prev.screenTimeMinutes + 1 };
          storage.save(WELLNESS_STATS_KEY, newStats);
          return newStats;
        });
      }
    };

    // Run every minute
    const intervalId = window.setInterval(trackTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync Timer for Strict Mode
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

  // Sync Persistent Data
  useEffect(() => { storage.save(WELLNESS_APPS_KEY, blockedApps); }, [blockedApps]);
  useEffect(() => { storage.save(WELLNESS_SETTINGS_KEY, settings); }, [settings]);

  const addBlockedApp = (app: Omit<BlockedApp, 'id'>) => {
    setBlockedApps(prev => [...prev, { ...app, id: Date.now().toString() }]);
  };

  const removeBlockedApp = (id: string) => {
    setBlockedApps(prev => prev.filter(a => a.id !== id));
  };

  const toggleAppBlock = (id: string) => {
    setBlockedApps(prev => prev.map(a => a.id === id ? { ...a, isBlocked: !a.isBlocked } : a));
  };

  const enableStrictMode = (durationMinutes: number) => {
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    setSettings(prev => ({
      ...prev,
      strictMode: true,
      strictModeEndTime: endTime,
      emergencyUnlockUsed: false
    }));
    setStrictModeTimeLeft(durationMinutes * 60);
    setActiveMode('focus');
  };

  const disableStrictMode = () => {
    if (settings.strictMode && strictModeTimeLeft > 0) return false;
    setSettings(prev => ({ ...prev, strictMode: false, strictModeEndTime: undefined }));
    setActiveMode('none');
    return true;
  };

  const emergencyUnlock = () => {
    if (!settings.strictMode) return;
    setSettings(prev => ({ 
        ...prev, 
        strictMode: false, 
        strictModeEndTime: undefined,
        emergencyUnlockUsed: true 
    }));
    setStrictModeTimeLeft(0);
    setActiveMode('none');
  };

  const recordFocusSession = (minutes: number) => {
    setStats(prev => {
      const newStats = { ...prev, completedFocusMinutes: prev.completedFocusMinutes + minutes };
      storage.save(WELLNESS_STATS_KEY, newStats);
      return newStats;
    });
  };

  return (
    <DigitalWellnessContext.Provider value={{
      blockedApps,
      settings,
      activeMode,
      strictModeTimeLeft,
      stats,
      addBlockedApp,
      removeBlockedApp,
      toggleAppBlock,
      enableStrictMode,
      disableStrictMode,
      setActiveMode,
      emergencyUnlock,
      recordFocusSession
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
