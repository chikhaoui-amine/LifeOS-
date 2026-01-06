
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Moon, Star, BarChart3, Quote } from 'lucide-react';
import { useIslamic } from '../context/IslamicContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { SalahTracker } from '../components/islamic/SalahTracker';
import { SunnahTracker } from '../components/islamic/SunnahTracker';
import { AthkarTracker } from '../components/islamic/AthkarTracker';
import { QuranTracker } from '../components/islamic/QuranTracker';
import { IslamicStats } from '../components/islamic/IslamicStats';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getHijriDate, getHijriKey, getIslamicHoliday, getDaysUntilHijriEvent } from '../utils/islamicUtils';
import { formatDateKey, isToday } from '../utils/dateUtils';
import { LanguageCode } from '../types';

const Deen: React.FC = () => {
  const { loading, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const dateStrip = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = -14; i <= 14; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        const index = dateStrip.findIndex(d => formatDateKey(d) === formatDateKey(selectedDate));
        if (index !== -1) {
            const el = scrollRef.current.children[index] as HTMLElement;
            if (el) {
                const scrollLeft = el.offsetLeft - (scrollRef.current.clientWidth / 2) + (el.clientWidth / 2);
                scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }
  }, [selectedDate, dateStrip]);
  
  const selectedHijri = useMemo(() => getHijriDate(selectedDate, islamicSettings.hijriAdjustment), [selectedDate, islamicSettings.hijriAdjustment]);
  const selectedDateKey = useMemo(() => getHijriKey(selectedDate, islamicSettings.hijriAdjustment), [selectedDate, islamicSettings.hijriAdjustment]);
  const selectedHoliday = useMemo(() => getIslamicHoliday(selectedHijri.day, selectedHijri.month), [selectedHijri]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const todayHijri = getHijriDate(today, islamicSettings.hijriAdjustment);
    
    return [
      { name: 'Ramadan', days: getDaysUntilHijriEvent(9, 1, todayHijri, islamicSettings.hijriAdjustment), color: 'bg-emerald-500' },
      { name: 'Eid al-Fitr', days: getDaysUntilHijriEvent(10, 1, todayHijri, islamicSettings.hijriAdjustment), color: 'bg-amber-500' },
      { name: 'Eid al-Adha', days: getDaysUntilHijriEvent(12, 10, todayHijri, islamicSettings.hijriAdjustment), color: 'bg-blue-500' },
    ].sort((a, b) => a.days - b.days);
  }, [islamicSettings.hijriAdjustment]);

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-32 w-full">
      
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#022c22] text-white shadow-2xl shadow-emerald-900/20">
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: `radial-gradient(circle at 50% 120%, #10b981 0%, transparent 50%), radial-gradient(circle at 0% 0%, #34d399 0%, transparent 30%)` }} 
         />
         <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between items-start gap-6 sm:gap-8">
            <div className="space-y-2 w-full">
               <div className="flex items-center gap-2 text-emerald-200 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
                  <Moon size={10} className="fill-current" />
                  <span>{t.deen.title}</span>
               </div>
               <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight leading-none text-white drop-shadow-md">
                  {selectedHijri.day} {selectedHijri.monthName}
               </h1>
               <div className="flex items-center justify-between">
                  <p className="text-emerald-100/60 text-base sm:text-lg font-medium tracking-wide">
                     {selectedHijri.year} AH
                  </p>
                  {selectedHoliday && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 font-bold text-[10px]">
                       <Star size={10} className="fill-current" /> {selectedHoliday.name}
                    </div>
                  )}
               </div>
            </div>

            {/* Scrollable Date Strip */}
            <div className="w-full bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-2 sm:p-3 overflow-hidden">
               <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1 snap-x">
                  {dateStrip.map((date, i) => {
                     const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                     const isDateToday = isToday(date);
                     return (
                        <button
                           key={i}
                           onClick={() => setSelectedDate(date)}
                           className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] h-14 sm:h-16 rounded-2xl transition-all shrink-0 snap-center ${isSelected ? 'bg-white text-emerald-900 shadow-xl scale-105 z-10' : 'text-emerald-100/60 hover:bg-white/10 hover:text-white'}`}
                        >
                           <span className="text-[8px] font-bold uppercase tracking-wider mb-0.5">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0,3)}</span>
                           <span className={`text-lg sm:text-xl font-black ${isDateToday && !isSelected ? 'text-amber-400' : ''}`}>{date.getDate()}</span>
                           {isDateToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-emerald-900' : 'bg-amber-400'}`} />}
                        </button>
                     )
                  })}
               </div>
            </div>
         </div>
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
         <div className="lg:col-span-3 space-y-6">
            <SalahTracker dateKey={selectedDateKey} gregorianDate={selectedDate} />
            <SunnahTracker dateKey={selectedDateKey} />
         </div>

         <div className="lg:col-span-6 space-y-6">
            <QuranTracker />
            <IslamicStats />
         </div>

         <div className="lg:col-span-3 space-y-6">
            <AthkarTracker dateKey={selectedDateKey} />
            <div className="bg-surface rounded-[2rem] p-6 border border-foreground/5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-primary-600 dark:text-primary-400">
                    <Quote size={20} className="fill-current opacity-20" />
                    <h3 className="font-bold text-foreground">Reflection</h3>
                </div>
                <p className="text-sm text-muted font-serif italic leading-relaxed">
                   "He who remembers his Lord and he who does not are like the living and the dead."
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Deen;
