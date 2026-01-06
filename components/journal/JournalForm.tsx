
import React, { useState, useRef } from 'react';
import { X, Calendar, Lock, Unlock, Save, Tag, Trash2, ArrowLeft, Edit3, Sparkles, Maximize, Minimize, Activity, Send, Camera, Image as ImageIcon } from 'lucide-react';
import { JournalEntry, MoodType, JournalTemplate } from '../../types';
import { RichEditor } from './RichEditor';
import { PinModal } from './PinModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface JournalFormProps {
  initialData?: Partial<JournalEntry>;
  onSave: (entry: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const MOODS: { id: MoodType; label: string; emoji: string, color: string, ring: string, bg: string }[] = [
  { id: 'happy', label: 'Happy', emoji: '🙂', color: '#fbbf24', ring: 'ring-amber-500', bg: 'bg-amber-500/10' },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: '#f59e0b', ring: 'ring-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'grateful', label: 'Grateful', emoji: '😇', color: '#10b981', ring: 'ring-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#3b82f6', ring: 'ring-blue-500', bg: 'bg-blue-500/10' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#94a3b8', ring: 'ring-slate-400', bg: 'bg-slate-400/10' },
  { id: 'tired', label: 'Tired', emoji: '🥱', color: '#6366f1', ring: 'ring-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'sad', label: 'Sad', emoji: '😔', color: '#4f46e5', ring: 'ring-indigo-700', bg: 'bg-indigo-700/10' },
  { id: 'anxious', label: 'Anxious', emoji: '😟', color: '#f97316', ring: 'ring-orange-500', bg: 'bg-orange-500/10' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: '#ef4444', ring: 'ring-red-600', bg: 'bg-red-600/10' },
];

const TEMPLATES: JournalTemplate[] = [
  { id: 'daily', name: 'Daily Reflection', icon: '📝', prompts: [], content: '<h2>Highlights</h2><p></p><h2>Wins</h2><p></p>' },
  { id: 'gratitude', name: 'Gratitude', icon: '🙏', prompts: [], content: '<h2>I am grateful for...</h2><ul><li></li></ul>' },
];

export const JournalForm: React.FC<JournalFormProps> = ({ initialData, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState<MoodType>(initialData?.mood || 'neutral');
  const [energyLevel, setEnergyLevel] = useState(initialData?.energyLevel || 5);
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  
  const [securityPin, setSecurityPin] = useState(initialData?.securityPin || '');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!initialData?.id && !content);
  const [isZenMode, setIsZenMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'details'>('editor');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMoodData = MOODS.find(m => m.id === mood) || MOODS[4];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && images.length < 2) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      title: title || new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
      content,
      mood,
      energyLevel,
      date: new Date(date).toISOString(),
      tags,
      images,
      isLocked: !!securityPin,
      securityPin,
      isFavorite: initialData?.isFavorite || false,
    });
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const applyTemplate = (tpl: JournalTemplate) => {
    setContent(tpl.content);
    if (!title) setTitle(tpl.name);
    setShowTemplates(false);
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-300">
        <div 
          className={`
            bg-white dark:bg-black w-full shadow-2xl flex flex-col relative transition-all duration-500 overflow-hidden
            ${isZenMode ? 'fixed inset-0 sm:inset-0 rounded-none z-[110]' : 'max-w-5xl h-full sm:h-[85vh] sm:rounded-[2.5rem] mt-16 sm:mt-0'}
          `}
          style={{ '--mood-glow': `${selectedMoodData.color}15` } as any}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[140px] transition-all duration-1000" style={{ backgroundColor: selectedMoodData.color, opacity: 0.1 }} />
             <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-1000" style={{ backgroundColor: selectedMoodData.color, opacity: 0.05 }} />
          </div>
          
          {/* Header */}
          {!isZenMode && (
            <div className="flex justify-between items-center px-4 md:px-8 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl shrink-0 z-50">
              <div className="flex items-center gap-3">
                 <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-500 transition-all">
                    <ArrowLeft size={20} strokeWidth={2.5} />
                 </button>
                 <div className="hidden xs:flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Journal</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[120px]">{formattedDate}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <div className="flex md:hidden bg-gray-100 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800">
                    <button onClick={() => setMobileTab('editor')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mobileTab === 'editor' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>Write</button>
                    <button onClick={() => setMobileTab('details')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mobileTab === 'details' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>Context</button>
                 </div>

                 <div className="hidden sm:flex items-center gap-1">
                    <button onClick={() => setIsZenMode(true)} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Zen Mode"><Maximize size={18} /></button>
                    <button onClick={() => securityPin ? setSecurityPin('') : setIsPinModalOpen(true)} className={`p-2 rounded-lg transition-all ${securityPin ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-400 hover:bg-gray-100'}`} title="Lock"><Lock size={18} /></button>
                 </div>
                 
                 <button onClick={handleSubmit} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
                    <Send size={16} strokeWidth={3} /> <span>Done</span>
                 </button>
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden relative">
               {isZenMode && (
                  <div className="absolute top-6 right-6 z-50 animate-in fade-in duration-700">
                     <button onClick={() => setIsZenMode(false)} className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-full text-white shadow-2xl transition-all"><Minimize size={20} strokeWidth={3} /></button>
                  </div>
               )}

               <div className={`flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-white dark:bg-black transition-all duration-700 ${mobileTab === 'editor' ? 'flex' : 'hidden md:flex'}`}>
                  <div className={`max-w-3xl mx-auto w-full px-6 pb-32 transition-all duration-700 ${isZenMode ? 'py-16 md:py-24' : 'py-8 md:py-12'}`}>
                     <input 
                       type="text" 
                       value={title} 
                       onChange={(e) => setTitle(e.target.value)}
                       placeholder="Title..."
                       className="w-full text-3xl md:text-5xl font-serif font-black text-black dark:text-white placeholder-gray-100 dark:placeholder-gray-900 bg-transparent border-none outline-none leading-tight mb-8"
                     />

                     {showTemplates && !isZenMode && (
                         <div className="mb-10 p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-2">
                            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Templates</h3>
                            <div className="grid grid-cols-2 gap-3">
                               {TEMPLATES.map(t => (
                                  <button key={t.id} onClick={() => applyTemplate(t)} className="flex items-center gap-3 p-3 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-black transition-all text-left">
                                     <span className="text-xl">{t.icon}</span>
                                     <span className="font-black text-[10px] uppercase tracking-tight dark:text-white">{t.name}</span>
                                  </button>
                               ))}
                            </div>
                         </div>
                     )}

                     <RichEditor initialContent={content} onChange={setContent} placeholder="Write something..." className="min-h-[40vh]" />
                  </div>
               </div>

               {!isZenMode && (
                 <div className={`w-full md:w-[320px] lg:w-[360px] bg-white dark:bg-black border-l border-gray-100 dark:border-gray-800 h-full overflow-y-auto custom-scrollbar p-6 ${mobileTab === 'details' ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
                    <div className="space-y-10 pb-20">
                        {/* Visual Capture Section */}
                        <div>
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Daily Imagery (Max 2)</label>
                           <div className="grid grid-cols-2 gap-3">
                              {images.map((img, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group/img bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <img src={img} className="w-full h-full object-cover" alt="Capture" />
                                    <button 
                                       type="button"
                                       onClick={() => removeImage(idx)}
                                       className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-md"
                                    >
                                       <X size={12} strokeWidth={3} />
                                    </button>
                                 </div>
                              ))}
                              {images.length < 2 && (
                                 <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                                 >
                                    <ImageIcon size={24} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Select</span>
                                 </button>
                              )}
                              <input 
                                 ref={fileInputRef}
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 onChange={handleImageUpload}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Mood</label>
                           <div className="grid grid-cols-3 gap-2">
                              {MOODS.map(m => (
                                 <button key={m.id} onClick={() => setMood(m.id)} className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all group ${mood === m.id ? `bg-white dark:bg-gray-900 border-transparent shadow-lg ${m.ring} ring-2 ring-offset-1 dark:ring-offset-black scale-105` : 'bg-gray-50 dark:bg-gray-900/50 border-transparent hover:border-gray-200'}`}>
                                    <span className="text-2xl transition-transform group-hover:scale-110">{m.emoji}</span>
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                           <div className="flex justify-between items-center mb-5">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Energy</label>
                              <span className="text-[10px] font-black text-black dark:text-white tabular-nums">{energyLevel}/10</span>
                           </div>
                           <div className="flex items-end gap-1.5 h-10 mb-1">
                              {Array.from({ length: 10 }).map((_, i) => (
                                 <button key={i} type="button" onClick={() => setEnergyLevel(i + 1)} className={`flex-1 rounded-full transition-all duration-300 ${i < energyLevel ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'}`} style={{ height: `${40 + (i * 6)}%`, opacity: i < energyLevel ? 1 : 0.2 }} />
                              ))}
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-black dark:text-white text-[10px] font-black uppercase tracking-widest outline-none" />
                           </div>

                           <div>
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tags</label>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                 {tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-[9px] font-black uppercase text-primary-600 dark:text-primary-400">
                                       #{tag}
                                       <button onClick={() => setTags(tags.filter(t => t !== tag))}><X size={10} strokeWidth={3} /></button>
                                    </span>
                                 ))}
                              </div>
                              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add labels..." className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase text-black dark:text-white focus:ring-1 focus:ring-primary-500/20 outline-none" />
                           </div>
                        </div>

                        {initialData?.id && (
                          <div className="pt-6">
                             <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 border border-red-100 dark:border-red-900/50 text-red-500 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Purge Entry
                             </button>
                          </div>
                        )}
                    </div>
                 </div>
               )}
          </div>
        </div>
      </div>

      <PinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} isSettingMode={true} onVerify={(pin) => { setSecurityPin(pin); setIsPinModalOpen(false); }} />
      <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => { if (initialData?.id && onDelete) { onDelete(initialData.id); onClose(); } }} title="Confirm Deletion" message="Permanently remove this entry?" type="danger" confirmText="Delete" />
    </>
  );
};
