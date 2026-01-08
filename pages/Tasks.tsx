import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Clock, Tag, Flag, Trash2, Edit2, ListTodo, BarChart, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { useSystemDate } from '../context/SystemDateContext';
import { getTodayKey, getWeekKey, getMonthKey } from '../utils/dateUtils';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { ProgressRing } from '../components/ProgressRing';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getTranslation } from '../utils/translations';
import { LanguageCode } from '../types';

const Tasks: React.FC = () => {
  const { tasks, toggleTask, deleteTask, addTask, updateTask, toggleSubtask } = useTasks();
  const { settings } = useSettings();
  const { selectedDate, isToday, selectedDateObject } = useSystemDate();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<any>({});

  const currentWeekKey = getWeekKey(selectedDateObject, settings.preferences.startOfWeek);
  const currentMonthKey = getMonthKey(selectedDateObject);

  // Filter Logic
  const getTasksForPeriod = (period: 'day' | 'week' | 'month') => {
    return tasks.filter(task => {
      if (period === 'day') return task.dueDate === selectedDate;
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
  const monthlyData = { ...getStats(monthTasks), tasks: monthTasks, monthName: selectedDateObject.toLocaleDateString('en-US', { month: 'long' }) };

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
    }
  };

  const openAddForm = (defaults: any) => {
    setInitialFormDate(defaults);
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleGlobalAdd = () => {
    const defaults: any = {};
    if (activeTab === 'day') defaults.dueDate = selectedDate;
    else if (activeTab === 'week') defaults.dueWeek = currentWeekKey;
    else if (activeTab === 'month') defaults.dueMonth = currentMonthKey;
    openAddForm(defaults);
  };

  const DayPlanning = () => (
    <div className="w-full h-full flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                     />
                  ))}
               </div>
            ) : (
               <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Sparkles size={32} className="text-foreground/20" />
                  </div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">Day is clear</h4>
                  <p className="text-xs text-foreground/40 mt-2 font-medium max-w-xs mx-auto leading-relaxed">No tasks recorded for this date.</p>
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
      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            {weeklyData.tasks.length > 0 ? weeklyData.tasks.map((task: any) => (
               <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask(task.id)} 
                onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                onDelete={() => handleDeleteWithConfirm(task.id)} 
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
      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-1 space-y-4 custom-scrollbar">
            {monthlyData.tasks.length > 0 ? monthlyData.tasks.map((task: any) => (
               <TaskCard 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask(task.id)} 
                onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                onDelete={() => handleDeleteWithConfirm(task.id)} 
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-1000 pb-32 h-full flex flex-col">
        
        {/* Header */}
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
                    <ListTodo size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{t.tasks.title}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">{t.tasks.subtitle}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
                <div className="flex bg-surface p-1 rounded-2xl border border-foreground/10">
                   <button onClick={() => setActiveTab('day')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'day' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Day</button>
                   <button onClick={() => setActiveTab('week')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'week' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Week</button>
                   <button onClick={() => setActiveTab('month')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'month' ? 'bg-primary-600 text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>Month</button>
                </div>
                <button 
                  onClick={handleGlobalAdd}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-600/30 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={4} />
                </button>
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