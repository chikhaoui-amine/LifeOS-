
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Check, Circle } from 'lucide-react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import { useSettings } from '../../context/SettingsContext';
import { TimeBlockModal } from './TimeBlockModal';
import { TimeBlock, TIME_BLOCK_CATEGORIES } from '../../types';
import { formatDateKey, getTodayKey, isToday } from '../../utils/dateUtils';

interface WeeklyViewProps {
  currentDate: Date;
}

// Map categories to colors/icons (Reusing logic for consistency)
const CATEGORY_STYLES: Record<string, string> = {
  'Deep Work': 'bg-[#6366f1]',
  'Meeting': 'bg-[#f59e0b]',
  'Chore': 'bg-[#10b981]',
  'Health': 'bg-[#ef4444]',
  'Learning': 'bg-[#ec4899]',
  'Break': 'bg-[#6b7280]',
  'Other': 'bg-[#3b82f6]',
};

// Layout Algorithm (Simplified for Weekly Column)
const calculateColumnLayout = (events: TimeBlock[]) => {
  if (events.length === 0) return [];
  
  // Sort by start time
  const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const result: any[] = [];
  const columns: TimeBlock[][] = [];

  sorted.forEach(event => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const lastInCol = columns[i][columns[i].length - 1];
      if (lastInCol.endTime <= event.startTime) {
        columns[i].push(event);
        result.push({ ...event, col: i, totalCols: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
      result.push({ ...event, col: columns.length - 1, totalCols: 0 });
    }
  });

  const groupSize = columns.length;
  result.forEach(item => item.totalCols = groupSize);
  return result;
};

export const WeeklyView: React.FC<WeeklyViewProps> = ({ currentDate }) => {
  const { getBlocksForDate, addBlock, updateBlock, deleteBlock } = useTimeBlocks();
  const { settings } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [modalDate, setModalDate] = useState(getTodayKey());
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Constants
  const PIXELS_PER_MINUTE = 1.2; // Condensed for weekly view
  const START_HOUR = 0; // Full 24h view
  const END_HOUR = 24;
  const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE;

  // Generate Week Days based on currentDate
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    // Note: Simple adjustment, assuming Monday start for visual consistency or use settings
    const isMonStart = settings.preferences.startOfWeek === 'monday';
    const currentDay = currentDate.getDay();
    const distanceToStart = (currentDay + 7 - (isMonStart ? 1 : 0)) % 7;
    
    startOfWeek.setDate(currentDate.getDate() - distanceToStart);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        key: formatDateKey(d),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: isToday(d)
      };
    });
  }, [currentDate, settings.preferences.startOfWeek]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      setCurrentTimeMinutes(mins);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    // Initial Scroll to 8am or current time
    if (scrollRef.current) {
        let scrollMins = (8 * 60); // Default 8am
        // Check if we are viewing current week
        const isCurrentWeek = weekDays.some(d => d.isToday);
        if (isCurrentWeek) {
            const now = new Date();
            scrollMins = Math.max(START_HOUR * 60, (now.getHours() * 60) - 60); 
        }

        setTimeout(() => {
            if(scrollRef.current) {
                const scrollY = (scrollMins - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
                scrollRef.current.scrollTo({ top: scrollY, behavior: 'smooth' });
            }
        }, 100);
    }
    
    return () => clearInterval(interval);
  }, [weekDays]);

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const handleSlotClick = (dateKey: string, minutesFromStart: number) => {
    const clickedMinutes = minutesFromStart + (START_HOUR * 60);
    const roundedMinutes = Math.floor(clickedMinutes / 15) * 15;
    const h = Math.floor(roundedMinutes / 60);
    const m = roundedMinutes % 60;
    
    if (h >= END_HOUR) return;

    const timeString = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    
    setModalDate(dateKey);
    setSelectedBlock({ startTime: timeString } as any);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedBlock && selectedBlock.id) {
      await updateBlock(selectedBlock.id, data);
    } else {
      await addBlock({ ...data, date: modalDate }); // Ensure correct date is passed
    }
    setIsModalOpen(false);
    setSelectedBlock(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden">
      
      {/* Header (Day Names) */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 pl-12 sm:pl-16 pr-4 overflow-hidden">
         {weekDays.map(day => (
            <div key={day.key} className="flex-1 min-w-[100px] text-center py-3 border-r border-transparent relative">
               <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${day.isToday ? 'text-primary-600' : 'text-gray-400'}`}>
                  {day.dayName}
               </span>
               <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${day.isToday ? 'bg-primary-600 text-white shadow-md' : 'text-gray-900 dark:text-white'}`}>
                  {day.dayNum}
               </div>
            </div>
         ))}
      </div>

      {/* Scrollable Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative">
         <div className="flex min-w-full relative" style={{ height: TOTAL_HEIGHT }}>
            
            {/* Time Axis (Sticky Left) */}
            <div className="sticky left-0 z-20 w-12 sm:w-16 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shrink-0">
               {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
                  const hour = START_HOUR + i;
                  return (
                     <div 
                       key={hour} 
                       className="absolute right-0 w-full text-center pr-2"
                       style={{ top: i * 60 * PIXELS_PER_MINUTE }}
                     >
                        <span className="text-xs font-medium text-gray-400 relative -top-2">
                           {hour}:00
                        </span>
                     </div>
                  );
               })}
            </div>

            {/* Days Columns */}
            <div className="flex flex-1">
               {weekDays.map((day) => {
                  const blocks = getBlocksForDate(day.key);
                  const layoutBlocks = calculateColumnLayout(blocks);

                  return (
                     <div 
                       key={day.key} 
                       className={`flex-1 min-w-[100px] border-r border-gray-100 dark:border-gray-800 relative group`}
                       onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickY = e.clientY - rect.top; // Relative to visible part? No, this is problematic with scroll.
                          // Use e.nativeEvent.offsetY is unreliable in nested children.
                          // Better: Use the container relative click logic.
                       }}
                     >
                        {/* Background Grid Lines & Click Area */}
                        <div 
                           className="absolute inset-0 z-0"
                           onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickY = e.clientY - rect.top;
                              handleSlotClick(day.key, clickY / PIXELS_PER_MINUTE);
                           }}
                        >
                           {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                              <div 
                                key={i} 
                                className="border-t border-gray-50 dark:border-gray-800/50 w-full absolute"
                                style={{ top: i * 60 * PIXELS_PER_MINUTE, height: 60 * PIXELS_PER_MINUTE }}
                              />
                           ))}
                           
                           {/* Current Time Indicator Line (If Today) */}
                           {day.isToday && currentTimeMinutes >= (START_HOUR * 60) && (
                              <div 
                                 className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none"
                                 style={{ top: (currentTimeMinutes - (START_HOUR * 60)) * PIXELS_PER_MINUTE }}
                              >
                                 <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
                              </div>
                           )}
                        </div>

                        {/* Blocks */}
                        {layoutBlocks.map(block => {
                           const startMins = getMinutes(block.startTime);
                           const top = (startMins - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
                           const height = Math.max(block.duration * PIXELS_PER_MINUTE, 20);
                           
                           const widthPercent = 95 / block.totalCols;
                           const leftPercent = block.col * widthPercent;
                           const bgColor = CATEGORY_STYLES[block.category] || 'bg-blue-500';

                           return (
                              <div
                                 key={block.id}
                                 onClick={(e) => { e.stopPropagation(); setModalDate(day.key); setSelectedBlock(block); setIsModalOpen(true); }}
                                 className={`absolute z-10 rounded-lg border border-white/10 shadow-sm p-1.5 overflow-hidden hover:brightness-110 transition-all cursor-pointer ${block.completed ? 'opacity-50 grayscale' : ''}`}
                                 style={{
                                    top,
                                    height,
                                    left: `${leftPercent + 2}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: block.color || '#3b82f6'
                                 }}
                              >
                                 <p className="text-[10px] font-bold text-white truncate leading-tight">
                                    {block.title}
                                 </p>
                                 {height > 30 && (
                                    <p className="text-[9px] text-white/80 font-medium truncate">
                                       {block.startTime}-{block.endTime}
                                    </p>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  );
               })}
            </div>
         </div>
      </div>

      {isModalOpen && (
         <TimeBlockModal 
            date={modalDate}
            initialData={selectedBlock || undefined}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
            onDelete={selectedBlock ? deleteBlock : undefined}
         />
      )}
    </div>
  );
};
