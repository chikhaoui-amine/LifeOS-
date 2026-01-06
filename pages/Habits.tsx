
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, CheckCircle2, Sunrise, Sun, Moon, Clock,
  Sparkles, Zap, Flame
} from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { HabitForm } from '../components/HabitForm';
import { HabitCard } from '../components/HabitCard';
import { HabitTemplates } from '../components/HabitTemplates';
import { HabitStatsDetail } from '../components/HabitStatsDetail';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getTodayKey } from '../utils/dateUtils';
import { Habit, LanguageCode } from '../types';

const Habits: React.FC = () => {
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleHabit, archiveHabit } = useHabits();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit> | null>(null);
  const [selectedHabitStats, setSelectedHabitStats] = useState<Habit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const todayKey = getTodayKey();

  // --- Data Calculations ---
  const stats = useMemo(() => {
    const active = habits.filter(h => !h.archived);
    const dayIndex = new Date().getDay();
    const scheduledToday = active.filter(h => h.frequency.days.includes(dayIndex));
    const completedToday = scheduledToday.filter(h => h.completedDates.includes(todayKey)).length;
    const progress = scheduledToday.length === 0 ? 0 : Math.round((completedToday / scheduledToday.length) * 100);
    return { total: active.length, scheduled: scheduledToday.length, completed: completedToday, progress };
  }, [habits, todayKey]);

  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      if (h.archived) return false;
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [habits, searchQuery]);

  // --- Handlers ---
  const handleSave = async (habitData: any) => {
    if (editingHabit && (editingHabit as Habit).id) {
      await updateHabit((editingHabit as Habit).id, habitData);
    } else {
      await addHabit(habitData);
    }
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const requestDeleteHabit = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Habit',
      message: 'Are you sure you want to delete this habit? This action cannot be undone.',
      onConfirm: () => deleteHabit(id),
    });
  };

  // --- Grouping Logic ---
  const grouped = useMemo(() => ({
    morning: filteredHabits.filter(h => h.timeOfDay === 'morning'),
    afternoon: filteredHabits.filter(h => h.timeOfDay === 'afternoon'),
    evening: filteredHabits.filter(h => h.timeOfDay === 'evening'),
    anytime: filteredHabits.filter(h => !h.timeOfDay || h.timeOfDay === 'anytime'),
  }), [filteredHabits]);

  const sections = [
    { key: 'morning', label: t.habits.morning, icon: Sunrise, color: 'text-orange-500' },
    { key: 'afternoon', label: t.habits.afternoon, icon: Sun, color: 'text-yellow-500' },
    { key: 'evening', label: t.habits.evening, icon: Moon, color: 'text-indigo-500' },
    { key: 'anytime', label: t.habits.anytime, icon: Clock, color: 'text-blue-500' },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500 pb-2 md:pb-0 gap-4 sm:gap-6 overflow-hidden">
      
      {/* Header - Optimized for Mobile */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
              <CheckCircle2 size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{t.habits.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-black text-primary-600 uppercase tracking-widest">{stats.completed}/{stats.scheduled} Today</span>
                 </div>
                 <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">{stats.progress}% Consistency</span>
              </div>
           </div>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" size={14} />
              <input 
                type="text" 
                placeholder="Search habits..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full md:w-64 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-primary-500/50 transition-all text-gray-900 dark:text-white"
              />
           </div>

           <button 
             onClick={() => setIsTemplatesOpen(true)}
             className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
             title="Browse Templates"
           >
              <Sparkles size={18} strokeWidth={3} />
           </button>

           <button 
             onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
             className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-600/30 transition-all active:scale-95"
           >
              <Plus size={20} strokeWidth={4} />
           </button>
        </div>
      </header>

      {/* Daily Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-10">
        {loading ? (
           <div className="space-y-4">
              <LoadingSkeleton count={3} type="card" />
           </div>
        ) : filteredHabits.length === 0 ? (
           <EmptyState icon={Zap} title="No Habits Found" description="Try adjusting your search or add a new habit to your daily routine." actionLabel="Explore Templates" onAction={() => setIsTemplatesOpen(true)} />
        ) : (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
             {sections.map(section => {
               const items = grouped[section.key as keyof typeof grouped];
               if (items.length === 0) return null;
               return (
                 <div key={section.key} className="space-y-4">
                   <div className="flex items-center gap-2 px-1">
                     <div className={`p-1.5 rounded-lg bg-surface shadow-sm border border-[var(--color-border)] ${section.color}`}>
                        <section.icon size={14} strokeWidth={3} />
                     </div>
                     <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{section.label}</h2>
                     <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800/50 mx-2" />
                     <span className="text-[10px] font-black text-muted bg-surface px-2 py-0.5 rounded-full">
                       {items.length}
                     </span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {items.map(habit => (
                         <HabitCard 
                           key={habit.id} 
                           habit={habit} 
                           isCompleted={habit.completedDates.includes(todayKey)} 
                           onToggle={() => toggleHabit(habit.id)} 
                           onEdit={() => handleEdit(habit)} 
                           onDelete={() => requestDeleteHabit(habit.id)} 
                           onArchive={() => archiveHabit(habit.id)} 
                         />
                      ))}
                   </div>
                 </div>
               );
             })}
           </div>
        )}
      </div>
      
      {/* Modals */}
      {isModalOpen && (
        <HabitForm 
          initialData={editingHabit || {}} 
          onSave={handleSave} 
          onClose={() => { setIsModalOpen(false); setEditingHabit(null); }} 
        />
      )}
      
      {isTemplatesOpen && (
        <HabitTemplates 
          onSelect={(tpl) => { setEditingHabit(tpl); setIsTemplatesOpen(false); setIsModalOpen(true); }} 
          onClose={() => setIsTemplatesOpen(false)} 
        />
      )}

      {selectedHabitStats && (
        <HabitStatsDetail 
          habit={selectedHabitStats} 
          onClose={() => setSelectedHabitStats(null)} 
        />
      )}
      
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={confirmConfig.onConfirm} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        type="danger" 
        confirmText={t.common.delete} 
      />
    </div>
  );
};

export default Habits;
