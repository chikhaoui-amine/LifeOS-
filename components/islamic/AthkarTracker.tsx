import React, { useMemo } from 'react';
import { Sun, Moon, Star, Check, X, Sparkles } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { DeenStatus, LanguageCode } from '../../types';

interface AthkarTrackerProps {
  dateKey?: string;
}

export const AthkarTracker: React.FC<AthkarTrackerProps> = ({ dateKey }) => {
  const { getAdhkarForDate, updateAdhkarStatus } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const targetKey = dateKey || "";
  const dailyAdhkar = getAdhkarForDate(targetKey);
  
  const StatusSelector = ({ current, onSelect }: { current: DeenStatus, onSelect: (s: DeenStatus) => void }) => {
    return (
      <div className="flex bg-foreground/[0.03] dark:bg-foreground/[0.05] p-0.5 rounded-xl gap-0.5 border border-foreground/[0.02] shrink-0">
        <button 
          onClick={() => onSelect(current === 'on-time' ? 'none' : 'on-time')}
          className={`p-2 rounded-lg transition-all active:scale-90 ${current === 'on-time' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          <Check size={14} strokeWidth={4} />
        </button>
        <button 
          onClick={() => onSelect(current === 'missed' ? 'none' : 'missed')}
          className={`p-2 rounded-lg transition-all active:scale-90 ${current === 'missed' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400 hover:text-rose-500'}`}
        >
          <X size={14} strokeWidth={4} />
        </button>
      </div>
    );
  };

  const renderCard = (label: string, status: DeenStatus, onSelect: (s: DeenStatus) => void, Icon: any) => {
    const isDone = status === 'on-time';
    const isMissed = status === 'missed';

    return (
      <div className={`
           relative w-full p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border transition-all duration-500 group
           ${isDone ? 'bg-emerald-50/20 dark:bg-emerald-900/5 border-emerald-500/10 shadow-sm' : 
             isMissed ? 'bg-rose-50/20 dark:bg-rose-900/5 border-rose-500/10 shadow-sm' :
             'bg-surface border-foreground/[0.05] hover:border-foreground/10'}
      `}>
         <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
               <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${isDone ? 'bg-emerald-500 text-white' : isMissed ? 'bg-rose-500 text-white' : `bg-foreground/[0.05] text-muted`}`}>
                  <Icon size={18} sm-size={22} fill={status !== 'none' ? "currentColor" : "none"} strokeWidth={2.5} />
               </div>
               <div className="min-w-0">
                  <h4 className="font-black text-[11px] sm:text-sm text-foreground uppercase tracking-tight truncate leading-tight">{label}</h4>
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isDone ? 'text-emerald-500' : isMissed ? 'text-rose-500' : 'text-muted opacity-40'}`}>
                     {status === 'none' ? 'Ready' : isDone ? 'Done' : 'Missed'}
                  </p>
               </div>
            </div>
            
            <StatusSelector current={status} onSelect={onSelect} />
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
       <div className="flex items-center gap-2 px-1 mb-1">
          <div className="p-1 bg-amber-500/10 rounded-lg"><Sparkles size={12} className="text-amber-500 animate-pulse" /></div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-muted">{t.deen.adhkar}</h3>
       </div>
       
       <div className="grid grid-cols-1 gap-2.5">
          {renderCard(t.deen.morningAdhkar, dailyAdhkar.morningStatus, (s) => updateAdhkarStatus('morning', s, targetKey), Sun)}
          {renderCard(t.deen.eveningAdhkar, dailyAdhkar.eveningStatus, (s) => updateAdhkarStatus('evening', s, targetKey), Moon)}
          {renderCard(t.deen.beforeSleep, dailyAdhkar.nightStatus, (s) => updateAdhkarStatus('night', s, targetKey), Star)}
       </div>
    </div>
  );
};