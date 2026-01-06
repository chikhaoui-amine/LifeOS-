
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowLeft, CalendarRange, X as XIcon, CheckCircle2 } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { getDaysInMonth, isSameMonth, isToday, formatDateKey } from '../utils/dateUtils';
import { TimeBlockingView } from '../components/calendar/TimeBlockingView';
import { WeeklyView } from '../components/calendar/WeeklyView';

const Calendar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for Day View
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));

  const { habits } = useHabits();
  const { tasks } = useTasks();

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- Navigation Handlers ---
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(selectedDateKey);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDateKey(formatDateKey(prevDay));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(selectedDateKey);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDateKey(formatDateKey(nextDay));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateKey(formatDateKey(today));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateKey(formatDateKey(date));
    setViewMode('day');
  };

  // --- Render Helpers ---
  const renderMonthCell = (day: Date) => {
    const dateKey = formatDateKey(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isDayToday = isToday(day);
    
    // Check if day is in the past (before today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isDayPast = day.getTime() < todayStart.getTime();
    
    // Habits
    const dayHabits = habits.filter(h => {
       if (h.archived) return false;
       const created = new Date(h.createdAt);
       if (day < new Date(created.setHours(0,0,0,0))) return false;
       return h.frequency.days.includes(day.getDay()) || h.completedDates.includes(dateKey);
    });
    const completedHabits = dayHabits.filter(h => h.completedDates.includes(dateKey));

    // Tasks
    const dayTasks = tasks.filter(t => t.dueDate === dateKey);
    const completedTasks = dayTasks.filter(t => t.completed);

    return (
      <div 
        key={dateKey}
        onClick={() => handleDateClick(day)}
        className={`
           min-h-[70px] sm:min-h-[100px] border-b border-r border-[var(--color-border)] p-1 sm:p-2 flex flex-col gap-1 transition-all cursor-pointer group hover:bg-gray-50 dark:hover:bg-white/5 relative
           ${!isCurrentMonth ? 'bg-gray-50/30 dark:bg-gray-900/30 text-opacity-40' : 'bg-surface'}
        `}
      >
         {/* Past Day "X" Overlay */}
         {isDayPast && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.07] dark:opacity-[0.12]">
               <XIcon size={isCurrentMonth ? 80 : 60} strokeWidth={1} className="text-gray-900 dark:text-white" />
            </div>
         )}

         <div className="flex justify-between items-start relative z-10">
            <span className={`
               w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-transform
               ${isDayToday ? 'bg-primary-600 text-white shadow-md' : isCurrentMonth ? 'text-foreground' : 'text-muted'}
            `}>
               {day.getDate()}
            </span>
         </div>

         {/* Indicators */}
         <div className="flex-1 flex flex-col justify-end gap-1 relative z-10">
            {/* Task Bars */}
            {dayTasks.length > 0 && (
               <div className="flex flex-col gap-0.5">
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(completedTasks.length / dayTasks.length) * 100}%` }} 
                     />
                  </div>
               </div>
            )}

            {/* Habit Dots */}
            {dayHabits.length > 0 && (
               <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-end mt-0.5">
                  {dayHabits.map(h => (
                     <div 
                        key={h.id}
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-opacity ${h.completedDates.includes(dateKey) ? 'opacity-100' : 'opacity-20'}`}
                        style={{ backgroundColor: h.color.startsWith('#') ? h.color : undefined }}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
    );
  };

  const getHeaderDate = () => {
    if (viewMode === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (viewMode === 'week') return `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return new Date(selectedDateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col pb-safe">
      
      {/* Header - Optimized for Mobile */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
              <CalendarIcon size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{getHeaderDate()}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-lg">
                    <span className="text-[9px] sm:text-[10px] font-black text-primary-600 uppercase tracking-widest">
                       {viewMode === 'month' ? 'Monthly Overview' : viewMode === 'week' ? 'Weekly Blocking' : 'Daily Schedule'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           {(viewMode === 'day' || viewMode === 'week') && (
              <button onClick={() => setViewMode('month')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-muted">
                 <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
           )}

           <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setViewMode('month')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-surface text-primary-600 shadow-sm' : 'text-gray-500'}`}
                title="Month View"
              >
                 <CalendarIcon size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-surface text-primary-600 shadow-sm' : 'text-gray-500'}`}
                title="Week View"
              >
                 <CalendarRange size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'day' ? 'bg-surface text-primary-600 shadow-sm' : 'text-gray-500'}`}
                title="Day View"
              >
                 <Clock size={16} strokeWidth={3} />
              </button>
           </div>

           <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

           <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button onClick={handlePrev} className="p-2 hover:bg-surface rounded-lg text-gray-500 transition-all shadow-sm">
                <ChevronLeft size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={handleToday}
                className="px-3 py-1.5 text-[10px] font-black text-gray-700 dark:text-gray-200 hover:bg-surface rounded-lg transition-all uppercase tracking-wider"
              >
                Today
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-surface rounded-lg text-gray-500 transition-all shadow-sm">
                <ChevronRight size={16} strokeWidth={3} />
              </button>
           </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 bg-surface rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col relative">
         
         {viewMode === 'month' ? (
            <div className="flex flex-col h-full overflow-hidden">
               {/* Weekday Headers */}
               <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                  {weekDays.map(day => (
                     <div key={day} className="text-center py-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                        {day}
                     </div>
                  ))}
               </div>
               
               {/* Month Grid */}
               <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
                  {days.map(day => renderMonthCell(day))}
               </div>
            </div>
         ) : viewMode === 'week' ? (
            <WeeklyView currentDate={currentDate} />
         ) : (
            <TimeBlockingView date={selectedDateKey} />
         )}

      </div>
    </div>
  );
};

export default Calendar;
