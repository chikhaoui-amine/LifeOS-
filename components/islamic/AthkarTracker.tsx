
import React, { useMemo } from 'react';
import { Sun, Moon, Star, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { getHijriKey } from '../../utils/islamicUtils';
import { LanguageCode } from '../../types';

interface AthkarTrackerProps {
  dateKey?: string;
}

export const AthkarTracker: React.FC<AthkarTrackerProps> = ({ dateKey }) => {
  const { getAdhkarForDate, updateAdhkarProgress, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const targetKey = dateKey || "";
  const dailyAdhkar = targetKey ? getAdhkarForDate(targetKey) : getAdhkarForDate("");
  
  const todayKey = useMemo(() => getHijriKey(new Date(), islamicSettings.hijriAdjustment), [islamicSettings.hijriAdjustment]);
  const isPast = targetKey < todayKey && targetKey !== "";

  const toggleMorning = () => updateAdhkarProgress({ morningCompleted: !dailyAdhkar.morningCompleted }, targetKey);
  const toggleEvening = () => updateAdhkarProgress({ eveningCompleted: !dailyAdhkar.eveningCompleted }, targetKey);
  const toggleNight = () => updateAdhkarProgress({ nightCompleted: !dailyAdhkar.nightCompleted }, targetKey);

  const renderCard = (label: string, isCompleted: boolean, toggle: () => void, Icon: any, themeColor: string, bgColor: string) => {
    const isMissed = isPast && !isCompleted;
    
    return (
      <button
        onClick={toggle}
        className={`
           relative w-full p-4 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden
           ${isCompleted 
              ? 'bg-surface border-transparent shadow-inner' 
              : isMissed 
                 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' 
                 : 'bg-surface border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
           }
        `}
      >
         {isCompleted && (
            <div className={`absolute inset-0 opacity-10 ${bgColor}`} />
         )}
         
         <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
               <div className={`p-2.5 rounded-2xl transition-colors ${isCompleted ? `${bgColor} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  <Icon size={18} fill={isCompleted ? "currentColor" : "none"} />
               </div>
               <div>
                  <h4 className={`font-bold text-sm ${isCompleted ? 'text-foreground' : 'text-gray-500'}`}>{label}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted opacity-70">
                     {isCompleted ? 'Completed' : isMissed ? 'Missed' : 'Pending'}
                  </p>
               </div>
            </div>
            
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? `bg-${themeColor}-500 border-${themeColor}-500 text-white` : 'border-gray-300 dark:border-gray-600'}`}>
               {isCompleted && <Check size={12} strokeWidth={4} />}
            </div>
         </div>
      </button>
    );
  };

  return (
    <div className="space-y-3">
       <div className="flex items-center gap-2 px-1 mb-2">
          <Sparkles size={14} className="text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">{t.deen.adhkar}</h3>
       </div>
       
       <div className="grid grid-cols-1 gap-3">
          {renderCard(t.deen.morningAdhkar, dailyAdhkar.morningCompleted, toggleMorning, Sun, 'orange', 'bg-orange-500')}
          {renderCard(t.deen.eveningAdhkar, dailyAdhkar.eveningCompleted, toggleEvening, Moon, 'indigo', 'bg-indigo-500')}
          {renderCard(t.deen.beforeSleep, dailyAdhkar.nightCompleted, toggleNight, Star, 'purple', 'bg-purple-500')}
       </div>
    </div>
  );
};
