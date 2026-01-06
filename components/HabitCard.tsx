import React from 'react';
import { Check, Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { Habit } from '../types';
import { getTodayKey, calculateStreak } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  onToggle, 
  onEdit, 
  onDelete,
  onArchive
}) => {
  const streak = calculateStreak(habit.completedDates);
  const todayKey = getTodayKey();

  const weekDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        dateKey: key,
        isDone: habit.completedDates.includes(key),
        isToday: key === todayKey
    };
  });

  const getHabitColorClass = (color: string) => {
      switch(color) {
          case 'red': return 'bg-red-500';
          case 'orange': return 'bg-orange-500';
          case 'amber': return 'bg-amber-500';
          case 'yellow': return 'bg-yellow-500';
          case 'lime': return 'bg-lime-500';
          case 'green': return 'bg-green-500';
          case 'emerald': return 'bg-emerald-500';
          case 'teal': return 'bg-teal-500';
          case 'cyan': return 'bg-cyan-500';
          case 'sky': return 'bg-sky-500';
          case 'blue': return 'bg-blue-500';
          case 'indigo': return 'bg-indigo-500';
          case 'violet': return 'bg-violet-500';
          case 'purple': return 'bg-purple-500';
          case 'fuchsia': return 'bg-fuchsia-500';
          case 'pink': return 'bg-pink-500';
          case 'rose': return 'bg-rose-500';
          default: return 'bg-primary-500';
      }
  };

  const dotColorClass = getHabitColorClass(habit.color);

  return (
    <div className={`group relative bg-surface rounded-2xl p-3 sm:p-4 border transition-all active:scale-[0.98] ${isCompleted ? 'border-green-200 dark:border-green-900/30' : 'border-foreground/5 shadow-sm'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-foreground/5 text-gray-400 hover:bg-foreground/10'}`}
          >
            {isCompleted ? <Check size={20} sm-size={24} strokeWidth={4} /> : <span>{habit.icon}</span>}
          </button>
          
          <div className="min-w-0">
            <h3 className={`font-bold text-sm sm:text-base text-foreground truncate ${isCompleted ? 'line-through opacity-40' : ''}`}>{habit.name}</h3>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted font-black uppercase tracking-widest mt-0.5">
               <span className="text-orange-500 flex items-center gap-0.5">🔥 {streak}</span>
               <span>•</span>
               <span>{habit.frequency.type}</span>
            </div>
          </div>
        </div>

        <div className="hidden xs:flex gap-1 items-center shrink-0 ml-2">
          {weekDates.map((day) => (
             <div 
               key={day.dateKey} 
               className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-500 ${day.isDone ? `${dotColorClass} scale-110 shadow-sm` : day.isToday ? 'bg-gray-300 dark:bg-gray-600 animate-pulse' : 'bg-foreground/10'}`} 
               title={day.dateKey}
             />
          ))}
       </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-surface/90 backdrop-blur-sm rounded-lg p-1 border border-foreground/5 shadow-xl">
        <button onClick={onEdit} className="p-1.5 hover:bg-foreground/5 rounded-md text-muted"><Edit2 size={12} /></button>
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
      </div>
    </div>
  );
};