
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit } from '../types';
import { getTodayKey, calculateStreak } from '../utils/dateUtils';
import { storage } from '../utils/storage';
import { NotificationService } from '../services/NotificationService';
import { useSettings } from './SettingsContext';

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

const HABITS_STORAGE_KEY = 'lifeos_habits_v2';
const CATEGORIES_STORAGE_KEY = 'lifeos_habit_categories_v1';

const DEFAULT_CATEGORIES = ['Health', 'Morning', 'Evening', 'Productivity', 'Mindfulness', 'Fitness', 'Learning', 'Finance', 'Home'];

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  
  const { settings } = useSettings();

  useEffect(() => {
    const loadData = async () => {
      const habitsData = await storage.load<Habit[]>(HABITS_STORAGE_KEY);
      if (habitsData) setHabits(habitsData);

      const categoriesData = await storage.load<string[]>(CATEGORIES_STORAGE_KEY);
      if (categoriesData !== null) {
        if (Array.isArray(categoriesData)) {
            setCategories(categoriesData.length > 0 ? categoriesData : DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      storage.save(HABITS_STORAGE_KEY, habits);
    }
  }, [habits, loading]);

  useEffect(() => {
    if (!loading) {
      storage.save(CATEGORIES_STORAGE_KEY, categories);
    }
  }, [categories, loading]);

  const addHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived' | 'progress'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newHabit: Habit = {
      ...data,
      id,
      completedDates: [],
      progress: {},
      archived: false,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return id;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const archiveHabit = async (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h));
  };

  const toggleHabit = async (id: string, date: string = getTodayKey()) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(date);
        
        let newDates;
        let newProgress = { ...habit.progress };
        
        if (isCompleted) {
          newDates = habit.completedDates.filter(d => d !== date);
          newProgress[date] = 0;
        } else {
          newDates = [...habit.completedDates, date];
          newProgress[date] = habit.goal || 1;
          
          if (settings.notifications.enabled) {
            const newStreak = calculateStreak(newDates);
            const milestones = [3, 7, 30, 100, 365];
            if (milestones.includes(newStreak)) {
              NotificationService.sendAchievement(
                `${newStreak}-Day Streak!`,
                `Incredible! You've maintained your ${habit.name} streak for ${newStreak} days. Keep it up!`
              );
            }
          }
        }

        return {
          ...habit,
          completedDates: newDates,
          progress: newProgress,
          archived: habit.frequency.type === 'once' && !isCompleted ? true : habit.archived
        };
      }
      return habit;
    }));
  };

  const incrementHabit = async (id: string, amount: number, date: string = getTodayKey()) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const currentVal = habit.progress?.[date] || 0;
        const newVal = Math.max(0, currentVal + amount);
        const newProgress = { ...habit.progress, [date]: newVal };
        
        let newDates = [...habit.completedDates];
        const metGoal = newVal >= habit.goal;
        const alreadyMarked = newDates.includes(date);

        if (metGoal && !alreadyMarked) {
          newDates.push(date);
        } else if (!metGoal && alreadyMarked) {
          newDates = newDates.filter(d => d !== date);
        }

        return {
          ...habit,
          progress: newProgress,
          completedDates: newDates,
          archived: habit.frequency.type === 'once' && metGoal ? true : habit.archived
        };
      }
      return habit;
    }));
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed) {
      setCategories(prev => {
        if (!prev.includes(trimmed)) {
           return [...prev, trimmed];
        }
        return prev;
      });
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const getHabitStats = () => {
    const todayKey = getTodayKey();
    const todayIndex = new Date().getDay();
    const activeHabits = habits.filter(h => !h.archived && h.frequency.days.includes(todayIndex));
    if (activeHabits.length === 0) return { total: 0, completedToday: 0, completionRate: 0 };
    const completedToday = activeHabits.filter(h => h.completedDates.includes(todayKey)).length;
    return {
      total: activeHabits.length,
      completedToday,
      completionRate: Math.round((completedToday / activeHabits.length) * 100)
    };
  };

  return (
    <HabitContext.Provider value={{ 
      habits, 
      loading, 
      categories,
      addHabit, 
      updateHabit, 
      deleteHabit, 
      toggleHabit, 
      incrementHabit,
      archiveHabit, 
      addCategory, 
      deleteCategory,
      getHabitStats 
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
