
import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Clock, Tag, Flag, Trash2, Edit2, ListTodo, BarChart, Sparkles, FolderPlus, Layers, MoreVertical, X, LayoutGrid, CalendarRange } from 'lucide-react';
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
import { LanguageCode, TaskTimeframe } from '../types';

const Tasks: React.FC = () => {
  const { 
    tasks, sections, toggleTask, deleteTask, addTask, updateTask, 
    toggleSubtask, addSection, deleteSection, updateSection 
  } = useTasks();
  const { settings } = useSettings();
  const { selectedDate, isToday, selectedDateObject } = useSystemDate();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [activeTab, setActiveTab] = useState<TaskTimeframe>('day');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<any>({});
  
  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionTimeframe, setSectionTimeframe] = useState<TaskTimeframe>('day');
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  const currentWeekKey = getWeekKey(selectedDateObject, settings.preferences.startOfWeek);
  const currentMonthKey = getMonthKey(selectedDateObject);

  // Filter Logic
  const getTasksForPeriod = (period: TaskTimeframe) => {
    return tasks.filter(task => {
      if (period === 'day') return task.dueDate === selectedDate;
      if (period === 'week') return task.dueWeek === currentWeekKey;
      if (period === 'month') return task.dueMonth === currentMonthKey;
      return false;
    });
  };

  // Group tasks by section
  const groupTasksBySection = (periodTasks: any[], periodSections: any[]) => {
    const grouped: Record<string, any[]> = { 'uncategorized': [] };
    periodSections.forEach(s => grouped[s.id] = []);
    
    periodTasks.forEach(t => {
      if (t.sectionId && grouped[t.sectionId]) {
        grouped[t.sectionId].push(t);
      } else {
        grouped['uncategorized'].push(t);
      }
    });
    return grouped;
  };

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

  const handleCreateSection = async () => {
    if (sectionTitle.trim()) {
      await addSection(sectionTitle.trim(), sectionTimeframe);
      setSectionTitle('');
      setIsSectionModalOpen(false);
    }
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

  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      deleteSection(sectionToDelete);
      setSectionToDelete(null);
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

  const SectionView = ({ timeframeTasks }: { timeframeTasks: any[] }) => {
    const timeframeSections = sections.filter(s => s.timeframe === activeTab);
    const grouped = groupTasksBySection(timeframeTasks, timeframeSections);

    return (
      <div className="w-full h-full flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-1 space-y-8 custom-scrollbar">
            {/* Uncategorized Section */}
            {(grouped['uncategorized'].length > 0 || timeframeSections.length === 0) && (
              <div className="space-y-4">
                {grouped['uncategorized'].length > 0 ? (
                  <div className="space-y-4">
                    {grouped['uncategorized'].filter((t: any) => !t.completed).map((task: any) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(task.id)} 
                        onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                        onDelete={() => handleDeleteWithConfirm(task.id)} 
                        onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                      />
                    ))}
                    {grouped['uncategorized'].filter((t: any) => t.completed).length > 0 && (
                      <div className="pt-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted">Completed</span>
                           <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="space-y-4">
                          {grouped['uncategorized'].filter((t: any) => t.completed).map((task: any) => (
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
                ) : timeframeTasks.length === 0 && (
                   <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Sparkles size={32} className="text-foreground/20" />
                    </div>
                    <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">View is clear</h4>
                    <p className="text-xs text-foreground/40 mt-2 font-medium max-w-xs mx-auto leading-relaxed">No objectives recorded for this timeframe.</p>
                 </div>
                )}
              </div>
            )}

            {/* Custom Sections */}
            {timeframeSections.map(section => (
              <div key={section.id} className="space-y-4 animate-in fade-in slide-in-from-left-2">
                <div className="flex items-center justify-between group/header">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary-500 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{section.title}</h3>
                    <span className="text-[10px] bg-foreground/5 px-2 py-0.5 rounded-full text-muted">{grouped[section.id].length}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openAddForm({ sectionId: section.id })} 
                      className="p-1.5 text-muted hover:text-primary-600 rounded-lg hover:bg-foreground/5"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => setSectionToDelete(section.id)} 
                      className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-foreground/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {grouped[section.id].length > 0 ? (
                    <>
                      {grouped[section.id].filter((t: any) => !t.completed).map((task: any) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onToggle={() => toggleTask(task.id)} 
                          onEdit={() => {setEditingTask(task); setIsFormOpen(true);}} 
                          onDelete={() => handleDeleteWithConfirm(task.id)} 
                          onToggleSubtask={(sid) => toggleSubtask(task.id, sid)}
                        />
                      ))}
                      {grouped[section.id].filter((t: any) => t.completed).length > 0 && (
                        <div className="opacity-40 space-y-4 grayscale hover:grayscale-0 hover:opacity-100 transition-all pt-2">
                          {grouped[section.id].filter((t: any) => t.completed).map((task: any) => (
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
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-foreground/5 rounded-[2rem]">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">Drop {activeTab} tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
                
                <div className="flex gap-2">
                   <button 
                     onClick={() => { setSectionTimeframe(activeTab); setIsSectionModalOpen(true); }}
                     className="bg-surface text-foreground border border-foreground/10 p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                     title="Add Section"
                   >
                       <FolderPlus size={20} strokeWidth={2.5} />
                   </button>
                   <button 
                     onClick={handleGlobalAdd}
                     className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-600/30 transition-all active:scale-95"
                   >
                       <Plus size={20} strokeWidth={4} />
                   </button>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
            <SectionView timeframeTasks={getTasksForPeriod(activeTab)} />
        </div>

        {/* Section Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Add Section</h3>
                   <button onClick={() => setIsSectionModalOpen(false)}><X size={20} className="text-muted" /></button>
                </div>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 block">Timeframe Context</label>
                      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-4">
                        {[
                          { id: 'day', label: 'Day', icon: CalendarIcon },
                          { id: 'week', label: 'Week', icon: LayoutGrid },
                          { id: 'month', label: 'Month', icon: CalendarRange }
                        ].map(t => (
                          <button 
                            key={t.id}
                            type="button"
                            onClick={() => setSectionTimeframe(t.id as TaskTimeframe)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${sectionTimeframe === t.id ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 block">Section Title</label>
                      <input 
                        type="text" 
                        value={sectionTitle}
                        onChange={e => setSectionTitle(e.target.value)}
                        placeholder="e.g. Major Deliverables"
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:ring-2 focus:ring-primary-500/20 font-bold outline-none"
                        autoFocus
                      />
                   </div>
                   <button 
                     onClick={handleCreateSection}
                     disabled={!sectionTitle.trim()}
                     className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all"
                   >
                      Initialize {sectionTimeframe} Section
                   </button>
                </div>
             </div>
          </div>
        )}

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

        <ConfirmationModal 
            isOpen={!!sectionToDelete}
            onClose={() => setSectionToDelete(null)}
            onConfirm={confirmDeleteSection}
            title="Purge Section"
            message="Delete this section? Tasks within will be moved to 'Uncategorized'."
            type="danger"
            confirmText="Purge"
        />
    </div>
  );
};

export default Tasks;
