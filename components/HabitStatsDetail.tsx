import React from 'react';
import { X, Trophy, Flame, Calendar, Target } from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak, formatDateKey, getTodayKey } from '../utils/dateUtils';
import { HabitGrid } from './HabitGrid';

interface HabitStatsDetailProps {
  habit: Habit;
  onClose: () => void;
}

export const HabitStatsDetail: React.FC<HabitStatsDetailProps> = ({ habit, onClose }) => {
  const streak = calculateStreak(habit.completedDates);
  
  // Calculate Best Streak (Simple greedy approximation for MVP)
  const calculateBestStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort();
    let maxStreak = 1;
    let current = 1;
    
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i-1]);
        const curr = new Date(sorted[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        
        if (diff === 1) {
            current++;
        } else if (diff > 1) {
            maxStreak = Math.max(maxStreak, current);
            current = 1;
        }
    }
    return Math.max(maxStreak, current);
  };

  const bestStreak = calculateBestStreak(habit.completedDates);
  const totalCompletions = habit.completedDates.length;
  
  // Last 30 days success rate
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
  });
  
  // Count how many of last 30 days were scheduled days
  const scheduledDaysInLast30 = last30Days.filter(d => 
      habit.frequency.days.includes(d.getDay()) && 
      new Date(habit.createdAt) <= d
  ).length;

  const completedInLast30 = habit.completedDates.filter(d => {
      const date = new Date(d);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
  }).length;

  const successRate = scheduledDaysInLast30 > 0 
      ? Math.round((completedInLast30 / scheduledDaysInLast30) * 100) 
      : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <span className="text-3xl">{habit.icon}</span>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{habit.name}</h2>
                    <p className="text-sm text-gray-500">{habit.category} • {habit.frequency.type}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 space-y-8">
            
            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
                    <Flame className="text-orange-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Current Streak</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-800">
                    <Trophy className="text-yellow-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestStreak}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Best Streak</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <Target className="text-blue-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{successRate}%</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Success Rate (30d)</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
                    <Calendar className="text-green-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompletions}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Completions</p>
                </div>
            </div>

            {/* History Heatmap */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white">Completion History</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-center">
                    <HabitGrid completedDates={habit.completedDates} color={habit.color} size="md" daysToShow={140} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 px-2">
                    <span>5 months ago</span>
                    <span>Today</span>
                </div>
            </div>

            {/* Monthly Breakdown (Simple Bar visual) */}
            <div className="space-y-3">
                 <h3 className="font-bold text-gray-900 dark:text-white">Monthly Performance</h3>
                 <div className="space-y-2">
                    {Array.from({length: 6}).map((_, i) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - i);
                        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        const monthName = d.toLocaleDateString('en-US', { month: 'long' });
                        
                        const count = habit.completedDates.filter(date => date.startsWith(monthKey)).length;
                        
                        return (
                            <div key={i} className="flex items-center gap-4 text-sm">
                                <span className="w-24 text-gray-500 dark:text-gray-400">{monthName}</span>
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${habit.color}-500`} style={{ width: `${Math.min(100, count * 3)}%` }} />
                                </div>
                                <span className="w-8 text-right font-medium text-gray-700 dark:text-gray-300">{count}</span>
                            </div>
                        )
                    })}
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};