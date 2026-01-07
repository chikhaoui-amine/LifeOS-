import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { useHabits } from './HabitContext';
import { useTasks } from './TaskContext';
import { useJournal } from './JournalContext';
import { useGoals } from './GoalContext';
import { useFinance } from './FinanceContext';
import { useMeals } from './MealContext';
import { useSleep } from './SleepContext';
import { useTimeBlocks } from './TimeBlockContext';
import { useIslamic } from './IslamicContext';
import { useTheme } from './ThemeContext';
import { useVisionBoard } from './VisionBoardContext';
import { useReports } from './ReportContext';
import { FirebaseService, User } from '../services/FirebaseService';
import { BackupService } from '../services/BackupService';
import { useToast } from './ToastContext';
import { BackupData } from '../types';

interface SyncContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  user: User | null;
  syncNow: () => Promise<void>; 
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, setGoogleConnected } = useSettings();
  const { habits, categories: habitCategories } = useHabits();
  const { tasks } = useTasks();
  const { entries: journal } = useJournal();
  const { goals } = useGoals();
  const { accounts, transactions, budgets, savingsGoals, currency } = useFinance();
  const { recipes, foods, mealPlans, shoppingList } = useMeals();
  const { logs: sleepLogs, settings: sleepSettings } = useSleep();
  const { timeBlocks } = useTimeBlocks();
  const { prayers, quran, adhkar, settings: islamicSettings } = useIslamic();
  const { savedThemes } = useTheme();
  const { items: visionBoard } = useVisionBoard();
  const { reports } = useReports();
  
  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isInitialLoad = useRef(true);
  const lastCloudUpdateRef = useRef<number>(0);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = FirebaseService.init((currentUser) => {
      setUser(currentUser);
      setGoogleConnected(!!currentUser);
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  const getCurrentState = useCallback((): BackupData => {
    const state = BackupService.createBackupData(habits, tasks, settings);
    state.habitCategories = habitCategories;
    state.journal = journal;
    state.goals = goals;
    state.visionBoard = visionBoard;
    state.reports = reports;
    state.timeBlocks = timeBlocks;
    state.finance = { accounts, transactions, budgets, savingsGoals, currency };
    state.meals = { recipes, foods, mealPlans, shoppingList };
    state.sleepLogs = sleepLogs;
    state.sleepSettings = sleepSettings;
    state.prayers = prayers;
    state.quran = quran;
    state.adhkar = adhkar;
    state.islamicSettings = islamicSettings;
    state.customThemes = savedThemes;
    return state;
  }, [
    habits, habitCategories, tasks, settings, 
    journal, goals, visionBoard, reports,
    accounts, transactions, budgets, savingsGoals, currency,
    recipes, foods, mealPlans, shoppingList, 
    sleepLogs, sleepSettings,
    timeBlocks, 
    prayers, quran, adhkar, islamicSettings,
    savedThemes
  ]);

  // Handle Incoming Cloud Snapshots
  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      if (!cloudData?.exportDate) return;
      
      const cloudTs = new Date(cloudData.exportDate).getTime();
      if (cloudTs <= lastCloudUpdateRef.current) return;

      setIsSyncing(true);
      try {
        console.log("LifeOS: Merging remote changes...");
        await BackupService.performReplace(cloudData);
        lastCloudUpdateRef.current = cloudTs;
        setLastSyncedAt(new Date());
        
        // Prevent toast on first boot sync
        if (!isInitialLoad.current) {
          showToast('Data Synced from Cloud', 'info');
        }
      } catch (e) {
        console.error("Cloud Apply Error:", e);
      } finally {
        setIsSyncing(false);
        isInitialLoad.current = false;
      }
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Handle Automatic Cloud Uploads
  useEffect(() => {
    if (!user || isSyncing) return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const data = getCurrentState();
      const currentTs = new Date(data.exportDate).getTime();
      
      if (currentTs <= lastCloudUpdateRef.current) return;

      try {
        await FirebaseService.saveUserData(data);
        lastCloudUpdateRef.current = currentTs;
        setLastSyncedAt(new Date());
        console.log("LifeOS: Cloud auto-sync complete.");
      } catch (e) {
        console.error("Auto-Sync Upload Failed:", e);
      }
    }, 20000); // 20s debounce

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, getCurrentState, isSyncing]);

  const syncNow = async () => {
    if (!user) {
        showToast("Connect Google Account first", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const data = getCurrentState();
        await FirebaseService.saveUserData(data);
        lastCloudUpdateRef.current = new Date(data.exportDate).getTime();
        setLastSyncedAt(new Date());
        showToast('Sync Successful', 'success');
    } catch(e) {
        showToast('Sync Failed', 'error');
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <SyncContext.Provider value={{ isSyncing, lastSyncedAt, user, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) throw new Error('useSync must be used within a SyncProvider');
  return context;
};