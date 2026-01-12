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
  const lastUploadedTsRef = useRef<number>(0);

  const isLocalReady = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

  const getCurrentSnapshot = useCallback((timestamp?: string): BackupData => {
    const state = BackupService.createBackupData(habits, tasks, settings, timestamp);
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

  const isLocalEmpty = useMemo(() => {
    if (!isLocalReady) return false;
    return BackupService.isDataEmpty(getCurrentSnapshot());
  }, [isLocalReady, getCurrentSnapshot]);

  useEffect(() => {
    const unsubscribe = FirebaseService.init((currentUser) => {
      setUser(currentUser);
      setGoogleConnected(!!currentUser);
      if (currentUser) {
        setSyncStatus('connecting');
      } else {
        setSyncStatus('idle');
        lastUploadedTsRef.current = 0;
      }
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  // Robust Handshake Logic for Multi-Device Alignment
  useEffect(() => {
    if (!user || !isLocalReady || syncStatus === 'ready') return;

    console.log("Sync Handshake: Establishing secure cloud connection...");
    setSyncStatus('handshake');

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      if (isIncomingSync.current) return;

      const lastKnownCloudTs = Number(localStorage.getItem(LAST_CLOUD_TS_KEY)) || 0;

      // CASE 1: Cloud is empty (brand new account)
      if (!cloudData || !cloudData.exportDate) {
        console.log("Handshake: Cloud repository empty. Initializing master copy...");
        if (!isLocalEmpty) {
          const snapshot = getCurrentSnapshot();
          await FirebaseService.saveUserData(snapshot);
          const localTs = new Date(snapshot.exportDate).getTime();
          localStorage.setItem(LAST_CLOUD_TS_KEY, localTs.toString());
          lastUploadedTsRef.current = localTs;
        }
        setSyncStatus('ready');
        return;
      }

      const cloudTs = new Date(cloudData.exportDate).getTime();

      // CASE 2: Cloud Data Conflict Resolution
      // We pull if:
      // 1. Local is truly empty (e.g. new device sign-in)
      // 2. Cloud timestamp is newer than our last record of cloud sync
      const shouldRestore = isLocalEmpty || cloudTs > lastKnownCloudTs;

      if (shouldRestore) {
        console.log(`Handshake: Cloud state is newer (${new Date(cloudTs).toLocaleString()}). Restoring architecture...`);
        isIncomingSync.current = true;
        setIsSyncing(true);
        
        try {
          const success = await BackupService.performReplace(cloudData);
          if (success) {
            localStorage.setItem(LAST_CLOUD_TS_KEY, cloudTs.toString());
            lastUploadedTsRef.current = cloudTs;
            setLastSyncedAt(new Date());
            showToast('Cloud Architecture Restored', 'success');
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
        console.log("Handshake: System aligned. Local is current.");
        lastUploadedTsRef.current = lastKnownCloudTs;
        setSyncStatus('ready');
      }
    });

    return () => unsubscribe();
  }, [user, isLocalReady, isLocalEmpty, syncStatus, getCurrentSnapshot, showToast]);

  // Automatic Background Mirroring (Push logic)
  useEffect(() => {
    // Only mirror if handshake is complete and data isn't empty
    if (!user || !isLocalReady || isSyncing || isIncomingSync.current || syncStatus !== 'ready') return;
    
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      const now = new Date().toISOString();
      const snapshot = getCurrentSnapshot(now);
      const currentLocalTs = new Date(now).getTime();
      
      // Safety: Never push if local is empty but we have a record of cloud data
      const lastKnownCloudTs = Number(localStorage.getItem(LAST_CLOUD_TS_KEY)) || 0;
      if (isLocalEmpty && lastKnownCloudTs > 0) {
        console.warn("Sync: Blocked push of empty local state over existing cloud data.");
        return;
      }

      // Check if data actually changed since last upload
      if (currentLocalTs <= lastUploadedTsRef.current) return;

      try {
        setIsSyncing(true);
        await FirebaseService.saveUserData(snapshot);
        localStorage.setItem(LAST_CLOUD_TS_KEY, currentLocalTs.toString());
        lastUploadedTsRef.current = currentLocalTs;
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error("Background Mirroring Failed:", e);
      } finally {
        setIsSyncing(false);
      }
    }, 15000); // 15s debounce for stable mirroring

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, isLocalReady, isSyncing, syncStatus, getCurrentSnapshot, isLocalEmpty]);

  const syncNow = async () => {
    if (!user) {
        showToast("Authorization required", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const now = new Date().toISOString();
        const data = getCurrentSnapshot(now);
        await FirebaseService.saveUserData(data);
        const ts = new Date(now).getTime();
        localStorage.setItem(LAST_CLOUD_TS_KEY, ts.toString());
        lastUploadedTsRef.current = ts;
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
