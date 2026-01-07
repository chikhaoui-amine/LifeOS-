
import React, { useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSystemDate } from '../context/SystemDateContext';
import { formatDateKey, getTodayKey } from '../utils/dateUtils';

export const SystemDateStrip: React.FC = () => {
  const { selectedDate, setSelectedDate, selectedDateObject } = useSystemDate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate all days for the currently selected month
  const days = useMemo(() => {
    const year = selectedDateObject.getFullYear();
    const month = selectedDateObject.getMonth();
    const result = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
      result.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return result;
  }, [selectedDateObject.getFullYear(), selectedDateObject.getMonth()]);

  const currentMonthYear = useMemo(() => {
    return selectedDateObject.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDateObject]);

  // Scroll to selected date whenever it changes or the month changes
  useEffect(() => {
    if (scrollRef.current) {
      const index = days.findIndex(d => formatDateKey(d) === selectedDate);
      if (index !== -1) {
        const el = scrollRef.current.children[index] as HTMLElement;
        if (el) {
          const scrollLeft = el.offsetLeft - (scrollRef.current.clientWidth / 2) + (el.clientWidth / 2);
          scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  }, [selectedDate, days]);

  const handlePrevMonth = () => {
    const d = new Date(selectedDateObject);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(formatDateKey(d));
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDateObject);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(formatDateKey(d));
  };

  return (
    <div className="flex flex-col mb-4 bg-transparent animate-in fade-in duration-500">
       {/* Navigator Header - Now extremely minimal */}
       <div className="flex items-center justify-between px-1 py-0.5 mb-1">
          <div className="flex items-center gap-1.5">
             <button 
               onClick={handlePrevMonth}
               className="text-foreground/20 hover:text-primary transition-colors p-1"
               aria-label="Previous Month"
             >
                <ChevronLeft size={14} strokeWidth={3} />
             </button>
             <span className="text-[9px] font-black text-foreground/40 tracking-[0.1em] uppercase min-w-[80px] text-center">
                {currentMonthYear}
             </span>
             <button 
               onClick={handleNextMonth}
               className="text-foreground/20 hover:text-primary transition-colors p-1"
               aria-label="Next Month"
             >
                <ChevronRight size={14} strokeWidth={3} />
             </button>
          </div>

          <button 
            onClick={() => setSelectedDate(getTodayKey())}
            className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded transition-all active:scale-95 ${selectedDate === getTodayKey() ? 'bg-primary text-white shadow-sm' : 'text-foreground/30 hover:text-foreground hover:bg-foreground/5'}`}
          >
             Today
          </button>
       </div>

       {/* Days Strip - Super compact size */}
       <div className="overflow-hidden">
          <div ref={scrollRef} className="flex gap-0.5 overflow-x-auto no-scrollbar pb-0.5 snap-x">
             {days.map((date, i) => {
                const key = formatDateKey(date);
                const isSelected = key === selectedDate;
                const isCurrentToday = key === getTodayKey();
                
                return (
                   <button
                      key={i}
                      onClick={() => setSelectedDate(key)}
                      className={`
                        flex flex-col items-center justify-center min-w-[34px] sm:min-w-[40px] h-8 rounded-md transition-all shrink-0 snap-center relative
                        ${isSelected 
                          ? 'bg-primary text-white shadow-md z-10' 
                          : 'text-foreground/30 hover:bg-foreground/5 hover:text-foreground/60'
                        }
                      `}
                   >
                      <span className={`text-[5px] font-black uppercase tracking-tighter mb-0 ${isSelected ? 'text-white/80' : 'text-foreground/30'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-[11px] font-black tracking-tighter">
                        {date.getDate()}
                      </span>
                      {isCurrentToday && !isSelected && (
                        <div className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
                      )}
                   </button>
                )
             })}
          </div>
       </div>
    </div>
  );
};
