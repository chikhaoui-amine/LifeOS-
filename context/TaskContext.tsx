import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Subtask } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  getTaskStats: () => { totalPending: number; completedToday: number; highPriorityPending: number };
  clearCompletedTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await storage.load<Task[]>(STORAGE_KEYS.TASKS);
    if (data) setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const persist = async (updated: Task[]) => {
    setTasks(updated);
    await storage.save(STORAGE_KEYS.TASKS, updated);
  };

  const addTask = async (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      subtasks: [],
      completed: false,
      createdAt: new Date().toISOString(),
      tags: data.tags || [],
    };
    await persist([newTask, ...tasks]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await persist(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    await persist(updated);
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const newStatus = !t.completed;
        return { 
          ...t, 
          completed: newStatus,
          completedAt: newStatus ? new Date().toISOString() : undefined 
        };
      }
      return t;
    });
    await persist(updated);
  };

  const addSubtask = async (taskId: string, title: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newSubtask: Subtask = { id: Date.now().toString(), title, completed: false };
        return { ...t, subtasks: [...t.subtasks, newSubtask] };
      }
      return t;
    });
    await persist(updated);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return t;
    });
    await persist(updated);
  };

  const clearCompletedTasks = async () => {
    await persist(tasks.filter(t => !t.completed));
  };

  const getTaskStats = () => {
    const todayKey = getTodayKey();
    const pending = tasks.filter(t => !t.completed);
    return {
      totalPending: pending.length,
      completedToday: tasks.filter(t => t.completed && t.dueDate === todayKey).length,
      highPriorityPending: pending.filter(t => t.priority === 'high').length
    };
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleTask, addSubtask, toggleSubtask, getTaskStats, clearCompletedTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};