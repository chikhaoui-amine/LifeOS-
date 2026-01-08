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
import { BackupService, STORAGE_KEYS } from '../services/BackupService';
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
  const { habits, categories: habitCategories, loading: habitsLoading } = useHabits();
  const { tasks, loading: tasksLoading } = useTasks();
  const { entries: journal, loading: journalLoading } = useJournal();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, transactions, budgets, savingsGoals, currency, loading: financeLoading } = useFinance();
  const { recipes, foods, mealPlans, shoppingList, loading: mealsLoading } = useMeals();
  const { logs: sleepLogs, settings: sleepSettings, loading: sleepLoading } = useSleep();
  const { timeBlocks, loading: timeLoading } = useTimeBlocks();
  const { prayers, quran, adhkar, settings: islamicSettings, loading: deenLoading } = useIslamic();
  const { savedThemes } = useTheme();
  const { items: visionBoard, loading: visionLoading } = useVisionBoard();
  const { reports, loading: reportsLoading } = useReports();
  
  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isIncomingSync = useRef(false);
  const lastCloudUpdateRef = useRef<number>(0);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAllLoaded = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

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
      
      // Determine local timestamp for comparison
      const localData = getCurrentState();
      const localTs = new Date(localData.exportDate).getTime();

      // Only apply if cloud is actually NEWER than what we have
      if (cloudTs <= lastCloudUpdateRef.current || cloudTs <= localTs) return;

      isIncomingSync.current = true;
      setIsSyncing(true);
      try {
        console.log("LifeOS: Cloud data is newer. Syncing down...");
        await BackupService.performReplace(cloudData);
        lastCloudUpdateRef.current = cloudTs;
        setLastSyncedAt(new Date());
        showToast('Data Synced from Cloud', 'info');
      } catch (e) {
        console.error("Cloud Apply Error:", e);
      } finally {
        setIsSyncing(false);
        setTimeout(() => { isIncomingSync.current = false; }, 2000);
      }
    });

    return () => unsubscribe();
  }, [user, showToast, getCurrentState]);

  // Handle Automatic Cloud Uploads
  useEffect(() => {
    if (!user || isSyncing || isIncomingSync.current || !isAllLoaded) return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const data = getCurrentState();
      const currentTs = new Date(data.exportDate).getTime();
      
      // Only upload if we have changed since the last known cloud state
      if (currentTs <= lastCloudUpdateRef.current) return;

      try {
        await FirebaseService.saveUserData(data);
        lastCloudUpdateRef.current = currentTs;
        setLastSyncedAt(new Date());
        console.log("LifeOS: Local changes pushed to cloud.");
      } catch (e) {
        console.error("Auto-Sync Upload Failed:", e);
      }
    }, 15000); // 15s debounce for efficiency

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, getCurrentState, isSyncing, isAllLoaded]);

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