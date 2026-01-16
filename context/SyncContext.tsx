
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

type SyncStatus = 'idle' | 'connecting' | 'handshake' | 'stable' | 'syncing' | 'error';

interface SyncContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  user: User | null;
  syncStatus: SyncStatus;
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

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isIncomingSync = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLocalReady = !habitsLoading && !tasksLoading && !journalLoading && !goalsLoading && !financeLoading && !mealsLoading && !sleepLoading && !timeLoading && !deenLoading && !visionLoading && !reportsLoading;

  const getCurrentSnapshot = useCallback((timestamp?: string): BackupData => {
    return {
      ...BackupService.createBackupData(habits, tasks, settings, timestamp),
      habitCategories, journal, goals, visionBoard, reports, timeBlocks,
      finance: { accounts, transactions, budgets, savingsGoals, currency },
      meals: { recipes, foods, mealPlans, shoppingList },
      sleepLogs, sleepSettings, prayers, quran, adhkar, islamicSettings,
      customThemes: savedThemes,
      wellnessApps: blockedApps,
      wellnessSettings: dwSettings,
      wellnessStats: dwStats
    } as any;
  }, [
    habits, habitCategories, tasks, settings, journal, goals, visionBoard, reports,
    accounts, transactions, budgets, savingsGoals, currency,
    recipes, foods, mealPlans, shoppingList, sleepLogs, sleepSettings,
    timeBlocks, prayers, quran, adhkar, islamicSettings, savedThemes,
    blockedApps, dwSettings, dwStats
  ]);

  const isLocalEmpty = useMemo(() => {
    if (!isLocalReady) return false;
    const snap = getCurrentSnapshot();
    return BackupService.isDataEmpty(snap);
  }, [isLocalReady, getCurrentSnapshot]);

  // Handle Handshake (Initial Load Logic)
  const performHandshake = useCallback(async () => {
    if (!user || !isLocalReady) return;
    
    setSyncStatus('handshake');
    console.group("LifeOS Sync: Handshake Started");
    
    try {
      const cloudData = await FirebaseService.fetchCloudData();
      
      if (!cloudData) {
        console.log("Handshake: Cloud is empty.");
        if (!isLocalEmpty) {
          console.log("Handshake: Local has data. Seeding cloud...");
          await FirebaseService.saveUserData(getCurrentSnapshot());
          setLastSyncedAt(new Date());
        }
      } else {
        console.log("Handshake: Cloud found. Comparing versions...");
        const cloudDate = new Date(cloudData.exportDate).getTime();
        const localDate = Number(localStorage.getItem('lifeos_last_sync_local_ts')) || 0;

        if (isLocalEmpty || cloudDate > localDate) {
          console.log("Handshake: Cloud is newer or local is empty. Pulling...");
          isIncomingSync.current = true;
          await BackupService.performReplace(cloudData);
          localStorage.setItem('lifeos_last_sync_local_ts', cloudDate.toString());
          setLastSyncedAt(new Date());
          showToast('Cloud Data Restored', 'success');
          setTimeout(() => { isIncomingSync.current = false; }, 2000);
        } else {
          console.log("Handshake: Local is current or ahead. Keeping local.");
        }
      }
      setSyncStatus('stable');
    } catch (e) {
      console.error("Handshake Failed:", e);
      setSyncStatus('error');
    } finally {
      console.groupEnd();
    }
  }, [user, isLocalReady, isLocalEmpty, getCurrentSnapshot, showToast]);

  // Sync Subscriptions
  useEffect(() => {
    const unsub = FirebaseService.init((u) => {
      setUser(u);
      setGoogleConnected(!!u);
      if (u) performHandshake();
      else setSyncStatus('idle');
    });
    return () => unsub();
  }, [performHandshake, setGoogleConnected]);

  // Auto-Mirroring (Push on change)
  useEffect(() => {
    if (!user || !isLocalReady || syncStatus !== 'stable' || isIncomingSync.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const snap = getCurrentSnapshot();
        await FirebaseService.saveUserData(snap);
        localStorage.setItem('lifeos_last_sync_local_ts', new Date(snap.exportDate).getTime().toString());
        setLastSyncedAt(new Date());
        setSyncStatus('stable');
      } catch (e) {
        setSyncStatus('error');
      }
    }, 10000); // 10s debounce to batch rapid changes

    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [getCurrentSnapshot, isLocalReady, syncStatus, user]);

  const syncNow = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await performHandshake();
      showToast('Manual Sync Complete', 'success');
    } catch (e) {
      setSyncStatus('error');
      showToast('Sync Failed', 'error');
    }
  };

  return (
    <SyncContext.Provider value={{ 
      isSyncing: syncStatus === 'syncing', 
      lastSyncedAt, 
      user, 
      syncStatus, 
      syncNow 
    }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
};
