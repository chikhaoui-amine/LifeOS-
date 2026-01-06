import React from 'react';
import { Check, Edit2, Trash2, Clock, ListTodo } from 'lucide-react';
import { Task } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { triggerConfetti } from '../utils/confetti';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onToggleSubtask?: (subId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete, onClick, onToggleSubtask }) => {
  const todayKey = getTodayKey();
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayKey;
  
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const priorityStyles = {
    high: {
      bg: 'bg-red-50/40 dark:bg-red-950/10',
      border: 'border-red-100/30 dark:border-red-900/20',
      accent: 'bg-red-500',
    },
    medium: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/10',
      border: 'border-amber-100/30 dark:border-amber-900/20',
      accent: 'bg-amber-500',
    },
    low: {
      bg: 'bg-blue-50/40 dark:bg-blue-950/10',
      border: 'border-blue-100/30 dark:border-blue-900/20',
      accent: 'bg-blue-500',
    }
  };

  const style = priorityStyles[task.priority];

  const handleMainToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      triggerConfetti();
      if (navigator.vibrate) navigator.vibrate([15, 5, 15]);
    }
    onToggle();
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex flex-col gap-3 p-3.5 sm:p-4 rounded-[1.5rem] transition-all duration-300 cursor-pointer border backdrop-blur-md active:scale-[0.98]
        ${task.completed 
          ? 'bg-slate-50/40 dark:bg-slate-900/20 opacity-50 grayscale border-transparent' 
          : `${style.bg} ${style.border} shadow-sm`
        }
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4 relative z-10">
        <button 
          onClick={handleMainToggle}
          className={`
            shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-500
            ${task.completed 
              ? 'bg-emerald-500 text-white rotate-[360deg] shadow-lg shadow-emerald-500/20' 
              : `bg-surface border-2 border-foreground/10 text-transparent active:border-emerald-400`
            }
          `}
        >
          <Check size={20} strokeWidth={4} className={`transform transition-all duration-500 ${task.completed ? 'scale-100' : 'scale-50 opacity-0 group-hover:opacity-40'}`} />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                 {task.dueTime && (
                    <span className="flex items-center gap-1 text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded bg-foreground/5 text-muted border border-foreground/5">
                       <Clock size={8} /> {task.dueTime}
                    </span>
                 )}
                 {isOverdue && (
                    <span className="text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded bg-red-500 text-white animate-pulse">
                       Overdue
                    </span>
                 )}
              </div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight leading-tight transition-all duration-500 ${task.completed ? 'text-muted line-through' : 'text-foreground'}`}>
                {task.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-muted hover:text-primary-600"><Edit2 size={14} /></button>
            </div>
          </div>

          {totalSubtasks > 0 && !task.completed && (
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 h-1 bg-foreground/5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ease-out ${style.accent}`} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[8px] font-black text-muted tabular-nums uppercase tracking-widest">{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};