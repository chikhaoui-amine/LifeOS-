import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Clock, Tag, Flag, Trash2, Edit2, ListTodo, BarChart, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { getTodayKey, getWeekKey, getMonthKey, getRelativeTime } from '../utils/dateUtils';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TaskDetail } from '../components/TaskDetail';
import { ProgressRing } from '../components/ProgressRing';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getTranslation } from '../utils/translations';
import { LanguageCode } from '../types';

const Tasks: React.FC = () => {
  const { tasks, toggleTask, deleteTask, addTask, updateTask, toggleSubtask } = useTasks();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<any>({});

  const todayKey = getTodayKey();
  const currentWeekKey = getWeekKey(new Date(), settings.preferences.startOfWeek);
  const currentMonthKey = getMonthKey(new Date());

  // Filter Logic
  const getTasksForPeriod = (period: 'day' | 'week' | 'month') => {
    return tasks.filter(task => {
      if (period === 'day') return task.dueDate === todayKey;
      if (period === 'week') return task.dueWeek === currentWeekKey;
      if (period === 'month') return task.dueMonth === currentMonthKey;
      return false;
    });
  };

  const getStats = (periodTasks: any[]) => {
    const total = periodTasks.length;
    const completed = periodTasks.filter(t => t.completed);
    const urgent = periodTasks.filter(t => t.priority === 'high' && !t.completed);
    const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    return { total, completed, urgent, progress };
  };

  // Memoized Data
  const dayTasks = getTasksForPeriod('day');
  const weekTasks = getTasksForPeriod('week');
  const monthTasks = getTasksForPeriod('month');

  const dayData = { ...getStats(dayTasks), tasks: dayTasks };
  const weeklyData = { ...getStats(weekTasks), tasks: weekTasks, weekStart: currentWeekKey };
  const monthlyData = { ...getStats(monthTasks), tasks: monthTasks, monthName: new Date().toLocaleDateString('en-US', { month: 'long' }) };

  const handleSave = async (data: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setIsFormOpen(false);
    setEditingTask(null);
    setInitialFormDate({});
  };

  const handleDeleteWithConfirm = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTask(deleteId);
      setDeleteId(null);
      if (selectedTask?.id === deleteId) setSelectedTask(null);
    }
  };

  const openAddForm = (defaults: any) => {
    setInitialFormDate(defaults);
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const DayPlanning = () => (
    <div className="w-full h-full flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface/40 rounded-[1.5rem] border border-foreground/10 p-3 min-h-[75px] flex items-center justify-between gap-4 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
         <div className="flex items-center gap-5 relative z-10">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-90" />
               <ProgressRing 
                 progress={dayData.progress} 
                 radius={28} 
                 stroke={5} 
                 color="text-primary" 
                 trackColor="text-foreground/10" 
                 showValue={false} 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-foreground tabular-nums">{dayData.progress}%</span>
               </div>
            </div>
            <div>
               <h3 className="text-lg font-black text-foreground tracking-tighter uppercase leading-none truncate">Daily Focus</h3>
               <p className="text-foreground/40 font-bold text-[8px] uppercase tracking-[0.1em] mt-0.5 line-clamp-1">
                  {dayData.completed.length}/{dayData.total} COMPLETED TODAY
               </p>
            </div>
         </div>
         <button 
           onClick={() => openAddForm({ dueDate: todayKey })} 
           className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5 relative z-10"
         >
            <Plus size={12} strokeWidth={3} /> Add to Today
         </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            {dayData.tasks.length > 0 ? (
               <div className="space-y-4">
                  {dayData.tasks.filter((t: any) => !t.completed).map((task: any) => (
                     <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(task.id)} 
                        onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                        onDelete={() => handleDeleteWithConfirm(task.id)} 
                        onClick={() => setSelectedTask(task)} 
                        onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                     />
                  ))}
               </div>
            ) : (
               <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Sparkles size={32} className="text-foreground/20" />
                  </div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">Your day is clear</h4>
                  <p className="text-xs text-foreground/40 mt-2 font-medium max-w-xs mx-auto leading-relaxed">No tasks for today. A perfect time to plan ahead or focus on a bigger goal.</p>
               </div>
            )}

            {dayData.completed.length > 0 && (
               <div className="pt-8">
                  <h4 className="text-xs font-black text-foreground/30 uppercase tracking-widest mb-4">Completed</h4>
                  <div className="space-y-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                     {dayData.completed.map((task: any) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onToggle={() => toggleTask(task.id)} 
                            onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                            onDelete={() => handleDeleteWithConfirm(task.id)} 
                            onClick={() => setSelectedTask(task)} 
                            onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                        />
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );

  const WeekPlanning = () => (
    <div className="w-full h-full flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface/40 rounded-[1.5rem] border border-foreground/10 p-3 min-h-[75px] flex items-center justify-between gap-4 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
         <div className="flex items-center gap-5 relative z-10">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-90" />
               <ProgressRing 
                 progress={weeklyData.progress} 
                 radius={28} 
                 stroke={5} 
                 color="text-primary" 
                 trackColor="text-foreground/10" 
                 showValue={false} 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-foreground tabular-nums">{weeklyData.progress}%</span>
               </div>
            </div>
            <div>
               <h3 className="text-lg font-black text-foreground tracking-tighter uppercase leading-none truncate">Weekly Objectives</h3>
               <p className="text-foreground/40 font-bold text-[8px] uppercase tracking-[0.1em] mt-0.5 line-clamp-1">
                  {weeklyData.completed.length}/{weeklyData.total} MISSION OBJECTIVES
               </p>
            </div>
         </div>
         <button onClick={() => openAddForm({ dueWeek: currentWeekKey })} className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5 relative z-10">
            <Plus size={12} strokeWidth={3} /> New Objective
         </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            {weeklyData.tasks.length > 0 ? weeklyData.tasks.map((task: any) => (
               <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask(task.id)} 
                onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                onDelete={() => handleDeleteWithConfirm(task.id)} 
                onClick={() => setSelectedTask(task)} 
                onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
               />
            )) : (
               <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <BarChart size={32} className="text-foreground/20" />
                  </div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">No weekly load</h4>
                  <p className="text-xs text-foreground/40 mt-2 font-medium max-w-xs mx-auto leading-relaxed">Weekly tasks aren't tied to a specific day. Use them for big-picture goals.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );

  const MonthPlanning = () => (
    <div className="w-full h-full flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface/40 rounded-[1.5rem] border border-foreground/10 p-3 min-h-[75px] flex items-center justify-between gap-4 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
         <div className="flex items-center gap-5 relative z-10">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-90" />
               <ProgressRing 
                 progress={monthlyData.progress} 
                 radius={28} 
                 stroke={5} 
                 color="text-primary" 
                 trackColor="text-foreground/10" 
                 showValue={false} 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-foreground tabular-nums">{monthlyData.progress}%</span>
               </div>
            </div>
            <div>
               <h3 className="text-lg font-black text-foreground tracking-tighter uppercase leading-none truncate">{monthlyData.monthName} Roadmap</h3>
               <p className="text-foreground/40 font-bold text-[8px] uppercase tracking-[0.1em] mt-0.5 line-clamp-1">
                  {monthlyData.completed.length}/{monthlyData.total} KEY MILESTONES
               </p>
            </div>
         </div>
         <button onClick={() => openAddForm({ dueMonth: currentMonthKey })} className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5 relative z-10">
            <Plus size={12} strokeWidth={3} /> New Milestone
         </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            {monthlyData.tasks.length > 0 ? monthlyData.tasks.map((task: any) => (
               <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask(task.id)} 
                onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                onDelete={() => handleDeleteWithConfirm(task.id)} 
                onClick={() => setSelectedTask(task)} 
                onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
               />
            )) : (
               <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CalendarIcon size={32} className="text-foreground/20" />
                  </div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">No monthly targets</h4>
                  <p className="text-xs text-foreground/40 mt-2 font-medium max-w-xs mx-auto leading-relaxed">Monthly tasks are for broad targets you want to hit by the end of the month.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-1000 pb-32 h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
                    <ListTodo size={20} sm-size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{t.tasks.title}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">{t.tasks.subtitle}</span>
                    </div>
                </div>
            </div>

            <div className="flex bg-surface p-1 rounded-2xl border border-foreground/10 self-start">
               <button onClick={() => setActiveTab('day')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'day' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Day</button>
               <button onClick={() => setActiveTab('week')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'week' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Week</button>
               <button onClick={() => setActiveTab('month')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'month' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Month</button>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
            {activeTab === 'day' && <DayPlanning />}
            {activeTab === 'week' && <WeekPlanning />}
            {activeTab === 'month' && <MonthPlanning />}
        </div>

        {/* Modals */}
        {isFormOpen && (
            <TaskForm 
                initialData={{...editingTask, ...initialFormDate}} 
                onSave={handleSave} 
                onClose={() => setIsFormOpen(false)} 
            />
        )}

        {selectedTask && (
            <TaskDetail 
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onToggle={() => toggleTask(selectedTask.id)}
                onEdit={() => { setEditingTask(selectedTask); setSelectedTask(null); setIsFormOpen(true); }}
                onDelete={() => handleDeleteWithConfirm(selectedTask.id)}
                onToggleSubtask={(sid) => toggleSubtask(selectedTask.id, sid)}
            />
        )}

        <ConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Delete Task"
            message="Are you sure you want to delete this task? This action cannot be undone."
            type="danger"
            confirmText="Delete"
        />
    </div>
  );
};

export default Tasks;