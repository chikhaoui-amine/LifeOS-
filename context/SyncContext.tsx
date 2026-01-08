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
import { useDigitalWellness } from './DigitalWellnessContext';
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
  const { blockedApps, settings: dwSettings, stats: dwStats } = useDigitalWellness();
  
  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isIncomingSync = useRef(false);
  const lastCloudTsRef = useRef<number>(0);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedSync = useRef(false);

  const isLocalReady = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

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
    (state as any).wellnessApps = blockedApps;
    (state as any).wellnessSettings = dwSettings;
    (state as any).wellnessStats = dwStats;
    return state;
  }, [
    habits, habitCategories, tasks, settings, journal, goals, visionBoard, reports,
    accounts, transactions, budgets, savingsGoals, currency,
    recipes, foods, mealPlans, shoppingList, sleepLogs, sleepSettings,
    timeBlocks, prayers, quran, adhkar, islamicSettings, savedThemes,
    blockedApps, dwSettings, dwStats
  ]);

  useEffect(() => {
    const unsubscribe = FirebaseService.init((currentUser) => {
      setUser(currentUser);
      setGoogleConnected(!!currentUser);
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  // Main Sync Logic
  useEffect(() => {
    if (!user || !isLocalReady) return;

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      const currentLocal = getCurrentSnapshot();
      const localTs = new Date(currentLocal.exportDate).getTime();

      // Handle empty cloud (New User or Reconnect)
      if (!cloudData || !cloudData.exportDate) {
        if (!hasInitializedSync.current && (habits.length > 0 || tasks.length > 0 || visionBoard.length > 0)) {
           console.log("Sync Handshake: Cloud is empty, uploading local master data...");
           await FirebaseService.saveUserData(currentLocal);
           setLastSyncedAt(new Date());
           hasInitializedSync.current = true;
        }
        return;
      }
      
      const cloudTs = new Date(cloudData.exportDate).getTime();

      // Logic: Only replace local if Cloud is strictly NEWER than local
      if (cloudTs <= localTs) {
          lastCloudTsRef.current = Math.max(lastCloudTsRef.current, cloudTs);
          hasInitializedSync.current = true;
          return;
      }

      console.log(`Cloud Sync: Incoming update detected (${cloudData.exportDate})`);
      isIncomingSync.current = true;
      setIsSyncing(true);
      
      try {
        await BackupService.performReplace(cloudData);
        lastCloudTsRef.current = cloudTs;
        setLastSyncedAt(new Date());
        showToast('Cloud Data Synchronized', 'info');
      } catch (e) {
        console.error("Mirror Sync Failure:", e);
      } finally {
        setIsSyncing(false);
        hasInitializedSync.current = true;
        setTimeout(() => { isIncomingSync.current = false; }, 3000);
      }
    });

    return () => unsubscribe();
  }, [user, isLocalReady, getCurrentSnapshot, showToast, habits.length, tasks.length, visionBoard.length]);

  // Auto-Upload Effect (Local Changes -> Cloud)
  useEffect(() => {
    if (!user || !isLocalReady || isSyncing || isIncomingSync.current || !hasInitializedSync.current) return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const data = getCurrentSnapshot();
      const currentTs = new Date(data.exportDate).getTime();
      
      // Don't upload if nothing has changed since the last known cloud state
      if (currentTs <= lastCloudTsRef.current) return;

      try {
        await FirebaseService.saveUserData(data);
        lastCloudTsRef.current = currentTs;
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error("Auto-Mirror Failure:", e);
      }
    }, 8000); 

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, isLocalReady, isSyncing, getCurrentSnapshot]);

  const syncNow = async () => {
    if (!user) {
        showToast("Authorization required", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const data = getCurrentSnapshot();
        await FirebaseService.saveUserData(data);
        lastCloudTsRef.current = new Date(data.exportDate).getTime();
        setLastSyncedAt(new Date());
        showToast('Manual Sync Success', 'success');
    } catch(e) {
        showToast('Sync Failure', 'error');
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