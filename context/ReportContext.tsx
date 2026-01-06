
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LifeOSReport, ReportPeriod, ReportContent } from '../types';
import { storage } from '../utils/storage';
import { GoogleGenAI, Type } from "@google/genai";

interface ReportContextType {
  reports: LifeOSReport[];
  loading: boolean;
  isGenerating: boolean;
  generationStep: string;
  addReport: (report: LifeOSReport) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  generateReport: (period: ReportPeriod) => Promise<LifeOSReport | null>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const REPORTS_STORAGE_KEY = 'lifeos_reports_v2';

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<LifeOSReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  useEffect(() => {
    const loadData = async () => {
      let data = await storage.load<LifeOSReport[]>(REPORTS_STORAGE_KEY);
      if (data) {
        setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync to storage whenever reports change
  useEffect(() => {
    if (!loading) {
      storage.save(REPORTS_STORAGE_KEY, reports);
    }
  }, [reports, loading]);

  const addReport = async (report: LifeOSReport) => {
    setReports(prev => [report, ...prev]);
  };

  const deleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const cleanJsonString = (str: string) => {
    if (!str) return '{}';
    let clean = str.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }
    return clean;
  };

  const generateReport = async (period: ReportPeriod): Promise<LifeOSReport | null> => {
    setIsGenerating(true);
    setGenerationStep('Gathering System Logs...');
    
    try {
      const today = new Date();
      let startDate = new Date();
      let prevStartDate = new Date();
      let periodLength = 1;

      if (period === 'daily') {
        periodLength = 1;
        prevStartDate.setDate(today.getDate() - 1);
      } else if (period === 'weekly') {
        periodLength = 7;
        startDate.setDate(today.getDate() - 6);
        prevStartDate.setDate(startDate.getDate() - 7);
      } else if (period === 'monthly') {
        periodLength = 30; 
        startDate.setDate(1);
        prevStartDate.setMonth(startDate.getMonth() - 1);
        prevStartDate.setDate(1);
      }

      const currentRange = { start: startDate.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      const prevRange = { start: prevStartDate.toISOString().split('T')[0], end: startDate.toISOString().split('T')[0] };

      const loadRangeStats = async (start: string, end: string) => {
        const inRange = (d: string) => d >= start && d <= end;
        
        const habits = await storage.load<any[]>('lifeos_habits_v2') || [];
        const tasks = await storage.load<any[]>('lifeos_tasks_v2') || [];
        const sleep = await storage.load<any[]>('lifeos_sleep_logs_v1') || [];
        const transactions = await storage.load<any[]>('lifeos_finance_transactions_v1') || [];
        const prayers = await storage.load<any[]>('lifeos_islamic_data_v2') || [];

        const rangeTasks = tasks.filter(t => (t.completedAt && inRange(t.completedAt.split('T')[0])) || (t.dueDate && inRange(t.dueDate)));
        const tasksDone = rangeTasks.filter(t => t.completed).length;
        const taskRate = rangeTasks.length > 0 ? (tasksDone / rangeTasks.length) * 100 : 0;

        let habitHits = 0;
        let habitPossible = 0;
        habits.forEach(h => {
          if (h.archived) return;
          const hits = h.completedDates.filter((d: string) => inRange(d)).length;
          habitHits += hits;
          habitPossible += h.frequency.type === 'daily' ? periodLength : 1;
        });
        const habitRate = habitPossible > 0 ? (habitHits / habitPossible) * 100 : 0;

        const rangeSleep = sleep.filter(l => inRange(l.date));
        const sleepAvg = rangeSleep.length > 0 ? rangeSleep.reduce((acc, l) => acc + l.durationMinutes, 0) / rangeSleep.length / 60 : 0;

        const expense = transactions.filter(t => t.type === 'expense' && inRange(t.date)).reduce((acc, t) => acc + t.amount, 0);
        let deenScore = 0;
        if (prayers.length > 0) {
           const rangePrayers = prayers.filter(p => inRange(p.date));
           let totalPrayers = 0;
           rangePrayers.forEach(p => { if(p.fajr) totalPrayers++; if(p.dhuhr) totalPrayers++; if(p.asr) totalPrayers++; if(p.maghrib) totalPrayers++; if(p.isha) totalPrayers++; });
           deenScore = Math.min(100, (totalPrayers / (rangePrayers.length * 5 || 1)) * 100);
        }

        return { tasksDone, taskRate, habitRate, sleepAvg, expense, deenScore };
      };

      const currentStats = await loadRangeStats(currentRange.start, currentRange.end);
      const prevStats = await loadRangeStats(prevRange.start, prevRange.end);

      setGenerationStep('Calculating Growth Benchmarks...');
      
      const calcScore = (stats: any) => Math.round((stats.taskRate * 0.35) + (stats.habitRate * 0.35) + (Math.min(stats.sleepAvg / 8, 1.2) * 15) + (stats.deenScore * 0.15));
      const finalScore = calcScore(currentStats);
      const prevScore = calcScore(prevStats);

      const getTrend = (curr: number, prev: number) => {
        if (prev === 0) return 0;
        return Math.round(curr - prev);
      };

      const trends = {
        score: getTrend(finalScore, prevScore),
        tasks: getTrend(currentStats.taskRate, prevStats.taskRate),
        habits: getTrend(currentStats.habitRate, prevStats.habitRate),
        sleep: getTrend(currentStats.sleepAvg, prevStats.sleepAvg)
      };

      setGenerationStep('Consulting AI Strategist...');
      let aiContent: Partial<ReportContent> = {
        title: `${period.toUpperCase()} Intelligence Update`,
        summary: `Performance finalized with a Life Score of ${finalScore}. Consistency in habits noted at ${Math.round(currentStats.habitRate)}%.`,
        completedItems: [`Verified ${currentStats.tasksDone} task completions.`],
        missedItems: [`Analysis shows ${Math.round(100 - currentStats.habitRate)}% habit variance.`],
        insights: ["Maintaining current momentum is key for project completion.", "Sleep cycles show stabilization patterns."],
        solutions: ["Batch low-energy tasks for evening hours.", "Initiate wind-down routine 15 mins earlier."],
      };

      try {
        // Fix: Initialization strictly follows @google/genai guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze user ${period} performance. Context: Mastery Score ${finalScore}, Tasks Done ${currentStats.tasksDone}, Habit Consistency ${currentStats.habitRate}%, Avg Sleep ${currentStats.sleepAvg.toFixed(1)}h. Performance Trends: Score ${trends.score > 0 ? '+' : ''}${trends.score}, Tasks ${trends.tasks > 0 ? '+' : ''}${trends.tasks}%. Format: JSON.`,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are the LifeOS Chief Optimization Officer. Generate highly professional, insightful, and actionable JSON reports. Format: {title, summary, completedItems:[], missedItems:[], insights:[], solutions:[]}"
          }
        });

        const timeout = new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), 12000));
        const res = (await Promise.race([model, timeout])) as any;
        // Fix: Use property .text directly as per guidelines
        const json = JSON.parse(cleanJsonString(res.text));
        if (json) aiContent = { ...aiContent, ...json };
      } catch (aiErr) {
        console.warn("Using baseline statistical analysis due to AI latency.");
      }

      const newReport: LifeOSReport = {
        id: Date.now().toString(),
        period,
        dateRange: period === 'daily' ? currentRange.end : `${currentRange.start} to ${currentRange.end}`,
        createdAt: new Date().toISOString(),
        content: {
          ...aiContent as any,
          score: finalScore,
          metrics: {
            sleepAvg: currentStats.sleepAvg,
            expenseTotal: currentStats.expense,
            tasksDone: currentStats.tasksDone,
            habitsRate: currentStats.habitRate,
            deenScore: currentStats.deenScore
          },
          trends
        }
      };

      await addReport(newReport);
      return newReport;

    } catch (e) {
      console.error("Intelligence failure:", e);
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <ReportContext.Provider value={{ reports, loading, isGenerating, generationStep, addReport, deleteReport, generateReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (context === undefined) throw new Error('useReports must be used within a ReportProvider');
  return context;
};
