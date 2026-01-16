
import React from 'react';
import { Check, Edit2, Trash2, Flame } from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const COLOR_MAP: Record<string, { base: string, light: string, text: string, border: string }> = {
  indigo: { base: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/50' },
  blue: { base: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/50' },
  sky: { base: 'bg-sky-500', light: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/50' },
  cyan: { base: 'bg-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-900/50' },
  teal: { base: 'bg-teal-500', light: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/50' },
  green: { base: 'bg-green-500', light: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900/50' },
  emerald: { base: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/50' },
  lime: { base: 'bg-lime-500', light: 'bg-lime-50 dark:bg-lime-950/30', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-100 dark:border-lime-900/50' },
  yellow: { base: 'bg-yellow-500', light: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-900/50' },
  amber: { base: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/50' },
  orange: { base: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/50' },
  red: { base: 'bg-red-500', light: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-900/50' },
  rose: { base: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/50' },
  pink: { base: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-100 dark:border-pink-900/50' },
  fuchsia: { base: 'bg-fuchsia-500', light: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-100 dark:border-fuchsia-900/50' },
  purple: { base: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/50' },
  violet: { base: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-900/50' },
};

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  onToggle, 
  onEdit, 
  onDelete,
}) => {
  const streak = calculateStreak(habit.completedDates);
  const theme = COLOR_MAP[habit.color] || COLOR_MAP.indigo;

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        dateKey: key,
        isDone: habit.completedDates.includes(key),
    };
  });

  return (
    <div 
      className={`
        group relative overflow-hidden flex flex-col p-4 sm:p-5 rounded-[2rem] transition-all duration-500 border-2
        ${isCompleted 
          ? `${theme.light} border-transparent shadow-none opacity-80 scale-[0.99]` 
          : `bg-surface ${theme.border} shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1`
        }
      `}
    >
      {/* Ambient background accent */}
      {!isCompleted && (
        <div className={`absolute -top-12 -right-12 w-32 h-32 ${theme.base} opacity-[0.03] blur-3xl pointer-events-none group-hover:opacity-[0.08] transition-opacity`} />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`
              shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-500
              ${isCompleted 
                ? `${theme.base} text-white shadow-lg shadow-${habit.color}-500/30 rotate-[360deg]` 
                : `bg-foreground/[0.03] dark:bg-foreground/[0.05] border-2 ${theme.border} ${theme.text} hover:scale-105`
              }
            `}
          >
            {isCompleted ? <Check size={24} strokeWidth={4} className="animate-in zoom-in duration-300" /> : <span>{habit.icon}</span>}
          </button>
          
          <div className="min-w-0">
            <h3 className={`font-black text-base sm:text-lg tracking-tight truncate transition-all duration-500 ${isCompleted ? 'text-foreground/40 line-through' : 'text-foreground'}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${streak > 0 ? 'bg-orange-500/10 text-orange-600' : 'bg-foreground/[0.03] text-muted'} text-[9px] font-black uppercase tracking-widest`}>
                  <Flame size={10} fill={streak > 0 ? "currentColor" : "none"} />
                  <span>{streak} DAY STREAK</span>
               </div>
               <span className="text-[9px] font-black text-muted/40 uppercase tracking-widest">{habit.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={onEdit} className="p-2 text-muted hover:text-foreground transition-colors"><Edit2 size={14} /></button>
           <button onClick={onDelete} className="p-2 text-muted hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Mini Progress Visualization */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-foreground/[0.03]">
         <div className="flex gap-1.5 items-center">
            {weekDates.map((day) => (
               <div 
                 key={day.dateKey} 
                 className={`w-1.5 h-6 rounded-full transition-all duration-700 ${day.isDone ? `${theme.base} opacity-100 scale-y-110` : 'bg-foreground/[0.05] dark:bg-foreground/[0.1] scale-y-75 opacity-50'}`} 
                 title={day.dateKey}
               />
            ))}
         </div>
         
         <div className="text-right">
            <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-emerald-500' : 'text-muted/60'}`}>
               {isCompleted ? 'Secured' : 'Daily Flow'}
            </p>
            <p className={`text-xs font-black tracking-tighter ${theme.text}`}>
               {habit.frequency.type === 'daily' ? '7/7' : habit.frequency.days.length + '/7'}
            </p>
         </div>
      </div>
    </div>
  );
};
