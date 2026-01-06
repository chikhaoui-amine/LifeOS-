
import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, Kanban, Search, Sparkles, BrainCircuit, Target, Compass } from 'lucide-react';
import { useGoals } from '../context/GoalContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { GoalDetail } from '../components/goals/GoalDetail';
import { GoalTemplates } from '../components/goals/GoalTemplates';
import { AIGoalPlannerModal } from '../components/goals/AIGoalPlannerModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Goal, LanguageCode } from '../types';

const Goals: React.FC = () => {
  const { goals, loading, addGoal, updateGoal } = useGoals();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formInitialData, setFormInitialData] = useState<Partial<Goal> | null>(null);

  const selectedGoal = useMemo(() => goals.find(g => g.id === selectedGoalId) || null, [goals, selectedGoalId]);

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
        }
        return true;
    }).sort((a, b) => {
       const pMap = { high: 0, medium: 1, low: 2 };
       if (a.status === 'completed' && b.status !== 'completed') return 1;
       if (a.status !== 'completed' && b.status === 'completed') return -1;
       return pMap[a.priority as keyof typeof pMap] - pMap[b.priority as keyof typeof pMap];
    });
  }, [goals, searchQuery]);

  const handleSave = async (data: any) => {
    if (selectedGoalId) { await updateGoal(selectedGoalId, data); }
    else { await addGoal(data); }
    setIsFormOpen(false); setSelectedGoalId(null); setFormInitialData(null);
  };

  const handleTemplateSelect = (template: Partial<Goal>) => {
    setIsTemplateOpen(false); setFormInitialData(template); setIsFormOpen(true);
  };

  const handleAIGenerated = (aiGoal: Partial<Goal>) => {
    setIsAIPlannerOpen(false); setFormInitialData(aiGoal); setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header - Standardized */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
              <Target size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{t.goals.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">{t.goals.subtitle}</span>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           {/* Search */}
           <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full sm:w-48 bg-surface border border-[var(--color-border)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-foreground"
              />
           </div>

           {/* AI & Presets */}
           <button onClick={() => setIsAIPlannerOpen(true)} className="p-2.5 bg-surface text-foreground hover:text-primary-600 rounded-xl transition-all border border-[var(--color-border)] hover:border-primary-200 dark:hover:border-primary-800" title="AI Strategist">
              <BrainCircuit size={18} />
           </button>
           <button onClick={() => setIsTemplateOpen(true)} className="p-2.5 bg-surface text-foreground hover:text-primary-600 rounded-xl transition-all border border-[var(--color-border)] hover:border-primary-200 dark:hover:border-primary-800" title="Presets">
              <Sparkles size={18} />
           </button>

           <div className="h-6 w-px bg-foreground/10 mx-1 hidden sm:block" />

           {/* View Toggles */}
           <div className="flex bg-surface p-1 rounded-xl border border-[var(--color-border)]">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><List size={16} /></button>
              <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><Kanban size={16} /></button>
           </div>

           {/* Add Button */}
           <button onClick={() => { setFormInitialData(null); setSelectedGoalId(null); setIsFormOpen(true); }} className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-600/30 transition-all active:scale-95 ml-1">
              <Plus size={20} strokeWidth={3} />
           </button>
        </div>
      </header>

      {/* Goal Workspace */}
      <div className="min-h-[600px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8"><LoadingSkeleton count={6} /></div>
        ) : filteredGoals.length === 0 ? (
          <div className="py-32">
             <EmptyState 
                icon={Compass} 
                title="Workspace Empty" 
                description="Your strategic horizon is currently undefined. Initialize your first goal to begin tracking progress." 
                actionLabel="New Mission" 
                onAction={() => setIsAIPlannerOpen(true)} 
             />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                   {filteredGoals.map(goal => <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />)}
                </div>
             )}
             {viewMode === 'list' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                   {filteredGoals.map(goal => <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />)}
                </div>
             )}
             {viewMode === 'board' && (
                <div className="flex gap-8 overflow-x-auto pb-12 h-[calc(100vh-280px)] no-scrollbar custom-scrollbar snap-x">
                   {['not-started', 'in-progress', 'completed'].map(statusId => (
                      <div key={statusId} className="min-w-[320px] max-w-[340px] flex flex-col h-full snap-start">
                         <div className="flex items-center justify-between mb-6 px-4">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-muted">
                               {statusId === 'not-started' ? 'Standby' : statusId === 'in-progress' ? 'Active' : 'Secured'}
                            </h3>
                            <span className="text-[10px] font-black bg-foreground/5 px-2.5 py-1 rounded-full text-muted">
                               {filteredGoals.filter(goal => goal.status === statusId).length}
                            </span>
                         </div>
                         <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-20">
                            {filteredGoals.filter(goal => goal.status === statusId).map(goal => <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />)}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && <GoalForm initialData={selectedGoal || formInitialData || {}} onSave={handleSave} onClose={() => { setIsFormOpen(false); setFormInitialData(null); }} />}
      {isTemplateOpen && <GoalTemplates onSelect={handleTemplateSelect} onClose={() => setIsTemplateOpen(false)} />}
      {isAIPlannerOpen && <AIGoalPlannerModal onGoalGenerated={handleAIGenerated} onClose={() => setIsAIPlannerOpen(false)} />}
      {selectedGoal && !isFormOpen && !isTemplateOpen && !isAIPlannerOpen && <GoalDetail goal={selectedGoal} onClose={() => setSelectedGoalId(null)} onEdit={() => setIsFormOpen(true)} />}
    </div>
  );
};

export default Goals;
