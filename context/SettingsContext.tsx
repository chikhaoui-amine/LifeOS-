import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, LanguageCode } from '../types';
import { storage } from '../utils/storage';
import { BackupService, STORAGE_KEYS } from '../services/BackupService';
import { isRTL } from '../utils/translations';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings> | any) => void;
  resetSettings: () => void;
  isGoogleConnected: boolean;
  setGoogleConnected: (connected: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const GOOGLE_CONNECTED_KEY = 'lifeos_google_linked';
const LAST_BACKUP_KEY = 'lifeos_last_auto_backup';

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    habits: true,
    tasks: true,
    dailySummary: true,
    morningTime: '08:00',
    eveningTime: '20:00',
  },
  preferences: {
    language: 'en',
    startOfWeek: 'sunday',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoBackup: true,
    enableIslamicFeatures: true,
    reportDay: 0,
  },
  disabledModules: [],
  meals: {
    waterGoal: 8
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isGoogleConnected, setGoogleConnectedState] = useState(false);
  const [loading, setLoading] = useState(true);

  const mergeDeep = (target: any, source: any) => {
    if (!source) return target;
    const result = { ...target, ...source };
    if (target.notifications && source.notifications) {
      result.notifications = { ...target.notifications, ...source.notifications };
    }
    if (target.preferences && source.preferences) {
      result.preferences = { ...target.preferences, ...source.preferences };
    }
    return result;
  };

  useEffect(() => {
    const loadSettings = async () => {
      const data = await storage.load<any>(STORAGE_KEYS.SETTINGS);
      if (data) setSettings(prev => mergeDeep(prev, data));
      const googleLinked = await storage.load<boolean>(GOOGLE_CONNECTED_KEY);
      setGoogleConnectedState(!!googleLinked);
      setLoading(false);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const lang = settings?.preferences?.language || 'en';
    document.documentElement.dir = isRTL(lang as LanguageCode) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [settings?.preferences?.language]);

  // Periodic Local Auto-Backup (Safety Snapshots)
  useEffect(() => {
    if (loading || !settings?.preferences?.autoBackup) return;

    const runSafetySnapshot = async () => {
      const lastBackupStr = await storage.load<string>(LAST_BACKUP_KEY);
      const now = new Date();
      const lastBackup = lastBackupStr ? new Date(lastBackupStr) : new Date(0);
      
      const eightHours = 8 * 60 * 60 * 1000;
      if (now.getTime() - lastBackup.getTime() > eightHours) {
        console.log("LifeOS: Creating safety snapshot...");
        
        // Compiling everything from Storage
        const snapshot: any = BackupService.createBackupData([], [], settings);
        
        // Grab all core module data from storage
        snapshot.habits = await storage.load(STORAGE_KEYS.HABITS) || [];
        snapshot.habitCategories = await storage.load(STORAGE_KEYS.HABIT_CATEGORIES);
        snapshot.tasks = await storage.load(STORAGE_KEYS.TASKS) || [];
        snapshot.journal = await storage.load(STORAGE_KEYS.JOURNAL);
        snapshot.goals = await storage.load(STORAGE_KEYS.GOALS);
        snapshot.visionBoard = await storage.load(STORAGE_KEYS.VISION_BOARD);
        snapshot.reports = await storage.load(STORAGE_KEYS.REPORTS);
        snapshot.timeBlocks = await storage.load(STORAGE_KEYS.TIME_BLOCKS);
        snapshot.finance = {
          accounts: await storage.load(STORAGE_KEYS.FINANCE_ACCOUNTS) || [],
          transactions: await storage.load(STORAGE_KEYS.FINANCE_TXS) || [],
          budgets: await storage.load(STORAGE_KEYS.FINANCE_BUDGETS) || [],
          savingsGoals: await storage.load(STORAGE_KEYS.FINANCE_GOALS) || [],
          currency: await storage.load(STORAGE_KEYS.FINANCE_CURRENCY)
        };
        snapshot.meals = {
          recipes: await storage.load(STORAGE_KEYS.MEAL_RECIPES) || [],
          foods: await storage.load(STORAGE_KEYS.MEAL_FOODS) || [],
          mealPlans: await storage.load(STORAGE_KEYS.MEAL_PLANS) || [],
          shoppingList: await storage.load(STORAGE_KEYS.MEAL_SHOPPING) || []
        };
        snapshot.sleepLogs = await storage.load(STORAGE_KEYS.SLEEP_LOGS);
        snapshot.sleepSettings = await storage.load(STORAGE_KEYS.SLEEP_SETTINGS);
        snapshot.prayers = await storage.load(STORAGE_KEYS.DEEN_PRAYERS);
        snapshot.quran = await storage.load(STORAGE_KEYS.DEEN_QURAN);
        snapshot.adhkar = await storage.load(STORAGE_KEYS.DEEN_ADHKAR);
        snapshot.islamicSettings = await storage.load(STORAGE_KEYS.DEEN_SETTINGS);
        snapshot.customThemes = await storage.load(STORAGE_KEYS.CUSTOM_THEMES);

        await BackupService.saveAutoSnapshot(snapshot);
        await storage.save(LAST_BACKUP_KEY, now.toISOString());
      }
    };

    const timer = setTimeout(runSafetySnapshot, 5000);
    return () => clearTimeout(timer);
  }, [loading, settings]);

  const updateSettings = (updates: any) => {
    setSettings(prev => {
      const newSettings = mergeDeep(prev, updates);
      storage.save(STORAGE_KEYS.SETTINGS, newSettings);
      return newSettings;
    });
  };

  const setGoogleConnected = (connected: boolean) => {
    setGoogleConnectedState(connected);
    storage.save(GOOGLE_CONNECTED_KEY, connected);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    storage.save(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings, 
      isGoogleConnected, 
      setGoogleConnected 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};