
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Subtask, TaskSection, TaskTimeframe } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface TaskContextType {
  tasks: Task[];
  sections: TaskSection[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSection: (title: string, timeframe: TaskTimeframe) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  updateSection: (id: string, updates: Partial<TaskSection>) => Promise<void>;
  getTaskStats: () => { totalPending: number; completedToday: number; highPriorityPending: number };
  clearCompletedTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sections, setSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const taskData = await storage.load<Task[]>(STORAGE_KEYS.TASKS);
    const sectionData = await storage.load<TaskSection[]>(STORAGE_KEYS.TASK_SECTIONS);
    if (taskData) setTasks(taskData);
    if (sectionData) setSections(sectionData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const persistTasks = async (updated: Task[]) => {
    setTasks(updated);
    await storage.save(STORAGE_KEYS.TASKS, updated);
  };

  const persistSections = async (updated: TaskSection[]) => {
    setSections(updated);
    await storage.save(STORAGE_KEYS.TASK_SECTIONS, updated);
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
    await persistTasks([newTask, ...tasks]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await persistTasks(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    await persistTasks(updated);
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
    await persistTasks(updated);
  };

  const addSubtask = async (taskId: string, title: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newSubtask: Subtask = { id: Date.now().toString(), title, completed: false };
        return { ...t, subtasks: [...t.subtasks, newSubtask] };
      }
      return t;
    });
    await persistTasks(updated);
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
    await persistTasks(updated);
  };

  const addSection = async (title: string, timeframe: TaskTimeframe) => {
    const newSection: TaskSection = {
      id: Date.now().toString(36),
      title,
      timeframe,
      createdAt: new Date().toISOString()
    };
    await persistSections([...sections, newSection]);
  };

  const deleteSection = async (id: string) => {
    // Unset sectionId for tasks in this section
    const updatedTasks = tasks.map(t => t.sectionId === id ? { ...t, sectionId: undefined } : t);
    await persistTasks(updatedTasks);
    await persistSections(sections.filter(s => s.id !== id));
  };

  const updateSection = async (id: string, updates: Partial<TaskSection>) => {
    await persistSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const clearCompletedTasks = async () => {
    await persistTasks(tasks.filter(t => !t.completed));
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
    <TaskContext.Provider value={{ 
      tasks, sections, loading, addTask, updateTask, deleteTask, toggleTask, 
      addSubtask, toggleSubtask, addSection, deleteSection, updateSection, 
      getTaskStats, clearCompletedTasks 
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
