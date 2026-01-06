import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Subtask } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { storage } from '../utils/storage';

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

const TASKS_STORAGE_KEY = 'lifeos_tasks_v2';

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Tasks
  useEffect(() => {
    const loadData = async () => {
      const data = await storage.load<Task[]>(TASKS_STORAGE_KEY);
      if (data) {
        setTasks(data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (!loading) {
      storage.save(TASKS_STORAGE_KEY, tasks);
    }
  }, [tasks, loading]);

  const addTask = async (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      subtasks: [],
      completed: false,
      createdAt: new Date().toISOString(),
      tags: data.tags || [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = async (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = !t.completed;
        return { 
          ...t, 
          completed: newStatus,
          completedAt: newStatus ? new Date().toISOString() : undefined 
        };
      }
      return t;
    }));
  };

  const addSubtask = async (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtask: Subtask = {
          id: Date.now().toString(),
          title,
          completed: false
        };
        return { ...t, subtasks: [...t.subtasks, newSubtask] };
      }
      return t;
    }));
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    }));
  };

  const clearCompletedTasks = async () => {
    setTasks(prev => prev.filter(t => !t.completed));
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
      tasks, 
      loading, 
      addTask, 
      updateTask, 
      deleteTask, 
      toggleTask, 
      addSubtask, 
      toggleSubtask,
      getTaskStats,
      clearCompletedTasks
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