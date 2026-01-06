
import React, { useMemo, useState } from 'react';
import { Moon, Calendar, ChevronLeft, ChevronRight, Star, BarChart3 } from 'lucide-react';
import { useIslamic } from '../context/IslamicContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { SalahTracker } from '../components/islamic/SalahTracker';
import { AthkarTracker } from '../components/islamic/AthkarTracker';
import { QuranTracker } from '../components/islamic/QuranTracker';
import { TasbihWidget } from '../components/islamic/TasbihWidget';
import { IslamicStats } from '../components/islamic/IslamicStats';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getHijriDate, getHijriKey, getIslamicHoliday, getDaysUntilHijriEvent } from '../utils/islamicUtils';
import { getDaysInMonth, isSameMonth, isToday, formatDateKey } from '../utils/dateUtils';
import { LanguageCode } from '../types';

const Deen: React.FC = () => {
  const { loading, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date()); // Tracks the month being viewed
  const [selectedDate, setSelectedDate] = useState(new Date()); // Tracks the selected day

  // Derived Data
  const calendarDays = useMemo(() => getDaysInMonth(viewDate), [viewDate]);
  
  // Selected Date Hijri Info
  const selectedHijri = useMemo(() => getHijriDate(selectedDate, islamicSettings.hijriAdjustment), [selectedDate, islamicSettings.hijriAdjustment]);
  const selectedDateKey = useMemo(() => getHijriKey(selectedDate, islamicSettings.hijriAdjustment), [selectedDate, islamicSettings.hijriAdjustment]);
  
  // Selected Holiday Check
  const selectedHoliday = useMemo(() => getIslamicHoliday(selectedHijri.day, selectedHijri.month), [selectedHijri]);

  // Upcoming Events (Relative to Today)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const todayHijri = getHijriDate(today, islamicSettings.hijriAdjustment);
    
    return [
      { name: 'Ramadan', days: getDaysUntilHijriEvent(9, 1, todayHijri, islamicSettings.hijriAdjustment), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
      { name: 'Eid al-Fitr', days: getDaysUntilHijriEvent(10, 1, todayHijri, islamicSettings.hijriAdjustment), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
      { name: 'Eid al-Adha', days: getDaysUntilHijriEvent(12, 10, todayHijri, islamicSettings.hijriAdjustment), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    ].sort((a, b) => a.days - b.days);
  }, [islamicSettings.hijriAdjustment]);

  // Handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* Page Title */}
      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2 px-1">
         <Moon size={20} className="fill-current" />
         <h1 className="text-xl font-bold uppercase tracking-wider">{t.deen.title}</h1>
      </div>

      {/* Calendar Card */}
      <div className="bg-surface rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        
        {/* Calendar Header */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
           <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                 <Calendar size={18} className="text-primary-500" /> 
                 {t.deen.hijri}
              </h2>
              <p className="text-xs text-muted font-medium">
                 {selectedHijri.monthName} {selectedHijri.year}
              </p>
           </div>
           <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-muted transition-all shadow-sm">
                 <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold w-20 text-center text-foreground">
                 {viewDate.toLocaleDateString(settings?.preferences?.language, { month: 'short', year: 'numeric' })}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-muted transition-all shadow-sm">
                 <ChevronRight size={16} />
              </button>
           </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-5">
           <div className="grid grid-cols-7 mb-3">
              {weekDays.map(day => (
                 <div key={day} className="text-center text-[10px] font-black text-muted uppercase tracking-wider">
                    {day}
                 </div>
              ))}
           </div>
           <div className="grid grid-cols-7 gap-y-2">
              {calendarDays.map((day, i) => {
                 const isCurrentMonth = isSameMonth(day, viewDate);
                 const isSelected = formatDateKey(day) === formatDateKey(selectedDate);
                 const isDayToday = isToday(day);
                 
                 // Hijri Check for Holiday Indicator
                 const hDate = getHijriDate(day, islamicSettings.hijriAdjustment);
                 const holiday = getIslamicHoliday(hDate.day, hDate.month);
                 
                 return (
                    <div key={i} className="flex justify-center">
                       <button
                         onClick={() => { setSelectedDate(day); }}
                         className={`
                           w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                           ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-700' : 'text-foreground'}
                           ${isSelected ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110 z-10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                           ${isDayToday && !isSelected ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:ring-primary-800' : ''}
                         `}
                       >
                          {day.getDate()}
                          
                          {/* Holiday Indicator */}
                          {holiday && !isSelected && (
                             <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white dark:ring-gray-800 ${holiday.type === 'eid' ? 'bg-amber-500' : 'bg-primary-400'}`} />
                          )}
                          
                          {/* Today Indicator */}
                          {isDayToday && !isSelected && <div className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full" />}
                       </button>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Selected Date Header */}
        <div className="bg-primary-50/50 dark:bg-primary-900/10 p-5 border-t border-[var(--color-border)]">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm text-xl font-bold relative">
                 {selectedHijri.day}
                 {selectedHoliday && (
                    <Star size={10} className="absolute top-1 right-1 text-amber-500 fill-current" />
                 )}
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-primary-900 dark:text-primary-100 uppercase tracking-tight">
                        {selectedHijri.monthName}
                    </h3>
                    {selectedHoliday && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${selectedHoliday.type === 'eid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'}`}>
                            {selectedHoliday.name}
                        </span>
                    )}
                 </div>
                 <p className="text-xs font-bold text-muted uppercase tracking-wider">
                    {selectedDate.toLocaleDateString(settings?.preferences?.language, { weekday: 'long', month: 'short', day: 'numeric' })}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Trackers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column: Prayers & Quran */}
         <div className="lg:col-span-2 space-y-6">
            <SalahTracker dateKey={selectedDateKey} gregorianDate={selectedDate} />
            <QuranTracker />
         </div>

         {/* Right Column: Tasbih, Athkar & Upcoming Events */}
         <div className="space-y-6">
            <TasbihWidget />
            
            <AthkarTracker dateKey={selectedDateKey} />
            
            {/* Upcoming Events Card */}
            <div className="bg-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Calendar size={20} />
                  </div>
                  <h3 className="font-bold text-foreground">{t.deen.events}</h3>
               </div>
               <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.name} className="flex justify-between items-center group">
                       <div className="flex items-center gap-2">
                          <Star size={14} className="text-amber-400 fill-current opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{event.name}</span>
                       </div>
                       <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${event.color}`}>
                          {event.days} Days
                       </span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Stats Section */}
      <div className="pt-8 border-t border-[var(--color-border)]">
         <div className="flex items-center gap-2 mb-6 px-1">
            <BarChart3 className="text-muted" size={20} />
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Insights & Trends</h2>
         </div>
         <IslamicStats />
      </div>

    </div>
  );
};

export default Deen;
