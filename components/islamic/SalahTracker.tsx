
import React, { useMemo, useEffect, useState } from 'react';
import { Check, Clock, Compass, Sun, Moon, Star, Sunrise } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { getPrayerTimes } from '../../utils/islamicUtils';
import { PrayerName, DailyPrayers, LanguageCode } from '../../types';

interface SalahTrackerProps {
  dateKey?: string;
  gregorianDate?: Date;
}

export const SalahTracker: React.FC<SalahTrackerProps> = ({ dateKey, gregorianDate }) => {
  const { getPrayersForDate, updatePrayerStatus, qiblaDirection, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [nextPrayerIndex, setNextPrayerIndex] = useState<number | null>(null);

  // Use passed date or fallback to today
  const targetDate = gregorianDate || new Date();
  const targetKey = dateKey || ""; 
  const isTodayView = !dateKey || dateKey === new Date().toISOString().split('T')[0];

  // Get data for specific day
  const dailyData = targetKey ? getPrayersForDate(targetKey) : getPrayersForDate(""); 
  
  const dailyPrayerTimes = useMemo(() => {
     return getPrayerTimes(targetDate, islamicSettings.location.lat, islamicSettings.location.lng);
  }, [targetDate, islamicSettings.location]);

  const fardhPrayers: { key: PrayerName; label: string; icon: any; color: string }[] = [
    { key: 'Fajr', label: 'Fajr', icon: Sunrise, color: 'text-orange-400' },
    { key: 'Dhuhr', label: 'Dhuhr', icon: Sun, color: 'text-yellow-500' },
    { key: 'Asr', label: 'Asr', icon: Sun, color: 'text-amber-500' },
    { key: 'Maghrib', label: 'Maghrib', icon: Moon, color: 'text-indigo-400' },
    { key: 'Isha', label: 'Isha', icon: Star, color: 'text-slate-400' },
  ];

  // Calculate Next Prayer
  useEffect(() => {
    if (!isTodayView) {
        setNextPrayerIndex(null);
        return;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;
    fardhPrayers.forEach((p, idx) => {
        const timeStr = dailyPrayerTimes[p.key];
        if (timeStr && !foundNext) {
            const [h, m] = timeStr.split(':').map(Number);
            const pMinutes = h * 60 + m;
            if (pMinutes > currentMinutes) {
                setNextPrayerIndex(idx);
                foundNext = true;
            }
        }
    });
    if (!foundNext) setNextPrayerIndex(0); 
  }, [dailyPrayerTimes, isTodayView]);


  return (
    <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col h-fit">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">{t.deen.fardh}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-muted">
                    <Compass size={14} style={{ transform: `rotate(${qiblaDirection}deg)` }} className="text-emerald-500 transition-transform duration-700" />
                    <span>Qibla {Math.round(qiblaDirection)}°</span>
                </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Clock size={20} />
            </div>
        </div>

        {/* Prayer List */}
        <div className="p-4 space-y-3">
          {fardhPrayers.map((prayer, idx) => {
            const prayerKey = prayer.key.toLowerCase() as keyof DailyPrayers;
            const qadhaKey = `${prayerKey}Qadha` as keyof DailyPrayers;
            
            const isDone = dailyData[prayerKey] as boolean;
            const isQadha = dailyData[qadhaKey] as boolean;
            const time = dailyPrayerTimes[prayer.key];
            const isNext = idx === nextPrayerIndex;
            
            return (
              <div key={prayer.key} className="relative group">
                {/* Active Indicator Line */}
                {isNext && <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}

                <button
                  onClick={() => {
                    if(isQadha) updatePrayerStatus(qadhaKey, false, targetKey);
                    updatePrayerStatus(prayerKey, !isDone, targetKey);
                  }}
                  className={`
                    w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-300
                    ${isNext ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-sm scale-[1.02] z-10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                    ${isDone ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/30' : ''}
                    ${isQadha ? 'bg-red-50/50 dark:bg-red-900/5 border-red-100 dark:border-red-900/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                        {isDone ? <Check size={18} strokeWidth={4} /> : <prayer.icon size={18} className={isNext ? prayer.color : ''} />}
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold ${isDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>{prayer.label}</h3>
                          {isNext && <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 rounded-md">Next</span>}
                          {isQadha && <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-1.5 rounded-md">Missed</span>}
                      </div>
                      <p className={`text-xs font-mono font-medium ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                         {time || '--:--'}
                      </p>
                    </div>
                  </div>

                  {!isDone && (
                     <div 
                        onClick={(e) => { e.stopPropagation(); updatePrayerStatus(qadhaKey, !isQadha, targetKey); }}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-colors ${isQadha ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-red-100 hover:text-red-500'}`}
                     >
                        {isQadha ? 'Qadha' : 'Missed?'}
                     </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
    </div>
  );
};
