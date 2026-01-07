
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, ListTodo, Sun, Moon, Sunrise, 
  Calendar as CalendarIcon, 
  Target, Flame, Check
} from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { useIslamic } from '../context/IslamicContext';
import { useGoals } from '../context/GoalContext';
import { useSystemDate } from '../context/SystemDateContext';
import { HabitCard } from '../components/HabitCard';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';
import { Task, LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';

const Today: React.FC = () => {
  const { habits, toggleHabit } = useHabits();
  const { tasks, toggleTask, deleteTask, addTask, toggleSubtask, updateTask } = useTasks();
  const { settings } = useSettings();
  const { transactions, getFormattedCurrency } = useFinance();
  const { hijriDate } = useIslamic();
  const { goals } = useGoals();
  const { selectedDate, isToday, selectedDateObject } = useSystemDate();
  
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentHour = new Date().getHours();
  const timeContext = useMemo(() => {
    if (currentHour < 12) return { greeting: t.today.morning, icon: Sunrise, sub: 'The world is quiet. Build your momentum.' };
    if (currentHour < 17) return { greeting: t.today.afternoon, icon: Sun, sub: 'The sun is high. Stay sharp and focused.' };
    return { greeting: t.today.evening, icon: Moon, sub: 'Reflect on your wins. Rest is productive.' };
  }, [currentHour, t]);

  const todaysHabits = useMemo(() => {
    const dayIndex = selectedDateObject.getDay();
    return habits.filter(h => !h.archived && h.frequency.days.includes(dayIndex));
  }, [habits, selectedDateObject]);

  const { urgentTasks, routineTasks } = useMemo(() => {
    const active = tasks.filter(t => t.dueDate === selectedDate && !t.completed);
    return {
      urgentTasks: active.filter(t => t.priority === 'high'),
      routineTasks: active.filter(t => t.priority !== 'high')
    };
  }, [tasks, selectedDate]);

  const activeGoal = useMemo(() => {
    return goals.find(g => g.status === 'in-progress' && g.priority === 'high') || goals[0];
  }, [goals]);

  const dailySpend = useMemo(() => {
    return transactions.filter(tx => tx.date === selectedDate && tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, selectedDate]);

  const taskStats = useMemo(() => {
     const dateTasks = tasks.filter(t => t.dueDate === selectedDate);
     const completed = dateTasks.filter(t => t.completed).length;
     return { total: dateTasks.length, completedToday: completed };
  }, [tasks, selectedDate]);

  const habitStats = useMemo(() => {
     const dayIndex = selectedDateObject.getDay();
     const active = habits.filter(h => !h.archived && h.frequency.days.includes(dayIndex));
     const completed = active.filter(h => h.completedDates.includes(selectedDate)).length;
     return { completionRate: active.length > 0 ? Math.round((completed / active.length) * 100) : 0, completedToday: completed };
  }, [habits, selectedDate, selectedDateObject]);
  
  const taskProgress = taskStats.total > 0 ? (taskStats.completedToday / taskStats.total) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-1000 pb-32">
      
      {/* 1. Hero Command Center */}
      <div className="relative overflow-hidden p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] text-white bg-primary shadow-xl transition-all duration-1000">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-6">
               <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase tracking-[0.15em] border border-white/10 shadow-lg">
                    <CalendarIcon size={12} /> {selectedDateObject.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  {settings.preferences.enableIslamicFeatures && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/10 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase tracking-[0.15em] border border-white/5 text-white">
                      <Moon size={12} /> {hijriDate.day} {hijriDate.monthName}
                    </div>
                  )}
               </div>
               
               <div className="space-y-1">
                  <h1 className="text-3xl sm:text-6xl font-black tracking-tighter leading-none animate-in slide-in-from-left duration-700">
                     {isToday ? timeContext.greeting : 'Archived Log'},
                  </h1>
                  <p className="text-white/80 text-xs sm:text-xl font-medium max-w-2xl italic opacity-90 leading-relaxed font-serif">
                     {isToday ? `"${timeContext.sub}"` : `Reviewing performance for ${selectedDate}.`}
                  </p>
               </div>
               
               <div className="flex flex-wrap gap-4 sm:gap-8 pt-1 items-end">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-lg sm:text-2xl font-black tracking-tight tabular-nums">{(getFormattedCurrency(dailySpend) || "").split('.')[0]}</span>
                     <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Spend</span>
                  </div>
                  
                  <div className="w-px h-6 sm:h-8 bg-white/10" />
                  
                  <div className="flex flex-col gap-0.5 min-w-[3.5rem] sm:min-w-[5rem]">
                     <span className="text-lg sm:text-2xl font-black tracking-tight tabular-nums">{taskStats.completedToday}</span>
                     <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${taskProgress}%` }} />
                     </div>
                     <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mt-1">Wins</span>
                  </div>
                  
                  <div className="w-px h-6 sm:h-8 bg-white/10" />
                  
                  <div className="flex flex-col gap-0.5 min-w-[3.5rem] sm:min-w-[5rem]">
                     <span className="text-lg sm:text-2xl font-black tracking-tight tabular-nums">{habitStats.completionRate}%</span>
                     <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${habitStats.completionRate}%` }} />
                     </div>
                     <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mt-1">Flow</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Main Dashboard Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
         
         {/* Focus Column */}
         <div className="md:col-span-6 flex flex-col">
            <div className="bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 flex-1 flex flex-col border border-foreground/5 shadow-sm relative group">
               <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 rotate-3">
                        <ListTodo size={isMobile ? 20 : 24} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h3 className="font-black text-lg sm:text-2xl text-foreground tracking-tighter uppercase">Daily Tasks</h3>
                        <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mt-0.5">Focus • {selectedDate}</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 space-y-3 sm:space-y-4 relative z-10">
                  {urgentTasks.length > 0 && (
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                           <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                           <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Urgent</span>
                        </div>
                        {urgentTasks.map(task => (
                           <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onEdit={() => setEditingTask(task)} onDelete={() => deleteTask(task.id)} onClick={() => setSelectedTask(task)} />
                        ))}
                     </div>
                  )}

                  {routineTasks.length > 0 && (
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                           <div className="w-1 h-1 bg-primary-500 rounded-full" />
                           <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">Routine</span>
                        </div>
                        {routineTasks.map(task => (
                           <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onEdit={() => setEditingTask(task)} onDelete={() => deleteTask(task.id)} onClick={() => setSelectedTask(task)} />
                        ))}
                     </div>
                  )}

                  {urgentTasks.length === 0 && routineTasks.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-20 opacity-30 text-center">
                        <Check size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-3">Objectives Secured</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Goal & Habits Column */}
         <div className="md:col-span-6 flex flex-col gap-5 sm:gap-6">
            {activeGoal && (
               <div className="bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-foreground/5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl"><Target size={18} strokeWidth={2.5} /></div>
                     <span className="text-[9px] font-black text-muted uppercase tracking-widest">Active Pursuit</span>
                  </div>
                  <div>
                     <h4 className="text-lg font-black text-foreground tracking-tight line-clamp-2">{activeGoal.title}</h4>
                     <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[8px] font-black text-muted uppercase tracking-widest">
                           <span>Mastery</span>
                           <span>{Math.round((activeGoal.currentValue / activeGoal.targetValue) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-600 transition-all duration-1000" style={{ width: `${(activeGoal.currentValue / activeGoal.targetValue) * 100}%` }} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <div className="bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-foreground/5 shadow-sm relative group flex-1 flex flex-col">
               <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 -rotate-3">
                        <Flame size={isMobile ? 20 : 24} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h3 className="font-black text-lg sm:text-2xl text-foreground tracking-tighter uppercase">Daily Flow</h3>
                        <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mt-0.5">Discipline Log</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-3 sm:gap-4 flex-1 relative z-10">
                  {todaysHabits.map(habit => (
                     <HabitCard key={habit.id} habit={habit} isCompleted={habit.completedDates.includes(selectedDate)} onToggle={() => toggleHabit(habit.id, selectedDate)} onEdit={() => {}} onDelete={() => {}} onArchive={() => {}} />
                  ))}
                  {todaysHabits.length === 0 && (
                     <div className="col-span-full py-10 text-center opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-widest">No habits scheduled</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Modals */}
      {selectedTask && (
         <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} onToggle={() => toggleTask(selectedTask.id)} onEdit={() => { setEditingTask(selectedTask); setSelectedTask(null); }} onDelete={() => deleteTask(selectedTask.id)} onToggleSubtask={(sid) => toggleSubtask(selectedTask.id, sid)} />
      )}
      {editingTask && (
         <TaskForm initialData={editingTask} onSave={(data) => { updateTask(editingTask.id, data); setEditingTask(null); }} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
};

export default Today;
