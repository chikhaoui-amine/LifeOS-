import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
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
import { storage } from '../utils/storage';

type SyncStatus = 'idle' | 'connecting' | 'handshake' | 'ready' | 'error';

interface SyncContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  user: User | null;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>; 
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const LAST_CLOUD_TS_KEY = 'lifeos_last_cloud_sync_ts';

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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isIncomingSync = useRef(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLocalReady = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

  // Determine if this device is truly "empty" (newly reinstalled or cleared)
  const isLocalEmpty = useMemo(() => {
    if (!isLocalReady) return false;
    return habits.length === 0 && tasks.length === 0 && journal.length === 0 && goals.length === 0 && visionBoard.length === 0 && accounts.length <= 1;
  }, [isLocalReady, habits.length, tasks.length, journal.length, goals.length, visionBoard.length, accounts.length]);

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
      if (currentUser) {
        setSyncStatus('connecting');
      } else {
        setSyncStatus('idle');
      }
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  // Strategic Handshake Logic
  useEffect(() => {
    if (!user || !isLocalReady || syncStatus === 'ready') return;

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      // Prevent recursive sync loops
      if (isIncomingSync.current) return;

      const currentLocal = getCurrentSnapshot();
      const localTs = new Date(currentLocal.exportDate).getTime();
      const lastKnownCloudTs = Number(localStorage.getItem(LAST_CLOUD_TS_KEY)) || 0;

      // CASE 1: Cloud is empty (brand new account)
      if (!cloudData || !cloudData.exportDate) {
        console.log("Handshake: Cloud empty. Initializing master upload...");
        if (!isLocalEmpty) {
          await FirebaseService.saveUserData(currentLocal);
          localStorage.setItem(LAST_CLOUD_TS_KEY, localTs.toString());
        }
        setSyncStatus('ready');
        return;
      }

      const cloudTs = new Date(cloudData.exportDate).getTime();

      // CASE 2: Restore required (Local is empty OR Cloud is significantly newer)
      const shouldRestore = isLocalEmpty || cloudTs > lastKnownCloudTs;

      if (shouldRestore) {
        console.log(`Handshake: Restoring from Cloud (Ver: ${cloudData.exportDate})`);
        isIncomingSync.current = true;
        setIsSyncing(true);
        setSyncStatus('handshake');
        
        try {
          const success = await BackupService.performReplace(cloudData);
          if (success) {
            localStorage.setItem(LAST_CLOUD_TS_KEY, cloudTs.toString());
            setLastSyncedAt(new Date());
            showToast('Cloud Data Restored', 'success');
          }
        } catch (e) {
          console.error("Restoration Failed:", e);
          setSyncStatus('error');
        } finally {
          setIsSyncing(false);
          setSyncStatus('ready');
          setTimeout(() => { isIncomingSync.current = false; }, 3000);
        }
      } else {
        // CASE 3: Local data is already synced or newer
        console.log("Handshake: System aligned.");
        setSyncStatus('ready');
      }
    });

    return () => unsubscribe();
  }, [user, isLocalReady, isLocalEmpty, syncStatus, getCurrentSnapshot, showToast]);

  // Auto-Mirror logic (Local -> Cloud)
  useEffect(() => {
    // CRITICAL: Never upload if we aren't in 'ready' status (prevents overwriting cloud with empty local state)
    if (!user || !isLocalReady || isSyncing || isIncomingSync.current || syncStatus !== 'ready') return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const data = getCurrentSnapshot();
      const currentTs = new Date(data.exportDate).getTime();
      const lastKnownCloudTs = Number(localStorage.getItem(LAST_CLOUD_TS_KEY)) || 0;
      
      // Only upload if something actually changed since our last sync
      if (currentTs <= lastKnownCloudTs) return;

      try {
        setIsSyncing(true);
        await FirebaseService.saveUserData(data);
        localStorage.setItem(LAST_CLOUD_TS_KEY, currentTs.toString());
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error("Background Upload Failed:", e);
      } finally {
        setIsSyncing(false);
      }
    }, 15000); 

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, isLocalReady, isSyncing, syncStatus, getCurrentSnapshot]);

  const syncNow = async () => {
    if (!user) {
        showToast("Authorization required", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const data = getCurrentSnapshot();
        await FirebaseService.saveUserData(data);
        localStorage.setItem(LAST_CLOUD_TS_KEY, new Date(data.exportDate).getTime().toString());
        setLastSyncedAt(new Date());
        showToast('System Mirrored', 'success');
    } catch(e) {
        showToast('Sync Failure', 'error');
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <SyncContext.Provider value={{ isSyncing, lastSyncedAt, user, syncStatus, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) throw new Error('useSync must be used within a SyncProvider');
  return context;
};