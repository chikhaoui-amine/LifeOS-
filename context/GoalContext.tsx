import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal, GoalMilestone, GoalNote } from '../types';
import { storage } from '../utils/storage';
import { triggerConfetti } from '../utils/confetti';

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

const GOALS_STORAGE_KEY = 'lifeos_goals_v1';

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Goals
  useEffect(() => {
    const loadData = async () => {
      const data = await storage.load<Goal[]>(GOALS_STORAGE_KEY);
      if (data) {
        // Migration support for notes if needed
        const processed = data.map(g => ({ ...g, notes: g.notes || [] }));
        setGoals(processed);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (!loading) {
      storage.save(GOALS_STORAGE_KEY, goals);
    }
  }, [goals, loading]);

  const addGoal = async (data: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      notes: [], // Initialize notes
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
        if (g.id !== id) return g;
        
        const updatedGoal = { ...g, ...updates };
        
        // Auto-complete check
        if (updatedGoal.type === 'numeric' && updatedGoal.currentValue >= updatedGoal.targetValue && g.status !== 'completed') {
            updatedGoal.status = 'completed';
            updatedGoal.completedAt = new Date().toISOString();
            triggerConfetti();
        }
        
        return updatedGoal;
    }));
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateProgress = async (id: string, value: number) => {
    setGoals(prev => prev.map(g => {
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

        return { 
            ...g, 
            currentValue: newValue,
            status: newStatus,
            completedAt
        };
    }));
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
        if (g.id !== goalId) return g;

        const newMilestones = g.milestones.map(m => 
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );

        // Auto progress for milestone type goals
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
    }));
  };

  const addNote = async (goalId: string, content: string) => {
    const note: GoalNote = {
      id: Date.now().toString(),
      content,
      date: new Date().toISOString(),
    };
    
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, notes: [note, ...g.notes] } : g
    ));
  };

  const deleteNote = async (goalId: string, noteId: string) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, notes: g.notes.filter(n => n.id !== noteId) } : g
    ));
  };

  return (
    <GoalContext.Provider value={{ 
      goals, 
      loading, 
      addGoal, 
      updateGoal, 
      deleteGoal, 
      updateProgress,
      toggleMilestone,
      addNote,
      deleteNote
    }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) throw new Error('useGoals must be used within a GoalProvider');
  return context;
};