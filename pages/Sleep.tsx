import React, { useState, useMemo, useEffect } from 'react';
import { Moon, Calendar as CalendarIcon, BarChart2, Plus, ArrowRight, Sun, Edit3, Sparkles, ChevronLeft, ChevronRight, AlertTriangle, Target, Battery, Search } from 'lucide-react';
import { useSleep } from '../context/SleepContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { SleepLogModal } from '../components/sleep/SleepLogModal';
import { SleepSettingsModal } from '../components/sleep/SleepSettingsModal';
import { ProgressRing } from '../components/ProgressRing';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getTodayKey, formatDateKey, getDaysInMonth, isSameMonth } from '../utils/dateUtils';
import { LineChart } from '../components/Charts';
import { LanguageCode } from '../types';

const Sleep: React.FC = () => {
  const { logs, settings, loading, addSleepLog, updateSleepLog, getLogForDate, calculateSleepScore } = useSleep();
  const { settings: globalSettings } = useSettings();
  const t = useMemo(() => getTranslation((globalSettings?.preferences?.language || 'en') as LanguageCode), [globalSettings?.preferences?.language]);
  
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Data Processing ---
  const todayLog = getLogForDate(selectedDate);
  
  // FIX: Anchor calculation to selectedDate instead of new Date()
  const auditResult = useMemo(() => {
    const targetMins = settings.targetHours * 60;
    const parts = selectedDate.split('-').map(Number);
    const anchorDate = new Date(parts[0], parts[1] - 1, parts[2]);
    
    let totalDebtMins = 0;
    let logsCount = 0;

    for (let i = 0; i < 7; i++) {
        const d = new Date(anchorDate);
        d.setDate(anchorDate.getDate() - i);
        const log = getLogForDate(formatDateKey(d));
        if (log) {
            totalDebtMins += (targetMins - log.durationMinutes);
            logsCount++;
        }
    }
    
    return {
        debtHours: Math.round(totalDebtMins / 60),
        count: logsCount
    };
  }, [logs, selectedDate, settings.targetHours, getLogForDate]);

  const sleepScore = todayLog ? calculateSleepScore(todayLog) : 0;

  const chartStartDate = useMemo(() => {
      const parts = selectedDate.split('-').map(Number);
      const current = new Date(parts[0], parts[1] - 1, parts[2]);
      const day = current.getDay(); 
      const diff = current.getDate() - day; 
      return new Date(current.setDate(diff));
  }, [selectedDate]);

  const lineChartData = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
     const d = new Date(chartStartDate);
     d.setDate(d.getDate() + i);
     const dateKey = formatDateKey(d);
     const log = getLogForDate(dateKey);
     return log ? Number((log.durationMinutes / 60).toFixed(1)) : 0;
  }), [logs, getLogForDate, chartStartDate]);

  const lineChartLabels = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
     const d = new Date(chartStartDate);
     d.setDate(d.getDate() + i);
     return d.toLocaleDateString(globalSettings?.preferences?.language || 'en', { weekday: 'short' });
  }), [globalSettings?.preferences?.language, chartStartDate]);

  const selectedIndex = useMemo(() => {
      const parts = selectedDate.split('-').map(Number);
      const selected = new Date(parts[0], parts[1] - 1, parts[2]);
      return selected.getDay(); 
  }, [selectedDate]);

  const days = getDaysInMonth(calendarDate);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleSaveLog = async (logData: any) => {
     if (todayLog) {
        await updateSleepLog(todayLog.id, logData);
     } else {
        await addSleepLog(logData);
     }
     setIsLogModalOpen(false);
  };

  const handleChartSelect = (index: number) => {
      const d = new Date(chartStartDate);
      d.setDate(d.getDate() + index);
      setSelectedDate(formatDateKey(d));
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const hoursSlept = todayLog ? Math.floor(todayLog.durationMinutes / 60) : 0;
  const minutesSlept = todayLog ? todayLog.durationMinutes % 60 : 0;

  const boxClass = "bg-surface rounded-[2rem] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300";

  return (
    <div className="min-h-screen pb-24 space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 rotate-3">
              <Moon size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">{t.sleep.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <span className="text-[9px] sm:text-xs font-bold text-muted uppercase tracking-widest">{t.sleep.subtitle}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="bg-surface border border-[var(--color-border)] rounded-xl px-3 py-1.5 sm:py-2 flex items-center gap-2 shadow-sm">
              <CalendarIcon size={14} className="text-muted" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-foreground text-xs sm:text-sm font-bold outline-none focus:ring-0 w-28 sm:w-32"
              />
           </div>
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all text-[10px] sm:text-sm active:scale-95"
           >
              <Target size={14} sm-size={16} /> 
              <span>Target</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
         
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            
            {/* Hero Sleep Card */}
            <div 
               className="bg-indigo-600 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 transition-all duration-700 group"
               style={{
                 background: `linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)`,
                 boxShadow: `0 25px 60px -15px rgba(79, 70, 229, 0.4), inset 0 2px 20px rgba(255,255,255,0.1)`
               }}
            >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
               
               <div className="relative z-10 flex-1 text-center md:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4 sm:mb-6">
                     <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
                        <Sparkles size={10} className="text-white/80" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">
                           {todayLog ? 'Daily Record' : 'Log Pending'}
                        </span>
                     </div>
                  </div>

                  {todayLog ? (
                     <div className="space-y-4 sm:space-y-6">
                        <div>
                           <div className="text-4xl sm:text-7xl font-bold font-mono tracking-tighter mb-2 sm:mb-4 flex items-baseline gap-1 justify-center md:justify-start drop-shadow-lg">
                              {hoursSlept}<span className="text-lg sm:text-2xl text-indigo-300 font-sans uppercase font-black">h</span> 
                              {minutesSlept}<span className="text-lg sm:text-2xl text-indigo-300 font-sans uppercase font-black">m</span>
                           </div>
                           <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] sm:text-sm text-indigo-100 font-bold bg-white/5 w-fit px-4 py-2 rounded-xl mx-auto md:mx-0 backdrop-blur-sm border border-white/5">
                              <div className="flex items-center gap-1.5"><Moon size={12} /> {new Date(todayLog.bedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              <ArrowRight size={10} className="opacity-40" />
                              <div className="flex items-center gap-1.5"><Sun size={12} className="text-amber-300" /> {new Date(todayLog.wakeTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                           </div>
                        </div>

                        <button 
                           onClick={() => setIsLogModalOpen(true)}
                           className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto md:mx-0"
                        >
                           <Edit3 size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Adjust</span>
                        </button>
                     </div>
                  ) : (
                     <div className="py-4 sm:py-8">
                        <h2 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 text-white tracking-tight drop-shadow-md">Track rest.</h2>
                        <p className="text-indigo-200 mb-6 sm:mb-8 text-[10px] sm:text-sm max-w-[200px] sm:max-w-xs mx-auto md:mx-0">Log your sleep to unlock recovery insights.</p>
                        <button 
                          onClick={() => setIsLogModalOpen(true)}
                          className="bg-white text-indigo-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 sm:gap-3 mx-auto md:mx-0 uppercase tracking-widest text-[10px] sm:text-sm"
                        >
                           <Plus size={16} strokeWidth={4} /> {t.sleep.logSleep}
                        </button>
                     </div>
                  )}
               </div>

               <div className="shrink-0 relative group p-2 sm:p-4">
                  <ProgressRing 
                    progress={sleepScore} 
                    radius={isMobile ? 70 : 90} 
                    stroke={isMobile ? 10 : 14} 
                    color="stroke-white" 
                    trackColor="stroke-white/20" 
                    showValue={false}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-lg">
                     <span className="text-3xl sm:text-5xl font-black text-white">{sleepScore}</span>
                     <span className="text-[8px] sm:text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mt-0.5 sm:mt-1">Score</span>
                  </div>
               </div>
            </div>

            {/* Weekly Trends */}
            <div className={boxClass}>
               <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                     <h3 className="font-black text-foreground flex items-center gap-2 text-sm sm:text-lg uppercase tracking-tight">
                        <BarChart2 size={18} className="text-indigo-500" /> {t.sleep.trends}
                     </h3>
                     <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Target: {settings.targetHours}h</p>
                  </div>
               </div>
               <LineChart 
                 data={lineChartData} 
                 labels={lineChartLabels}
                 goalValue={settings.targetHours}
                 color="#6366f1"
                 height={200}
                 onSelect={handleChartSelect}
                 selectedIndex={selectedIndex}
               />
            </div>

         </div>

         {/* Sidebar Column */}
         <div className="space-y-5 sm:space-y-6">
            
            {/* Status Indicator - FIXED LOGIC */}
            <div className={`rounded-[2rem] p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden ${
               auditResult.count < 3 ? 'bg-slate-100 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800' :
               auditResult.debtHours > 2 ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900' : 
               auditResult.debtHours > 0 ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900' :
               'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900'
            }`}>
               <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
                  <div className={`p-2.5 sm:p-3 rounded-2xl ${
                    auditResult.count < 3 ? 'bg-slate-200 text-slate-500 dark:bg-slate-700' :
                    auditResult.debtHours > 2 ? 'bg-rose-100 text-rose-600 dark:bg-rose-800 dark:text-rose-200' : 
                    auditResult.debtHours > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200'
                  }`}>
                     {auditResult.count < 3 ? <Search size={20} sm-size={24} /> :
                      auditResult.debtHours > 2 ? <AlertTriangle size={20} sm-size={24} /> : 
                      <Battery size={20} sm-size={24} />}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    auditResult.count < 3 ? 'bg-slate-200 text-slate-600' :
                    auditResult.debtHours > 2 ? 'bg-rose-200/50 text-rose-700' : 
                    auditResult.debtHours > 0 ? 'bg-amber-200/50 text-amber-700' :
                    'bg-emerald-200/50 text-emerald-700'
                  }`}>
                     7-Day Audit
                  </span>
               </div>
               
               <div className="relative z-10">
                  <h3 className={`text-2xl sm:text-3xl font-black mb-1 ${
                    auditResult.count < 3 ? 'text-slate-900 dark:text-slate-100' :
                    auditResult.debtHours > 2 ? 'text-rose-900 dark:text-rose-100' : 
                    auditResult.debtHours > 0 ? 'text-amber-900 dark:text-amber-100' :
                    'text-emerald-900 dark:text-emerald-100'
                  }`}>
                     {auditResult.count < 3 ? 'Analyzing...' :
                      auditResult.debtHours > 0 ? `${auditResult.debtHours}h Debt` : 'Optimized'}
                  </h3>
                  <p className={`text-[11px] sm:text-sm font-medium leading-relaxed ${
                    auditResult.count < 3 ? 'text-slate-500' :
                    auditResult.debtHours > 2 ? 'text-rose-700 dark:text-rose-300' : 
                    auditResult.debtHours > 0 ? 'text-amber-700 dark:text-amber-300' :
                    'text-emerald-700 dark:text-emerald-300'
                  }`}>
                     {auditResult.count < 3 
                        ? `Continue logging sleep to generate a performance audit.`
                        : auditResult.debtHours > 2 
                           ? `You have significant sleep debt. Prioritize rest tonight.`
                           : auditResult.debtHours > 0 
                              ? `You're slightly behind. A longer session tonight will reset your balance.`
                              : `Your rhythm is consistent. Rest cycles are healthy.`
                     }
                  </p>
               </div>
            </div>

            {/* History Calendar */}
            <div className={boxClass}>
               <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="font-black text-foreground flex items-center gap-2 text-[10px] sm:text-sm uppercase tracking-tight">
                     <CalendarIcon size={14} className="text-indigo-500" /> History
                  </h3>
                  <div className="flex items-center gap-1">
                     <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-muted">
                        <ChevronLeft size={14} />
                     </button>
                     <span className="text-[9px] font-black text-muted w-14 text-center uppercase tracking-widest">
                        {calendarDate.toLocaleDateString('en-US', { month: 'short' })}
                     </span>
                     <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-muted">
                        <ChevronRight size={14} />
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-7 gap-1">
                  {weekDays.map(d => <div key={d} className="text-[7px] font-black text-center text-muted uppercase mb-1.5">{d}</div>)}
                  {days.map((day, i) => {
                     const dateKey = formatDateKey(day);
                     const isCurrentMonth = isSameMonth(day, calendarDate);
                     const log = getLogForDate(dateKey);
                     const isSelected = dateKey === selectedDate;
                     
                     let bgClass = 'bg-gray-50 dark:bg-gray-800/30 text-gray-300 dark:text-gray-600';
                     if (log) {
                        if (log.qualityRating >= 85) bgClass = 'bg-emerald-500 text-white shadow-sm';
                        else if (log.qualityRating >= 60) bgClass = 'bg-amber-500 text-white shadow-sm';
                        else bgClass = 'bg-rose-500 text-white shadow-sm';
                     }
                     
                     if (isSelected) bgClass += ' ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-indigo-500 z-10';

                     return (
                        <button 
                          key={i}
                          onClick={() => setSelectedDate(dateKey)}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold transition-all
                            ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                            ${bgClass}
                          `}
                        >
                           {day.getDate()}
                        </button>
                     );
                  })}
               </div>
            </div>

         </div>
      </div>

      {isLogModalOpen && (
         <SleepLogModal 
            date={selectedDate}
            initialData={todayLog}
            onSave={handleSaveLog}
            onClose={() => setIsLogModalOpen(false)}
         />
      )}

      {isSettingsOpen && (
         <SleepSettingsModal 
            onClose={() => setIsSettingsOpen(false)}
         />
      )}

    </div>
  );
};

export default Sleep;