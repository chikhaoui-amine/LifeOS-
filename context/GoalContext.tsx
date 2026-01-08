import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Goal, GoalMilestone, GoalNote } from '../types';
import { storage } from '../utils/storage';
import { triggerConfetti } from '../utils/confetti';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProgress: (id: string, value: number) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addNote: (goalId: string, content: string) => Promise<void>;
  deleteNote: (goalId: string, noteId: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await storage.load<Goal[]>(STORAGE_KEYS.GOALS);
    if (data) {
      const processed = data.map(g => ({ ...g, notes: g.notes || [] }));
      setGoals(processed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const persist = async (updated: Goal[]) => {
    setGoals(updated);
    await storage.save(STORAGE_KEYS.GOALS, updated);
  };

  const addGoal = async (data: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      notes: [],
    };
    await persist([newGoal, ...goals]);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => {
      if (g.id !== id) return g;
      const updatedGoal = { ...g, ...updates };
      if (updatedGoal.type === 'numeric' && updatedGoal.currentValue >= updatedGoal.targetValue && g.status !== 'completed') {
        updatedGoal.status = 'completed';
        updatedGoal.completedAt = new Date().toISOString();
        triggerConfetti();
      }
      return updatedGoal;
    });
    await persist(updated);
  };

  const deleteGoal = async (id: string) => {
    await persist(goals.filter(g => g.id !== id));
  };

  const updateProgress = async (id: string, value: number) => {
    const updated = goals.map(g => {
      if (g.id !== id) return g;
      const newValue = Math.min(g.targetValue, Math.max(0, value));
      let newStatus = g.status;
      let completedAt = g.completedAt;

      if (newValue >= g.targetValue) {
        newStatus = 'completed';
        completedAt = new Date().toISOString();
        if (g.status !== 'completed') triggerConfetti();
      } else if (newValue > 0 && g.status === 'not-started') {
        newStatus = 'in-progress';
      }

      return { ...g, currentValue: newValue, status: newStatus, completedAt };
    });
    await persist(updated);
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      const newMilestones = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
      let updates: Partial<Goal> = { milestones: newMilestones };
      if (g.type === 'milestone') {
        const completedCount = newMilestones.filter(m => m.completed).length;
        const progressPerMilestone = g.targetValue / g.milestones.length;
        updates.currentValue = completedCount * progressPerMilestone;
        if (completedCount === g.milestones.length) {
          updates.status = 'completed';
          updates.completedAt = new Date().toISOString();
          if (g.status !== 'completed') triggerConfetti();
        } else if (completedCount > 0 && g.status === 'not-started') {
          updates.status = 'in-progress';
        }
      }
      return { ...g, ...updates };
    });
    await persist(updated);
  };

  const addNote = async (goalId: string, content: string) => {
    const note: GoalNote = { id: Date.now().toString(), content, date: new Date().toISOString() };
    const updated = goals.map(g => g.id === goalId ? { ...g, notes: [note, ...g.notes] } : g);
    await persist(updated);
  };

  const deleteNote = async (goalId: string, noteId: string) => {
    const updated = goals.map(g => g.id === goalId ? { ...g, notes: g.notes.filter(n => n.id !== noteId) } : g);
    await persist(updated);
  };

  return (
    <GoalContext.Provider value={{ goals, loading, addGoal, updateGoal, deleteGoal, updateProgress, toggleMilestone, addNote, deleteNote }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) throw new Error('useGoals must be used within a GoalProvider');
  return context;
};