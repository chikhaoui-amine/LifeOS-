
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { JournalEntry, MoodType } from '../../types';
import { getDaysInMonth, isSameMonth, isToday, formatDateKey } from '../../utils/dateUtils';
import { JournalEntryCard } from './JournalEntryCard';

/**
 * Fix: Added missing interface for JournalCalendar props.
 */
interface JournalCalendarProps {
  entries: JournalEntry[];
  onDateSelect: (dateKey: string) => void;
  onEntryClick: (entry: JournalEntry) => void;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '🙂',
  excited: '🤩',
  grateful: '😇',
  calm: '😌',
  neutral: '😐',
  tired: '🥱',
  sad: '😔',
  angry: '😠',
  anxious: '😟',
};

const MOOD_COLORS: Record<MoodType, string> = {
  happy: '#fbbf24',
  excited: '#f59e0b',
  grateful: '#10b981',
  calm: '#3b82f6',
  neutral: '#94a3b8',
  tired: '#6366f1',
  sad: '#4f46e5',
  angry: '#ef4444',
  anxious: '#f97316',
};

export const JournalCalendar: React.FC<JournalCalendarProps> = ({ entries, onDateSelect, onEntryClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateKey(new Date()));

  const days = getDaysInMonth(currentDate);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const selectedEntries = selectedDate ? (entriesByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors border border-gray-100 dark:border-gray-700">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors border border-gray-100 dark:border-gray-700">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map((day, idx) => (
            <div key={idx} className="text-center text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, i) => {
            const dateKey = formatDateKey(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const isSelected = dateKey === selectedDate;
            const dayEntries = entriesByDate[dateKey] || [];
            
            // Show the face emoji of the most recent entry for that day
            const moodEmoji = dayEntries.length > 0 ? MOOD_EMOJIS[dayEntries[0].mood] : null;
            const moodColor = dayEntries.length > 0 ? MOOD_COLORS[dayEntries[0].mood] : null;

            return (
              <button 
                key={i} 
                onClick={() => { setSelectedDate(dateKey); onDateSelect(dateKey); }}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group
                  ${isSelected ? 'ring-2 ring-primary-500 z-10 scale-105' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
                  ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                  ${dayEntries.length > 0 ? 'bg-primary-50/10' : ''}
                `}
              >
                <span className={`text-sm font-black ${isDayToday ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {day.getDate()}
                </span>
                
                {/* Visual Indicators */}
                {moodEmoji && (
                   <span className="absolute -top-1 -right-1 text-[10px] drop-shadow-sm select-none">
                      {moodEmoji}
                   </span>
                )}

                {dayEntries.length > 0 && !isSelected && (
                   <div 
                     className="w-1 h-1 rounded-full mt-0.5" 
                     style={{ backgroundColor: moodColor || 'currentColor' }}
                   />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day View */}
      {selectedDate && (
         <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 px-4">
               <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
                  <CalendarIcon size={16} />
               </div>
               <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
               </h3>
            </div>
            {selectedEntries.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedEntries.map(entry => (
                     <JournalEntryCard 
                        key={entry.id} 
                        entry={entry} 
                        onClick={() => onEntryClick(entry)} 
                        onFavorite={() => {}} 
                     />
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-white/40 dark:bg-gray-800/20 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400">
                  <p className="text-sm font-black uppercase tracking-widest">No reflections for this day</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
};
