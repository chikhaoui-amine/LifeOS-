import React, { useMemo } from 'react';
import { Moon, Star, Quote, Sparkles } from 'lucide-react';
import { useIslamic } from '../context/IslamicContext';
import { useSettings } from '../context/SettingsContext';
import { useSystemDate } from '../context/SystemDateContext';
import { getTranslation } from '../utils/translations';
import { SalahTracker } from '../components/islamic/SalahTracker';
import { SunnahTracker } from '../components/islamic/SunnahTracker';
import { AthkarTracker } from '../components/islamic/AthkarTracker';
import { QuranTracker } from '../components/islamic/QuranTracker';
import { IslamicStats } from '../components/islamic/IslamicStats';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SystemDateStrip } from '../components/SystemDateStrip';
import { getHijriDate, getHijriKey, getIslamicHoliday } from '../utils/islamicUtils';
import { LanguageCode } from '../types';

const Deen: React.FC = () => {
  const { loading, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const { selectedDateObject } = useSystemDate();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const selectedHijri = useMemo(() => getHijriDate(selectedDateObject, islamicSettings.hijriAdjustment), [selectedDateObject, islamicSettings.hijriAdjustment]);
  const selectedHijriKey = useMemo(() => getHijriKey(selectedDateObject, islamicSettings.hijriAdjustment), [selectedDateObject, islamicSettings.hijriAdjustment]);
  const selectedHoliday = useMemo(() => getIslamicHoliday(selectedHijri.day, selectedHijri.month), [selectedHijri]);

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-700 pb-32 w-full max-w-[1200px] mx-auto">
      
      {/* 1. Hero Section - More compact on mobile */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-[#022c22] text-white shadow-2xl shadow-emerald-900/20 group">
         <div className="absolute inset-0 opacity-25 pointer-events-none group-hover:scale-110 transition-transform duration-[10s]" 
              style={{ backgroundImage: `radial-gradient(circle at 70% 120%, #10b981 0%, transparent 50%), radial-gradient(circle at 10% 0%, #34d399 0%, transparent 30%)` }} 
         />
         <div className="relative z-10 p-6 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-8">
            <div className="space-y-1 sm:space-y-3 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-80">
                  <Moon size={10} className="fill-current" />
                  <span>{t.deen.title}</span>
               </div>
               <h1 className="text-3xl sm:text-7xl font-black font-serif tracking-tight leading-none text-white drop-shadow-2xl">
                  {selectedHijri.day} {selectedHijri.monthName}
               </h1>
               <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-5">
                  <p className="text-emerald-100/60 text-base sm:text-xl font-bold tracking-[0.1em]">
                     {selectedHijri.year} AH
                  </p>
                  <div className="h-3 w-px bg-white/10 hidden sm:block" />
                  <p className="text-emerald-200/40 text-[8px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:block">
                     Tabular Hijri Sync v2.5
                  </p>
               </div>
            </div>

            {selectedHoliday && (
               <div className="inline-flex items-center gap-3 px-5 py-2 sm:px-8 sm:py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl sm:rounded-3xl text-amber-200 font-black text-[10px] sm:text-sm uppercase tracking-widest backdrop-blur-md shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-700">
                  <Star size={16} className="fill-current animate-pulse" /> 
                  <span>{selectedHoliday.name}</span>
               </div>
            )}
         </div>
      </div>

      <SystemDateStrip />

      {/* STRATEGIC STACK - Optimized for mobile flow */}
      
      {/* LINE 1: FARDH + SUNNAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
         <SalahTracker dateKey={selectedHijriKey} gregorianDate={selectedDateObject} />
         <SunnahTracker dateKey={selectedHijriKey} />
      </div>

      {/* LINE 2: QURAN JOURNEY + ADHKAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
         <div className="lg:col-span-7 xl:col-span-8">
            <QuranTracker />
         </div>
         <div className="lg:col-span-5 xl:col-span-4">
            <AthkarTracker dateKey={selectedHijriKey} />
         </div>
      </div>

      {/* LINE 3: CURVES + SYSTEM INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
         <div className="lg:col-span-8">
            <IslamicStats />
         </div>
         <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <div className="bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-foreground/5 shadow-sm relative overflow-hidden group flex-1">
                <div className="absolute -top-4 -left-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                   <Quote size={100} fill="currentColor" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="flex items-center gap-2 mb-4 sm:mb-8 text-primary-600 dark:text-primary-400">
                          <div className="p-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                             <Quote size={16} className="fill-current" />
                          </div>
                          <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-foreground opacity-40">System Insight</h3>
                      </div>
                      <p className="text-xl sm:text-2xl font-serif italic leading-relaxed text-foreground font-black tracking-tight mb-6">
                         "He who remembers his Lord and he who does not are like the living and the dead."
                      </p>
                   </div>
                   <p className="text-[9px] font-black text-muted uppercase tracking-widest text-right">— Sahih Bukhari</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Deen;