import React from 'react';
import { Check, Edit2, Trash2, Clock, ListTodo, Tag, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { triggerConfetti } from '../utils/confetti';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSubtask?: (subId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete, onToggleSubtask }) => {
  const todayKey = getTodayKey();
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayKey;
  
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const priorityStyles = {
    high: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      accent: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      indicator: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
    },
    medium: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      accent: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      indicator: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
    },
    low: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      accent: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      indicator: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
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
      className={`
        group relative flex flex-col p-5 rounded-[2rem] transition-all duration-500 border backdrop-blur-xl
        ${task.completed 
          ? 'bg-foreground/5 opacity-60 border-transparent grayscale' 
          : `${style.bg} ${style.border} shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-0.5`
        }
      `}
    >
      {/* Side Accent Line */}
      {!task.completed && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all duration-500 group-hover:h-16 ${style.indicator}`} />
      )}

      <div className="flex items-start gap-4 relative z-10">
        {/* Checkbox Trigger - Resized to be smaller */}
        <button 
          onClick={handleMainToggle}
          className={`
            shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-700 border-2
            ${task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white rotate-[360deg] shadow-lg shadow-emerald-500/30' 
              : 'bg-white dark:bg-gray-800 border-foreground/10 text-transparent hover:border-emerald-400/50 hover:scale-110 active:scale-90'
            }
          `}
        >
          <Check size={18} strokeWidth={4} className={`transform transition-all duration-500 ${task.completed ? 'scale-100' : 'scale-50 opacity-0 group-hover:opacity-40 group-hover:text-emerald-500'}`} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                 {/* Category Badge */}
                 <span className={`text-[8px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-lg border ${task.completed ? 'bg-foreground/5 text-muted border-transparent' : 'bg-white/80 dark:bg-black/20 border-foreground/5 text-muted'}`}>
                    {task.category || 'Focus'}
                 </span>
                 
                 {task.dueTime && (
                    <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-foreground/5 text-muted">
                       <Clock size={10} strokeWidth={3} /> {task.dueTime}
                    </span>
                 )}
                 
                 {isOverdue && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20">
                       <AlertCircle size={10} /> MISSING
                    </span>
                 )}
              </div>
              
              <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-none transition-all duration-500 ${task.completed ? 'text-muted line-through opacity-50' : 'text-foreground group-hover:text-primary-600'}`}>
                {task.title}
              </h3>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
               <button 
                 onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                 className="p-2 text-muted hover:text-primary-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-foreground/5"
               >
                 <Edit2 size={16} strokeWidth={2.5} />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                 className="p-2 text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-500/20"
               >
                 <Trash2 size={16} strokeWidth={2.5} />
               </button>
            </div>
          </div>

          {/* Progress / Subtasks Bar */}
          {totalSubtasks > 0 && !task.completed && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-muted uppercase tracking-[0.2em]">
                   <ListTodo size={12} strokeWidth={3} />
                   <span>Milestones</span>
                </div>
                <span className="text-[9px] font-black text-muted tabular-nums uppercase tracking-widest">{completedSubtasks} / {totalSubtasks}</span>
              </div>
              <div className="h-1.5 w-full bg-foreground/[0.03] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${style.accent}`} 
                    style={{ width: `${progress}%` }} 
                  />
              </div>
            </div>
          )}
          
          {/* Tags */}
          {task.tags?.length > 0 && !task.completed && (
             <div className="flex flex-wrap gap-2 pt-1">
                {task.tags.slice(0, 3).map(tag => (
                   <span key={tag} className="flex items-center gap-1 text-[8px] font-black text-primary-500/60 uppercase tracking-widest">
                      <Tag size={8} /> {tag}
                   </span>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};