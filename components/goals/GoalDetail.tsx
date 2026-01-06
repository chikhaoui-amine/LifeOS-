
import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, CheckCircle2, Circle, Edit2, Trash2, Plus, Target, Quote, Book, Layout, StickyNote, Send, Sparkles, Zap } from 'lucide-react';
import { Goal } from '../../types';
import { useGoals } from '../../context/GoalContext';
import { ConfirmationModal } from '../ConfirmationModal';

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onEdit: () => void;
}

const COLOR_MAP: Record<string, { text: string, border: string, progress: string, bg: string, ring: string, secondary: string }> = {
  indigo: { text: 'text-indigo-600', border: 'border-indigo-500', progress: 'bg-indigo-500', bg: 'bg-indigo-600', ring: 'focus:ring-indigo-500/20', secondary: 'bg-indigo-50 dark:bg-indigo-900/20' },
  blue: { text: 'text-blue-600', border: 'border-blue-500', progress: 'bg-blue-500', bg: 'bg-blue-600', ring: 'focus:ring-blue-500/20', secondary: 'bg-blue-50 dark:bg-blue-900/20' },
  green: { text: 'text-green-600', border: 'border-green-500', progress: 'bg-green-500', bg: 'bg-green-600', ring: 'focus:ring-green-500/20', secondary: 'bg-green-50 dark:bg-indigo-900/20' },
  amber: { text: 'text-amber-600', border: 'border-amber-500', progress: 'bg-amber-500', bg: 'bg-amber-600', ring: 'focus:ring-amber-500/20', secondary: 'bg-amber-50 dark:bg-amber-900/20' },
  red: { text: 'text-red-600', border: 'border-red-500', progress: 'bg-red-500', bg: 'bg-red-600', ring: 'focus:ring-red-500/20', secondary: 'bg-red-50 dark:bg-red-900/20' },
  purple: { text: 'text-purple-600', border: 'border-purple-500', progress: 'bg-purple-500', bg: 'bg-purple-600', ring: 'focus:ring-purple-500/20', secondary: 'bg-purple-50 dark:bg-purple-900/20' },
  pink: { text: 'text-pink-600', border: 'border-pink-500', progress: 'bg-pink-500', bg: 'bg-pink-600', ring: 'focus:ring-pink-500/20', secondary: 'bg-pink-50 dark:bg-pink-900/20' },
};

