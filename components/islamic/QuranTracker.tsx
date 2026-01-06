
import React, { useState, useMemo } from 'react';
import { BookOpen, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';

export const QuranTracker: React.FC = () => {
  const { quran, updateQuranProgress, resetQuranProgress } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  const [expandedHizb, setExpandedHizb] = useState<number | null>(null);

  const TOTAL_HIZB = 60;
  const RUBUS_PER_HIZB = 4;
  const TOTAL_RUBUS = TOTAL_HIZB * RUBUS_PER_HIZB; 

  const totalCompleted = quran.completedRubus.length;
  const progressPercentage = Math.round((totalCompleted / TOTAL_RUBUS) * 100);

  const toggleRubu = (rubuIndex: number) => {
    const isCompleted = quran.completedRubus.includes(rubuIndex);
    let newCompleted;
    if (isCompleted) {
      newCompleted = quran.completedRubus.filter(i => i !== rubuIndex);
    } else {
      newCompleted = [...quran.completedRubus, rubuIndex];
    }
    updateQuranProgress({ completedRubus: newCompleted });
  };

  return (
    <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col overflow-hidden h-[500px]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50">
           <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                 </div>
                 <div>
                    <h3 className="font-black text-foreground uppercase tracking-tight text-sm">{t.deen.quranJourney}</h3>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{totalCompleted} / {TOTAL_RUBUS} Rubu</p>
                 </div>
              </div>
              <button onClick={resetQuranProgress} className="text-gray-400 hover:text-red-500 transition-colors p-2"><RefreshCw size={16} /></button>
           </div>

           {/* Progress Bar */}
           <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-700" 
                style={{ width: `${progressPercentage}%` }} 
              />
           </div>
           <div className="flex justify-end mt-1">
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">{progressPercentage}% Complete</span>
           </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: TOTAL_HIZB }).map((_, hizbIndex) => {
                 const startRubu = hizbIndex * RUBUS_PER_HIZB;
                 const hizbRubus = Array.from({length: RUBUS_PER_HIZB}, (_, k) => startRubu + k);
                 const completedInHizb = hizbRubus.filter(r => quran.completedRubus.includes(r)).length;
                 const isHizbComplete = completedInHizb === RUBUS_PER_HIZB;
                 
                 return (
                    <div 
                        key={hizbIndex} 
                        className={`
                           p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                           ${isHizbComplete ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-surface border-[var(--color-border)] hover:border-emerald-300 dark:hover:border-emerald-700'}
                        `}
                    >
                        <div className="flex justify-between items-center mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isHizbComplete ? 'text-white/80' : 'text-muted'}`}>Hizb {hizbIndex + 1}</span>
                           {isHizbComplete && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        
                        <div className="flex gap-1">
                           {hizbRubus.map((rubuId, i) => {
                              const isRubuDone = quran.completedRubus.includes(rubuId);
                              return (
                                 <button
                                    key={rubuId}
                                    onClick={() => toggleRubu(rubuId)}
                                    className={`
                                       h-1.5 flex-1 rounded-full transition-all
                                       ${isHizbComplete 
                                          ? 'bg-white/40 hover:bg-white' 
                                          : isRubuDone 
                                             ? 'bg-emerald-500' 
                                             : 'bg-gray-200 dark:bg-gray-700 hover:bg-emerald-200'}
                                    `}
                                    title={`Rubu ${i + 1}`}
                                 />
                              )
                           })}
                        </div>
                    </div>
                 );
              })}
           </div>
        </div>
    </div>
  );
};
