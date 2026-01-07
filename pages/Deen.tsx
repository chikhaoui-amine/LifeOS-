
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Moon, Star, Quote } from 'lucide-react';
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
import { getHijriDate, getHijriKey, getIslamicHoliday, getDaysUntilHijriEvent } from '../utils/islamicUtils';
import { formatDateKey, isToday } from '../utils/dateUtils';
import { LanguageCode } from '../types';

const Deen: React.FC = () => {
  const { loading, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const { selectedDate, selectedDateObject } = useSystemDate();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const selectedHijri = useMemo(() => getHijriDate(selectedDateObject, islamicSettings.hijriAdjustment), [selectedDateObject, islamicSettings.hijriAdjustment]);
  const selectedHijriKey = useMemo(() => getHijriKey(selectedDateObject, islamicSettings.hijriAdjustment), [selectedDateObject, islamicSettings.hijriAdjustment]);
  const selectedHoliday = useMemo(() => getIslamicHoliday(selectedHijri.day, selectedHijri.month), [selectedHijri]);

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
         </div>
      </div>

      <SystemDateStrip />

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
         <div className="lg:col-span-3 space-y-6">
            <SalahTracker dateKey={selectedHijriKey} gregorianDate={selectedDateObject} />
            <SunnahTracker dateKey={selectedHijriKey} />
         </div>

         <div className="lg:col-span-6 space-y-6">
            <QuranTracker />
            <IslamicStats />
         </div>

         <div className="lg:col-span-3 space-y-6">
            <AthkarTracker dateKey={selectedHijriKey} />
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