export const GoalDetail: React.FC<GoalDetailProps> = ({ goal, onClose, onEdit }) => {
  const { deleteGoal, updateProgress, toggleMilestone, updateGoal, addNote, deleteNote } = useGoals();
  const [activeTab, setActiveTab] = useState<'overview' | 'journal'>('overview');
  
  const [newMilestone, setNewMilestone] = useState('');
  const [updateValue, setUpdateValue] = useState(goal.currentValue.toString());
  const [noteContent, setNoteContent] = useState('');

  const [showGoalDeleteConfirm, setShowGoalDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const isCompleted = goal.status === 'completed';
  const theme = COLOR_MAP[goal.color] || COLOR_MAP.indigo;

  useEffect(() => {
    setUpdateValue(goal.currentValue.toString());
  }, [goal.currentValue]);

  const handleGoalDelete = () => {
    deleteGoal(goal.id);
    onClose();
  };

  const handleNoteDelete = () => {
    if (noteToDelete) {
      deleteNote(goal.id, noteToDelete);
      setNoteToDelete(null);
    }
  };

  const handleUpdateProgress = () => {
    const val = parseFloat(updateValue);
    if (!isNaN(val)) {
        updateProgress(goal.id, val);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
        const milestones = [...goal.milestones, { id: Date.now().toString(), title: newMilestone, completed: false }];
        updateGoal(goal.id, { milestones });
        setNewMilestone('');
    }
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (noteContent.trim()) {
      addNote(goal.id, noteContent.trim());
      setNoteContent('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex justify-end animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#09090b] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className={`h-56 shrink-0 relative overflow-hidden`}>
           {goal.coverImage ? (
             <img src={goal.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" alt={goal.title} />
           ) : (
             <div className={`w-full h-full bg-gradient-to-br ${goal.color === 'indigo' ? 'from-indigo-600 to-violet-800' : `${goal.color}-600 to-${goal.color}-800`}`} />
           )}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
           <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-black/20 text-white rounded-full hover:bg-black/40 backdrop-blur-md transition-all z-10 active:scale-90">
             <X size={20} strokeWidth={3} />
           </button>
           <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                 <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/20 text-white backdrop-blur-md border border-white/10`}>
                   {goal.category}
                 </div>
                 {isCompleted && (
                   <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500 text-white flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                     <CheckCircle2 size={10} /> Goal Achieved
                   </div>
                 )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">{goal.title}</h2>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'overview' ? `border-primary-500 text-primary-600` : 'border-transparent text-muted hover:text-foreground'}`}
           >
             <Layout size={14} strokeWidth={3} /> Overview
           </button>
           <button 
             onClick={() => setActiveTab('journal')}
             className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'journal' ? `border-primary-500 text-primary-600` : 'border-transparent text-muted hover:text-foreground'}`}
           >
             <Book size={14} strokeWidth={3} /> Logbook <span className="px-1.5 py-0.5 rounded-md bg-foreground/5 text-[8px]">{goal.notes?.length || 0}</span>
           </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 bg-gray-50/30 dark:bg-black/20 custom-scrollbar">
            {activeTab === 'overview' && (
              <>
                {/* Motivation Poster Style */}
                {goal.motivation && (
                    <div className="relative group perspective">
                        <div className={`absolute inset-0 translate-x-1 translate-y-1 rounded-3xl blur-xl opacity-20 bg-primary-600`} />
                        <div className={`relative bg-surface rounded-3xl p-8 border border-foreground/5 shadow-xl overflow-hidden`}>
                            <Quote size={48} className="absolute -top-4 -left-4 text-primary-500/10 rotate-12" />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                               <div className="flex items-center gap-2">
                                  <Sparkles size={14} className="text-primary-500 animate-pulse" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500">The Mission Statement</span>
                                  <Sparkles size={14} className="text-primary-500 animate-pulse" />
                               </div>
                               <p className="text-2xl sm:text-3xl font-serif font-black text-foreground italic leading-tight tracking-tight px-4">
                                  "{goal.motivation}"
                                </p>
                                <div className="h-px w-12 bg-primary-500/30" />
                                {goal.description?.includes('IDENTITY:') && (
                                   <div className="pt-2">
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Identity Shift</p>
                                      <p className="text-sm font-bold text-foreground">
                                         {goal.description.split('IDENTITY:')[1]?.split('\n')[0]?.trim()}
                                      </p>
                                   </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Visual */}
                <div className="bg-surface rounded-[2.5rem] p-8 border border-foreground/5 shadow-sm space-y-8">
                   <div className="flex justify-between items-center">
                     <div>
                       <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Velocity Report</h3>
                       <p className="text-xs text-muted font-bold mt-1">Status: {goal.status.replace('-', ' ')}</p>
                     </div>
                     <div className="text-right">
                        <span className={`text-4xl font-black tracking-tighter ${theme.text}`}>{progress}%</span>
                     </div>
                   </div>
                   
                   <div className="relative h-4 w-full bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 p-1">
                     <div 
                       className={`h-full rounded-full transition-all duration-[2s] ease-out shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] ${theme.progress}`}
                       style={{ width: `${progress}%` }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
                   </div>
                   
                   {goal.type === 'numeric' && (
                     <div className="flex gap-3 items-center bg-foreground/5 p-4 rounded-3xl border border-foreground/5 group hover:bg-foreground/10 transition-all">
                        <Target size={20} className="text-muted group-hover:text-primary-500 transition-colors" />
                        <div className="flex-1 flex flex-col">
                           <span className="text-[8px] font-black text-muted uppercase tracking-widest">Update Value ({goal.unit})</span>
                           <input 
                             type="number" 
                             value={updateValue}
                             onChange={(e) => setUpdateValue(e.target.value)}
                             className="bg-transparent border-none text-xl font-black text-foreground focus:ring-0 p-0"
                           />
                        </div>
                        <button onClick={handleUpdateProgress} className={`p-4 ${theme.bg} text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-500/20`}>
                           <Zap size={18} fill="currentColor" />
                        </button>
                     </div>
                   )}
                </div>

                {/* Timeline & Metadata */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-6 rounded-[2rem] border border-foreground/5 shadow-sm hover:border-primary-500/20 transition-all">
                       <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-2">Target Horizon</p>
                       <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-primary-500" />
                          <span className="text-base font-black tracking-tight text-foreground">{new Date(goal.targetDate).toLocaleDateString()}</span>
                       </div>
                    </div>
                    <div className="bg-surface p-6 rounded-[2rem] border border-foreground/5 shadow-sm hover:border-primary-500/20 transition-all">
                       <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-2">System Priority</p>
                       <div className="flex items-center gap-3">
                          <Flag size={20} className={goal.priority === 'high' ? 'text-red-500' : 'text-primary-500'} />
                          <span className="text-base font-black tracking-tight text-foreground uppercase">{goal.priority}</span>
                       </div>
                    </div>
                </div>

                {/* Strategic Milestones */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-sm font-black uppercase tracking-[0.25em] text-foreground flex items-center gap-2">
                          <Target size={16} className="text-primary-500" /> Strategic Steps
                       </h3>
                       <span className="px-2.5 py-1 bg-foreground/5 rounded-lg text-[9px] font-black text-muted uppercase tracking-widest">{goal.milestones.filter(m=>m.completed).length}/{goal.milestones.length} SECURED</span>
                    </div>
                    
                    <div className="bg-surface rounded-[2.5rem] border border-foreground/5 shadow-sm overflow-hidden divide-y divide-foreground/5">
                       {goal.milestones.map(m => (
                         <div key={m.id} onClick={() => toggleMilestone(goal.id, m.id)} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-foreground/[0.02] transition-all group">
                            <div className={`shrink-0 transition-all duration-500 ${m.completed ? 'text-emerald-500 scale-110' : 'text-muted group-hover:text-primary-400'}`}>
                              {m.completed ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={2.5} />}
                            </div>
                            <span className={`text-sm font-bold tracking-tight flex-1 ${m.completed ? 'text-muted line-through opacity-60' : 'text-foreground'}`}>{m.title}</span>
                         </div>
                       ))}
                       {goal.milestones.length === 0 && <div className="p-12 text-center text-muted text-xs font-medium italic opacity-50 uppercase tracking-widest">No milestones defined. Break it down.</div>}
                       
                       <div className="p-4 bg-foreground/[0.02] flex gap-3">
                           <input 
                              type="text" 
                              value={newMilestone}
                              onChange={e => setNewMilestone(e.target.value)}
                              placeholder="Add next strategic move..."
                              className="flex-1 px-5 py-3 text-sm rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary-500/20 font-bold text-foreground"
                              onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                           />
                           <button onClick={handleAddMilestone} className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                             <Plus size={20} strokeWidth={3} />
                           </button>
                        </div>
                    </div>
                </div>

                {/* Analysis / Fail Points */}
                {goal.description && (
                    <div className="bg-surface rounded-3xl p-8 border border-foreground/5">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">Strategic Analysis</h3>
                       <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap font-medium">{goal.description}</p>
                    </div>
                )}
              </>
            )}

            {activeTab === 'journal' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <form onSubmit={handleAddNote} className="bg-surface p-6 rounded-[2.5rem] border border-foreground/5 shadow-sm">
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-4">Log Breakthrough</h3>
                    <textarea 
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      placeholder="Capture insights, hurdles, or tactical shifts..."
                      className="w-full p-5 rounded-[2rem] bg-foreground/5 border-none outline-none focus:ring-2 focus:ring-primary-500/20 text-sm mb-4 h-32 resize-none text-foreground font-medium"
                    />
                    <div className="flex justify-end">
                       <button 
                         type="submit"
                         disabled={!noteContent.trim()}
                         className={`px-8 py-3.5 ${theme.bg} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-3 shadow-xl transition-all active:scale-95`}
                       >
                         <Send size={14} /> Record Entry
                       </button>
                    </div>
                 </form>

                 <div className="space-y-6">
                    {goal.notes && goal.notes.length > 0 ? [...goal.notes].map(note => (
                       <div key={note.id} className="group flex gap-5">
                          <div className="flex flex-col items-center pt-2">
                             <div className="w-3 h-3 rounded-full bg-primary-500/20 border border-primary-500 ring-4 ring-primary-500/5 group-hover:scale-125 transition-transform" />
                             <div className="w-0.5 flex-1 bg-foreground/5 my-2 group-last:hidden" />
                          </div>
                          <div className="flex-1 pb-6">
                             <div className="bg-surface p-6 rounded-3xl border border-foreground/5 shadow-sm relative group/card hover:border-primary-500/20 transition-all">
                                <p className="text-sm text-foreground font-medium whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                <div className="flex justify-between items-center mt-5 pt-4 border-t border-foreground/5">
                                   <p className="text-[8px] font-black text-muted uppercase tracking-widest">{new Date(note.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setNoteToDelete(note.id); }}
                                      className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>
                    )) : (
                       <div className="text-center py-20 bg-surface rounded-[3rem] border-2 border-dashed border-foreground/5">
                          <StickyNote size={48} className="mx-auto text-muted mb-4 opacity-20" />
                          <p className="text-muted text-[10px] font-black uppercase tracking-[0.3em]">Chronicle Empty</p>
                       </div>
                    )}
                 </div>
              </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-foreground/5 bg-surface/50 backdrop-blur-xl flex gap-4 shrink-0 pb-safe">
           <button onClick={onEdit} className="flex-1 py-4 bg-foreground text-surface dark:bg-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
             <Edit2 size={16} strokeWidth={3} /> Adjust Parameters
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setShowGoalDeleteConfirm(true); }} 
             className="px-5 py-4 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      <ConfirmationModal isOpen={showGoalDeleteConfirm} onClose={() => setShowGoalDeleteConfirm(false)} onConfirm={handleGoalDelete} title="Purge Goal" message="All milestones and logged history will be permanently deleted." type="danger" confirmText="Purge" />
      <ConfirmationModal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} onConfirm={handleNoteDelete} title="Purge Entry" message="Delete this insight from history?" type="danger" confirmText="Purge" />
    </div>
  );
};
