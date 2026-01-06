
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
  
  // Data Contexts - Gather EVERYTHING from EVERY module
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
  
  // Guard to prevent infinite loop: Remote Update -> Local Storage -> Sync Context -> Remote Update
  const isRestoringRef = useRef(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = FirebaseService.init((currentUser) => {
      setUser(currentUser);
      setGoogleConnected(!!currentUser);
    });
    return () => unsubscribe();
  }, [setGoogleConnected]);

  // Handle Cloud Subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirebaseService.subscribeToUserData(async (cloudData) => {
      // If we are currently uploading, don't immediately overwrite local changes
      if (isSyncing) return;

      isRestoringRef.current = true;
      setIsSyncing(true);

      try {
        await BackupService.performReplace(cloudData);
        setLastSyncedAt(new Date());
        // Note: The UI might need to reload or contexts might need re-loading if they don't watch storage
        showToast('System synced with Cloud', 'info');
      } catch (e) {
        console.error("Sync Overwrite Error:", e);
      } finally {
        setIsSyncing(false);
        // Delay resetting ref to avoid catching the immediate local write events
        setTimeout(() => { isRestoringRef.current = false; }, 5000);
      }
    });

    return () => unsubscribe();
  }, [user, showToast, isSyncing]);

  /**
   * The Master Function: Compiles the entire app state into one object.
   */
  const getCurrentState = useCallback((): BackupData => {
    const state = BackupService.createBackupData(habits, tasks, settings);
    
    // Core Extended
    state.habitCategories = habitCategories;
    state.journal = journal;
    state.goals = goals;
    state.visionBoard = visionBoard;
    state.reports = reports;
    state.timeBlocks = timeBlocks;

    // Finance Module
    state.finance = { accounts, transactions, budgets, savingsGoals, currency };

    // Meals Module
    state.meals = { recipes, foods, mealPlans, shoppingList };

    // Recovery Module
    state.sleepLogs = sleepLogs;
    state.sleepSettings = sleepSettings;

    // Islamic Module
    state.prayers = prayers;
    state.quran = quran;
    state.adhkar = adhkar;
    state.islamicSettings = islamicSettings;

    // Themes
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

  // Auto-Save Trigger
  useEffect(() => {
    if (!user) return;
    if (isRestoringRef.current) return; 

    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(async () => {
      // Re-check guard inside timeout
      if (isRestoringRef.current) return;

      setIsSyncing(true);
      try {
        const data = getCurrentState();
        await FirebaseService.saveUserData(data);
        setLastSyncedAt(new Date());
        console.log("LifeOS: Cloud auto-sync success.");
      } catch (e) {
        console.error("LifeOS: Auto-sync failed.", e);
      } finally {
        setIsSyncing(false);
      }
    }, 10000); // 10s debounce for heavy data

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [user, getCurrentState]);

  const syncNow = async () => {
    if (!user) {
        showToast("Please connect to Google first", "error");
        return;
    }
    setIsSyncing(true);
    try {
        const data = getCurrentState();
        await FirebaseService.saveUserData(data);
        setLastSyncedAt(new Date());
        showToast('Manual Sync Successful', 'success');
    } catch(e) {
        showToast('Manual Sync Failed', 'error');
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
