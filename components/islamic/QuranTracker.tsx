import React, { useState, useMemo } from 'react';
import { BookOpen, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Hash, Sparkles } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';

export const QuranTracker: React.FC = () => {
  const { quran, updateQuranProgress, resetQuranProgress } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [activeJuz, setActiveJuz] = useState<number>(() => {
    // Default to the first incomplete Juz
    const firstIncomplete = Array.from({ length: 30 }).findIndex((_, i) => {
      const startRubu = i * 8;
      const juzRubus = Array.from({ length: 8 }, (_, k) => startRubu + k);
      return !juzRubus.every(r => quran.completedRubus.includes(r));
    });
    return firstIncomplete === -1 ? 0 : firstIncomplete;
  });

  const TOTAL_RUBUS = 240; 
  const totalCompleted = quran.completedRubus.length;
  const progressPercentage = Math.round((totalCompleted / TOTAL_RUBUS) * 100);

  const toggleRubu = (rubuIndex: number) => {
    const isCompleted = quran.completedRubus.includes(rubuIndex);
    const newCompleted = isCompleted 
      ? quran.completedRubus.filter(i => i !== rubuIndex)
      : [...quran.completedRubus, rubuIndex];
    updateQuranProgress({ completedRubus: newCompleted });
  };

  const currentJuzRubus = useMemo(() => {
    const start = activeJuz * 8;
    return Array.from({ length: 8 }, (_, i) => ({
      id: start + i,
      label: `Rubu ${i + 1}`,
      isDone: quran.completedRubus.includes(start + i)
    }));
  }, [activeJuz, quran.completedRubus]);

  const juzProgress = currentJuzRubus.filter(r => r.isDone).length;

  return (
    <div className="bg-surface rounded-[2.5rem] border border-[var(--color-border)] shadow-sm flex flex-col overflow-hidden group/quran transition-all hover:shadow-xl hover:shadow-emerald-500/5 h-[480px]">
        {/* Compact Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--color-border)] bg-emerald-500/[0.02] dark:bg-emerald-900/10">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                 <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover/quran:rotate-6 transition-transform">
                    <BookOpen size={18} strokeWidth={2.5} />
                 </div>
                 <h3 className="font-black text-foreground uppercase tracking-tight text-base">{t.deen.quranJourney}</h3>
              </div>
              <button 
                onClick={() => window.confirm("Reset all journey data?") && resetQuranProgress()} 
                className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
              >
                <RefreshCw size={16} />
              </button>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between items-end px-0.5">
                 <div className="space-y-0">
                    <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">Mastery</p>
                    <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">
                       {totalCompleted} <span className="text-[9px] text-muted font-bold tracking-widest">/ {TOTAL_RUBUS}</span>
                    </p>
                 </div>
                 <span className="text-xl font-black text-emerald-500 tracking-tighter">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-foreground/5">
                 <div 
                   className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                   style={{ width: `${progressPercentage}%` }} 
                 />
              </div>
           </div>
        </div>

        {/* Simplified Focused Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
           {/* Juz Navigator */}
           <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-[var(--color-border)]">
              <button 
                onClick={() => setActiveJuz(prev => Math.max(0, prev - 1))}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-emerald-500 transition-all active:scale-90"
              >
                 <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <div className="flex flex-col items-center">
                 <h4 className="text-xl font-black text-foreground tracking-tighter uppercase">Juz {activeJuz + 1}</h4>
                 <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                       <div key={i} className={`w-1 h-1 rounded-full ${i < juzProgress ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => setActiveJuz(prev => Math.min(29, prev + 1))}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-emerald-500 transition-all active:scale-90"
              >
                 <ChevronRight size={20} strokeWidth={3} />
              </button>
           </div>

           {/* Rubu Toggles Grid - More compact */}
           <div className="grid grid-cols-4 gap-2">
              {currentJuzRubus.map((rubu, idx) => (
                 <button
                   key={rubu.id}
                   onClick={() => toggleRubu(rubu.id)}
                   className={`
                     group/rubu relative flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-300
                     ${rubu.isDone 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-emerald-300'}
                   `}
                 >
                    <CheckCircle2 size={16} strokeWidth={3} className={`mb-1 transition-all ${rubu.isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0 group-hover:opacity-40'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${rubu.isDone ? 'text-white' : 'text-gray-500'}`}>R{idx + 1}</span>
                 </button>
              ))}
           </div>

           {/* Motivational Quote - Smaller */}
           <div className="flex items-start gap-3 p-4 bg-amber-50/5 rounded-2xl border border-amber-500/10">
              <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-900/60 dark:text-amber-200/50 leading-relaxed italic">
                 "The best among you are those who learn the Quran and teach it."
              </p>
           </div>
        </div>
        
        {/* Footer Quick Progress - Minimal */}
        <div className="px-6 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border-t border-[var(--color-border)] flex justify-between items-center text-[8px] font-black text-muted uppercase tracking-widest">
           <span>{quran.khatamCount} Khatams</span>
           <span>Last: {new Date(quran.lastReadDate).toLocaleDateString()}</span>
        </div>
    </div>
  );
};