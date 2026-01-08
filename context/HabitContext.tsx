import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Habit } from '../types';
import { getTodayKey, calculateStreak } from '../utils/dateUtils';
import { storage } from '../utils/storage';
import { NotificationService } from '../services/NotificationService';
import { useSettings } from './SettingsContext';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  categories: string[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived' | 'progress'>) => Promise<string>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date?: string) => Promise<void>;
  incrementHabit: (id: string, amount: number, date?: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  getHabitStats: () => { total: number; completedToday: number; completionRate: number };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ['Health', 'Morning', 'Evening', 'Productivity', 'Mindfulness', 'Fitness', 'Learning', 'Finance', 'Home'];

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const loadData = useCallback(async () => {
    const habitsData = await storage.load<Habit[]>(STORAGE_KEYS.HABITS);
    if (habitsData) setHabits(habitsData);
    const catsData = await storage.load<string[]>(STORAGE_KEYS.HABIT_CATEGORIES);
    if (catsData && Array.isArray(catsData)) setCategories(catsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const persist = async (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    await storage.save(STORAGE_KEYS.HABITS, updatedHabits);
  };

  const addHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived' | 'progress'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newHabit: Habit = { ...data, id, completedDates: [], progress: {}, archived: false, createdAt: new Date().toISOString() };
    await persist([...habits, newHabit]);
    return id;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    await persist(updated);
  };

  const deleteHabit = async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    await persist(updated);
  };

  const archiveHabit = async (id: string) => {
    const updated = habits.map(h => h.id === id ? { ...h, archived: true } : h);
    await persist(updated);
  };

  const toggleHabit = async (id: string, date: string = getTodayKey()) => {
    const updated = habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(date);
        let newDates = isCompleted ? habit.completedDates.filter(d => d !== date) : [...habit.completedDates, date];
        let newProgress = { ...habit.progress, [date]: isCompleted ? 0 : (habit.goal || 1) };
        if (!isCompleted && settings.notifications.enabled) {
            const streak = calculateStreak(newDates);
            if ([3, 7, 30].includes(streak)) NotificationService.sendAchievement(`${streak}-Day Streak!`, `Consistency king!`);
        }
        return { ...habit, completedDates: newDates, progress: newProgress, archived: habit.frequency.type === 'once' && !isCompleted ? true : habit.archived };
      }
      return habit;
    });
    await persist(updated);
  };

  const incrementHabit = async (id: string, amount: number, date: string = getTodayKey()) => {
    const updated = habits.map(habit => {
      if (habit.id === id) {
        const currentVal = habit.progress?.[date] || 0;
        const newVal = Math.max(0, currentVal + amount);
        const metGoal = newVal >= habit.goal;
        const alreadyMarked = habit.completedDates.includes(date);
        let newDates = [...habit.completedDates];
        if (metGoal && !alreadyMarked) newDates.push(date);
        else if (!metGoal && alreadyMarked) newDates = newDates.filter(d => d !== date);
        return { ...habit, progress: { ...habit.progress, [date]: newVal }, completedDates: newDates, archived: habit.frequency.type === 'once' && metGoal ? true : habit.archived };
      }
      return habit;
    });
    await persist(updated);
  };

  const addCategory = async (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      await storage.save(STORAGE_KEYS.HABIT_CATEGORIES, updated);
    }
  };

  const deleteCategory = async (category: string) => {
    const updated = categories.filter(c => c !== category);
    setCategories(updated);
    await storage.save(STORAGE_KEYS.HABIT_CATEGORIES, updated);
  };

  const getHabitStats = () => {
    const todayKey = getTodayKey();
    const todayIndex = new Date().getDay();
    const active = habits.filter(h => !h.archived && h.frequency.days.includes(todayIndex));
    if (active.length === 0) return { total: 0, completedToday: 0, completionRate: 0 };
    const completed = active.filter(h => h.completedDates.includes(todayKey)).length;
    return { total: active.length, completedToday: completed, completionRate: Math.round((completed / active.length) * 100) };
  };

  return (
    <HabitContext.Provider value={{ habits, loading, categories, addHabit, updateHabit, deleteHabit, toggleHabit, incrementHabit, archiveHabit, addCategory, deleteCategory, getHabitStats }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};