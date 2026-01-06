
import React from 'react';
import { Star, Sun, Moon, CheckCircle2, Circle } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { DailyPrayers } from '../../types';

interface SunnahTrackerProps {
  dateKey?: string;
}

export const SunnahTracker: React.FC<SunnahTrackerProps> = ({ dateKey }) => {
  const { getPrayersForDate, updatePrayerStatus } = useIslamic();
  
  // Use passed date or fallback
  const targetKey = dateKey || "";
  const dailyData = targetKey ? getPrayersForDate(targetKey) : getPrayersForDate("");

  const sunnahList = [
    { id: 'sunnahFajr', label: 'Sunnah Fajr', rakats: 2, time: 'Before Fajr', icon: Sun },
    { id: 'duha', label: 'Duha', rakats: '2-8', time: 'Morning', icon: Sun },
    { id: 'sunnahDhuhr', label: 'Sunnah Dhuhr', rakats: '4+2', time: 'With Dhuhr', icon: Sun },
    { id: 'sunnahAsr', label: 'Sunnah Asr', rakats: 4, time: 'Before Asr', icon: Sun },
    { id: 'sunnahMaghrib', label: 'Sunnah Maghrib', rakats: 2, time: 'After Maghrib', icon: Moon },
    { id: 'sunnahIsha', label: 'Sunnah Isha', rakats: 2, time: 'After Isha', icon: Moon },
    { id: 'witr', label: 'Witr', rakats: '1-3', time: 'Night', icon: Star },
    { id: 'tahajjud', label: 'Tahajjud', rakats: '2+', time: 'Late Night', icon: Star },
  ];

  return (
    <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
       <div className="p-5 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
          <h2 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
             <Star size={16} className="text-amber-500 fill-current" /> Sunnah & Nafl
          </h2>
       </div>
       
       <div className="p-3">
          <div className="space-y-1">
             {sunnahList.map((item) => {
                const isDone = dailyData[item.id as keyof DailyPrayers] as boolean;
                
                return (
                   <button
                     key={item.id}
                     onClick={() => updatePrayerStatus(item.id as keyof DailyPrayers, !isDone, targetKey)}
                     className={`
                        w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                        ${isDone ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                     `}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-lg ${isDone ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            <item.icon size={14} />
                         </div>
                         <div className="text-left">
                            <p className={`text-xs font-bold ${isDone ? 'text-amber-900 dark:text-amber-100' : 'text-foreground'}`}>{item.label}</p>
                            <p className="text-[9px] font-medium text-muted">{item.time} • {item.rakats} Rakat</p>
                         </div>
                      </div>
                      
                      <div className={`text-gray-300 dark:text-gray-600 transition-colors ${isDone ? 'text-amber-500 scale-110' : 'group-hover:text-amber-400'}`}>
                         {isDone ? <CheckCircle2 size={18} className="fill-current" /> : <Circle size={18} />}
                      </div>
                   </button>
                );
             })}
          </div>
       </div>
    </div>
  );
};
