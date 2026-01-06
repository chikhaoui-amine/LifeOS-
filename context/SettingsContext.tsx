
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, LanguageCode } from '../types';
import { storage } from '../utils/storage';
import { BackupService } from '../services/BackupService';
import { isRTL } from '../utils/translations';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings> | any) => void;
  resetSettings: () => void;
  isGoogleConnected: boolean;
  setGoogleConnected: (connected: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'lifeos_settings_v1';
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
    autoBackup: false,
    enableIslamicFeatures: true,
    // Fix: Added missing reportDay property (0 for Sunday)
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

  // Helper for deep merging to ensure nested defaults are preserved
  const mergeDeep = (target: any, source: any) => {
    if (!source) return target;
    const result = { ...target, ...source };
    if (target.notifications && source.notifications) {
      result.notifications = { ...target.notifications, ...source.notifications };
    }
    if (target.preferences && source.preferences) {
      result.preferences = { ...target.preferences, ...source.preferences };
    }
    if (target.meals && source.meals) {
      result.meals = { ...target.meals, ...source.meals };
    }
    // Explicitly handle arrays like disabledModules
    if (source.disabledModules) {
      result.disabledModules = source.disabledModules;
    }
    return result;
  };

  // Load Settings
  useEffect(() => {
    const loadSettings = async () => {
      const data = await storage.load<any>(SETTINGS_KEY);
      if (data) {
        setSettings(prev => mergeDeep(prev, data));
      }
      
      const googleLinked = await storage.load<boolean>(GOOGLE_CONNECTED_KEY);
      setGoogleConnectedState(!!googleLinked);
    };
    loadSettings();
  }, []);

  // Update HTML Direction and Language defensively
  useEffect(() => {
    const lang = settings?.preferences?.language || 'en';
    document.documentElement.dir = isRTL(lang as LanguageCode) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [settings?.preferences?.language]);

  // Check Auto Backup Logic - Updated to capture ALL data
  useEffect(() => {
    const checkAutoBackup = async () => {
      if (!settings?.preferences?.autoBackup) return;

      const lastBackupStr = await storage.load<string>(LAST_BACKUP_KEY);
      const now = new Date();
      const lastBackup = lastBackupStr ? new Date(lastBackupStr) : new Date(0);
      
      const oneDay = 24 * 60 * 60 * 1000;
      if (now.getTime() - lastBackup.getTime() > oneDay) {
        console.log("Running comprehensive auto-backup...");
        
        // 1. Core
        const habits = await storage.load<any>('lifeos_habits_v2') || [];
        const habitCategories = await storage.load<any>('lifeos_habit_categories_v1');
        const tasks = await storage.load<any>('lifeos_tasks_v2') || [];
        
        // 2. Extended
        const goals = await storage.load<any>('lifeos_goals_v1');
        const journal = await storage.load<any>('lifeos_journal_v1');
        const timeBlocks = await storage.load<any>('lifeos_time_blocks_v1');
        
        // 3. Finance
        const accounts = await storage.load<any>('lifeos_finance_accounts_v1') || [];
        const transactions = await storage.load<any>('lifeos_finance_transactions_v1') || [];
        const budgets = await storage.load<any>('lifeos_finance_budgets_v1') || [];
        const savingsGoals = await storage.load<any>('lifeos_finance_goals_v1') || [];
        const currency = await storage.load<any>('lifeos_finance_currency_v1');
        
        // 4. Meals
        const recipes = await storage.load<any>('lifeos_recipes_v1') || [];
        const foods = await storage.load<any>('lifeos_foods_v1') || [];
        const mealPlans = await storage.load<any>('lifeos_meal_plans_v1') || [];
        const shoppingList = await storage.load<any>('lifeos_shopping_list_v1') || [];
        
        // 5. Sleep & Wellness
        const sleepLogs = await storage.load<any>('lifeos_sleep_logs_v1');
        const sleepSettings = await storage.load<any>('lifeos_sleep_settings_v1');
        
        // 6. Islamic
        const prayers = await storage.load<any>('lifeos_islamic_data_v2');
        const quran = await storage.load<any>('lifeos_quran_v2');
        const adhkar = await storage.load<any>('lifeos_adhkar_v1');
        const islamicSettings = await storage.load<any>('lifeos_islamic_settings_v1');
        
        // 7. Themes
        const customThemes = await storage.load<any>('lifeos_custom_themes');

        // Create Full Snapshot
        const snapshot = BackupService.createBackupData(habits, tasks, settings);
        
        // Attach everything
        snapshot.habitCategories = habitCategories;
        snapshot.goals = goals;
        snapshot.journal = journal;
        snapshot.timeBlocks = timeBlocks;
        snapshot.finance = { accounts, transactions, budgets, savingsGoals, currency };
        snapshot.meals = { recipes, foods, mealPlans, shoppingList };
        snapshot.sleepLogs = sleepLogs;
        snapshot.sleepSettings = sleepSettings;
        snapshot.prayers = prayers;
        snapshot.quran = quran;
        snapshot.adhkar = adhkar;
        snapshot.islamicSettings = islamicSettings;
        snapshot.customThemes = customThemes;

        await BackupService.saveAutoSnapshot(snapshot);
        await storage.save(LAST_BACKUP_KEY, now.toISOString());
      }
    };

    const timer = setTimeout(checkAutoBackup, 5000); // Wait 5s after load
    return () => clearTimeout(timer);
  }, [settings?.preferences?.autoBackup]);

  const updateSettings = (updates: any) => {
    setSettings(prev => {
      const newSettings = mergeDeep(prev, updates);
      if (updates.morningTime) newSettings.notifications.morningTime = updates.morningTime;
      
      storage.save(SETTINGS_KEY, newSettings);
      return newSettings;
    });
  };

  const setGoogleConnected = (connected: boolean) => {
    setGoogleConnectedState(connected);
    storage.save(GOOGLE_CONNECTED_KEY, connected);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    storage.save(SETTINGS_KEY, DEFAULT_SETTINGS);
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
