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
  const lastCloudTsRef = useRef<number>(0);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Critical check: Is local data fully initialized from disk?
  const isLocalReady = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

  useEffect(() => {
    const unsubscribe = FirebaseService.init((currentUser) => {
      setUser(currentUser);
      setGoogleConnected(!!currentUser);
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  const getCurrentSnapshot = useCallback((): BackupData => {
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

  // Handle Incoming Cloud Data
  useEffect(() => {
    if (!user || !isLocalReady) return;

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      if (!cloudData || !cloudData.exportDate) return;
      
      const cloudTs = new Date(cloudData.exportDate).getTime();
      const currentLocal = getCurrentSnapshot();
      const localTs = new Date(currentLocal.exportDate).getTime();

      // Only apply if cloud is newer than what we currently have in memory AND newer than last known cloud sync
      if (cloudTs <= lastCloudTsRef.current || cloudTs <= localTs) {
          lastCloudTsRef.current = Math.max(lastCloudTsRef.current, cloudTs);
          return;
      }

      console.log(`LifeOS: Remote is newer (${cloudData.exportDate}). Syncing...`);
      isIncomingSync.current = true;
      setIsSyncing(true);
      
      try {
        await BackupService.performReplace(cloudData);
        lastCloudTsRef.current = cloudTs;
        setLastSyncedAt(new Date());
        showToast('System Synced', 'info');
      } catch (e) {
        console.error("Sync Download Error:", e);
      } finally {
        setIsSyncing(false);
        // Delay resetting flag to allow state updates to settle without triggering re-upload
        setTimeout(() => { isIncomingSync.current = false; }, 2500);
      }
    });

    return () => unsubscribe();
  }, [user, isLocalReady, getCurrentSnapshot, showToast]);

  // Automatic Outbound Cloud Sync
  useEffect(() => {
    if (!user || !isLocalReady || isSyncing || isIncomingSync.current) return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const data = getCurrentSnapshot();
      const currentTs = new Date(data.exportDate).getTime();
      
      // Only upload if local is actually newer than our last known sync point
      if (currentTs <= lastCloudTsRef.current) return;

      try {
        await FirebaseService.saveUserData(data);
        lastCloudTsRef.current = currentTs;
        setLastSyncedAt(new Date());
        console.log("LifeOS: Cloud updated with local changes.");
      } catch (e) {
        console.error("Auto-Sync Upload Error:", e);
      }
    }, 20000); // 20s debounce

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, isLocalReady, isSyncing, getCurrentSnapshot]);

  const syncNow = async () => {
    if (!user) {
        showToast("Google connection required", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const data = getCurrentSnapshot();
        await FirebaseService.saveUserData(data);
        lastCloudTsRef.current = new Date(data.exportDate).getTime();
        setLastSyncedAt(new Date());
        showToast('Cloud Sync Successful', 'success');
    } catch(e) {
        showToast('Sync Communication Error', 'error');
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