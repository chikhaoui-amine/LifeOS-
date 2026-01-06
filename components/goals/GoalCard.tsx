
import React from 'react';
import { Target, Calendar, ChevronRight, Zap, CheckCircle2, Clock } from 'lucide-react';
import { Goal } from '../../types';
import { getRelativeTime } from '../../utils/dateUtils';
import { useGoals } from '../../context/GoalContext';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

const COLOR_ACCENTS: Record<string, string> = {
  indigo: 'bg-indigo-500',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const { updateProgress } = useGoals();
  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const isCompleted = goal.status === 'completed';
  const targetDate = new Date(goal.targetDate);
  const isOverdue = targetDate < new Date() && !isCompleted;
  const isUrgent = !isCompleted && !isOverdue && (targetDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000;
  
  const accentColor = COLOR_ACCENTS[goal.color] || COLOR_ACCENTS.indigo;

  const handleQuickStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goal.type === 'numeric') {
      const step = goal.targetValue / 10;
      updateProgress(goal.id, goal.currentValue + step);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group relative bg-surface border border-foreground/10 rounded-[2rem] p-7 transition-all duration-500 hover:border-primary-500/30 hover:shadow-xl hover:shadow-black/5 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      {/* Top Status Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${accentColor} opacity-20 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isOverdue ? 'text-rose-500' : 'text-muted'}`}>
              {isOverdue ? 'Overdue' : goal.category}
            </span>
            <h3 className={`text-xl font-black tracking-tight leading-tight transition-colors ${isCompleted ? 'text-muted line-through' : 'text-foreground group-hover:text-primary-600'}`}>
              {goal.title}
            </h3>
          </div>
          <div className="p-2 rounded-full bg-foreground/5 text-muted group-hover:bg-primary-600 group-hover:text-white transition-all">
            <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.03] rounded-full text-[9px] font-bold uppercase text-muted tracking-widest border border-foreground/5">
            <Calendar size={12} />
            <span>{isCompleted ? 'Archived' : getRelativeTime(goal.targetDate)}</span>
          </div>
          {isUrgent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest">
              <Clock size={12} />
              <span>Priority</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="pt-4 flex-1 flex flex-col justify-end space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter tabular-nums">{progress}%</span>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Mastery</span>
            </div>
            
            {!isCompleted && goal.type === 'numeric' && (
              <button 
                onClick={handleQuickStep}
                className="w-10 h-10 rounded-2xl bg-foreground/5 text-muted hover:bg-primary-600 hover:text-white flex items-center justify-center transition-all active:scale-90"
                title="Quick 10% Step"
              >
                <Zap size={16} fill="currentColor" />
              </button>
            )}
          </div>

          <div className="h-2 w-full bg-foreground/[0.05] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : accentColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="absolute top-6 left-6 pointer-events-none">
          <div className="bg-emerald-500 text-white p-1 rounded-lg shadow-lg rotate-[-12deg]">
            <CheckCircle2 size={16} strokeWidth={3} />
          </div>
        </div>
      )}
    </div>
  );
};
