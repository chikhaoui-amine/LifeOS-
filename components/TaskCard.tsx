import React, { useState } from 'react';
import { Check, Edit2, Trash2, Clock, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { triggerConfetti } from '../utils/confetti';
import { GoogleGenAI, Type } from "@google/genai";
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSubtask?: (subId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete, onToggleSubtask }) => {
  const { updateTask, toggleSubtask } = useTasks();
  const { showToast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);

  const todayKey = getTodayKey();
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayKey;
  
  const totalSubtasks = task.subtasks.length;

  const priorityColors = {
    high: 'border-rose-500/20 text-rose-500',
    medium: 'border-amber-500/20 text-amber-500',
    low: 'border-blue-500/20 text-blue-500'
  };

  const handleMainToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      triggerConfetti();
      if (navigator.vibrate) navigator.vibrate([15, 5, 15]);
    }
    onToggle();
  };

  const handleSubItemClick = (e: React.MouseEvent, subId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSubtask) {
      onToggleSubtask(subId);
    } else {
      toggleSubtask(task.id, subId);
    }
  };

  const handleEnhance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnhancing) return;
    
    setIsEnhancing(true);
    showToast("Architecting SMART task...", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite this task into a high-performance SMART task: "${task.title}". Current description: "${task.description || 'None'}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedSubtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "suggestedSubtasks"]
          },
          systemInstruction: "You are the LifeOS Performance Architect. Convert simple tasks into Specific, Measurable, Achievable, Relevant, and Time-bound objectives. Return JSON format."
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      const newSubtasks = data.suggestedSubtasks.map((s: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: s,
        completed: false
      }));

      await updateTask(task.id, {
        title: data.title,
        description: data.description,
        subtasks: [...task.subtasks, ...newSubtasks]
      });

      showToast("Strategy applied", "success");
    } catch (error) {
      console.error("Enhancement Error:", error);
      showToast("Strategic engine busy", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div 
      className={`
        group relative flex flex-col p-4 sm:p-5 rounded-[2rem] transition-all duration-300 border
        ${task.completed 
          ? 'bg-foreground/[0.01] opacity-60 border-transparent' 
          : 'bg-surface border-foreground/5 shadow-sm hover:shadow-lg'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Main Checkbox */}
        <button 
          onClick={handleMainToggle}
          className={`
            shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 border-2
            ${task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'bg-white dark:bg-gray-800 border-foreground/10 text-transparent hover:border-emerald-400'
            }
          `}
        >
          <Check size={18} strokeWidth={4} className={task.completed ? 'scale-100' : 'scale-0'} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                 <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-foreground/[0.03] text-muted`}>
                    {task.category || 'General'}
                 </span>
                 
                 {task.dueTime && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted/40">
                       <Clock size={8} strokeWidth={3} /> {task.dueTime}
                    </span>
                 )}
                 
                 {isOverdue && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-rose-500">
                       <AlertCircle size={8} /> MISSING
                    </span>
                 )}

                 {!task.completed && (
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${priorityColors[task.priority].split(' ')[1]} opacity-50`} />
                 )}
              </div>
              
              <h3 className={`text-base font-black tracking-tight leading-tight transition-all duration-300 ${task.completed ? 'text-muted line-through' : 'text-foreground'}`}>
                {task.title}
              </h3>
            </div>
            
            {/* Actions - Simplified */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
               {!task.completed && (
                 <button 
                   onClick={handleEnhance}
                   disabled={isEnhancing}
                   className="p-1 text-muted hover:text-amber-500 transition-colors"
                   title="AI SMART Enhance"
                 >
                   {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} strokeWidth={2.5} />}
                 </button>
               )}
               <button onClick={onEdit} className="p-1 text-muted hover:text-primary-600 transition-colors">
                 <Edit2 size={14} strokeWidth={2.5} />
               </button>
               <button onClick={onDelete} className="p-1 text-muted hover:text-rose-500 transition-colors">
                 <Trash2 size={14} strokeWidth={2.5} />
               </button>
            </div>
          </div>

          {/* Inline Subtasks - Visible List */}
          {totalSubtasks > 0 && (
            <div className="mt-3 space-y-1.5 pt-3 border-t border-foreground/[0.03]">
               {task.subtasks.map(sub => (
                 <div 
                   key={sub.id}
                   onClick={(e) => handleSubItemClick(e, sub.id)}
                   className="flex items-center gap-2.5 cursor-pointer group/sub py-0.5"
                 >
                    <div className={`
                      shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-all
                      ${sub.completed 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600' 
                        : 'border-foreground/10 text-transparent group-hover/sub:border-emerald-400/50'}
                    `}>
                      <Check size={8} strokeWidth={4} className={sub.completed ? 'scale-100' : 'scale-0'} />
                    </div>
                    <span className={`text-[11px] font-bold truncate transition-all ${sub.completed ? 'text-muted line-through opacity-50' : 'text-foreground/80'}`}>
                      {sub.title}
                    </span>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};