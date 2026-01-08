import React, { useMemo, useEffect, useState } from 'react';
import { Check, Clock, Compass, Sun, Moon, Star, Sunrise, X } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { getPrayerTimes } from '../../utils/islamicUtils';
import { PrayerName, DeenStatus, LanguageCode, DailyPrayers } from '../../types';

interface SalahTrackerProps {
  dateKey?: string;
  gregorianDate?: Date;
}

export const SalahTracker: React.FC<SalahTrackerProps> = ({ dateKey, gregorianDate }) => {
  const { getPrayersForDate, updatePrayerStatus, qiblaDirection, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [nextPrayerIndex, setNextPrayerIndex] = useState<number | null>(null);

  const targetDate = gregorianDate || new Date();
  const targetKey = dateKey || ""; 
  const isTodayView = !dateKey || dateKey === new Date().toISOString().split('T')[0];

  const dailyData = getPrayersForDate(targetKey);
  
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

  useEffect(() => {
    if (!isTodayView) { setNextPrayerIndex(null); return; }
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

  const StatusSelector = ({ current, onSelect }: { current: DeenStatus, onSelect: (s: DeenStatus) => void }) => {
    return (
      <div className="flex bg-foreground/[0.04] dark:bg-foreground/[0.06] p-1 rounded-xl gap-1 border border-foreground/[0.02] shrink-0">
        <button 
          onClick={() => onSelect(current === 'on-time' ? 'none' : 'on-time')}
          className={`relative p-2 rounded-lg transition-all active:scale-90 ${current === 'on-time' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          <Check size={16} strokeWidth={4} />
        </button>
        <button 
          onClick={() => onSelect(current === 'late' ? 'none' : 'late')}
          className={`relative p-2 rounded-lg transition-all active:scale-90 ${current === 'late' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-400 hover:text-amber-500'}`}
        >
          <Clock size={16} strokeWidth={3.5} />
        </button>
        <button 
          onClick={() => onSelect(current === 'missed' ? 'none' : 'missed')}
          className={`relative p-2 rounded-lg transition-all active:scale-90 ${current === 'missed' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400 hover:text-rose-500'}`}
        >
          <X size={16} strokeWidth={4} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col h-fit">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
            <div>
                <h2 className="text-sm sm:text-lg font-black text-foreground uppercase tracking-tight">{t.deen.fardh}</h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-muted">
                    <Compass size={12} style={{ transform: `rotate(${qiblaDirection}deg)` }} className="text-emerald-500 transition-transform duration-700" />
                    <span>{Math.round(qiblaDirection)}°</span>
                </div>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Clock size={16} sm-size={20} />
            </div>
        </div>

        <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
          {fardhPrayers.map((prayer, idx) => {
            const prayerKey = prayer.key.toLowerCase() as keyof Omit<DailyPrayers, 'date' | 'sunnahs'>;
            const status = dailyData[prayerKey] as DeenStatus;
            const time = dailyPrayerTimes[prayer.key];
            const isNext = idx === nextPrayerIndex;
            
            return (
              <div key={prayer.key} className="relative group">
                <div className={`
                  w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-500 gap-3
                  ${isNext ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  ${status === 'on-time' ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/30' : ''}
                  ${status === 'late' ? 'bg-amber-50/50 dark:bg-amber-900/5 border-amber-100 dark:border-amber-900/30' : ''}
                  ${status === 'missed' ? 'bg-rose-50/50 dark:bg-rose-900/5 border-rose-100 dark:border-rose-900/30' : ''}
                `}>
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${status === 'on-time' ? 'bg-emerald-500 text-white shadow-sm' : status === 'late' ? 'bg-amber-500 text-white shadow-sm' : status === 'missed' ? 'bg-rose-500 text-white shadow-sm' : 'bg-foreground/5 text-gray-400'}`}>
                        {status === 'on-time' ? <Check size={18} strokeWidth={4} /> : 
                         status === 'late' ? <Clock size={18} strokeWidth={3} /> :
                         status === 'missed' ? <X size={18} strokeWidth={3} /> :
                         <prayer.icon size={18} className={isNext ? prayer.color : ''} />}
                    </div>
                    
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2 overflow-hidden">
                          <h3 className="text-xs sm:text-base font-black text-foreground tracking-tight uppercase leading-none truncate">{prayer.label}</h3>
                          {isNext && <span className="shrink-0 text-[7px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">Next</span>}
                      </div>
                      <p className={`text-[10px] font-mono font-bold mt-1 ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
                         {time || '--:--'}
                      </p>
                    </div>
                  </div>

                  <StatusSelector 
                    current={status} 
                    onSelect={(s) => updatePrayerStatus(prayerKey, s, targetKey)} 
                  />
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
};