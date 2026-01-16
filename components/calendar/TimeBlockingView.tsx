
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Check, Brain, Users, Home, Dumbbell, BookOpen, Coffee, Circle, Palette, DollarSign, Heart, MessageCircle, Archive, Briefcase, ShoppingCart, Plane, Trash2 } from 'lucide-react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import { TimeBlockModal } from './TimeBlockModal';
import { TimeBlock } from '../../types';
import { getTodayKey } from '../../utils/dateUtils';

interface TimeBlockingViewProps {
  date: string;
}

// Category Icons Mapping
const CATEGORY_ICONS: Record<string, any> = {
  'Deep Work': Brain,
  'Meeting': Users,
  'Chore': Home,
  'Health': Dumbbell,
  'Learning': BookOpen,
  'Break': Coffee,
  'Creative': Palette,
  'Finance': DollarSign,
  'Family': Heart,
  'Social': MessageCircle,
  'Admin': Archive,
  'Work': Briefcase,
  'Shopping': ShoppingCart,
  'Travel': Plane,
  'Other': Circle,
};

export const TimeBlockingView: React.FC<TimeBlockingViewProps> = ({ date }) => {
  const { getBlocksForDate, addBlock, updateBlock, deleteBlock, toggleBlock } = useTimeBlocks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const blocks = getBlocksForDate(date);
  const isToday = date === getTodayKey();

  // Layout Constants - Reduced PIXELS_PER_MINUTE for zoom-out effect
  const PIXELS_PER_MINUTE = 0.75; 
  const START_HOUR = 0;
  const END_HOUR = 24;
  const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE;

  // Simple non-overlapping layout
  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [blocks]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      setCurrentTimeMinutes(mins);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); 

    // Initial scroll to 8am or current time
    if (scrollRef.current) {
        let scrollMins = 8 * 60; // Default 8am
        if (isToday) {
            const now = new Date();
            scrollMins = Math.max(0, (now.getHours() * 60) - 120); 
        }
        
        setTimeout(() => {
            if(scrollRef.current) {
                const scrollY = scrollMins * PIXELS_PER_MINUTE;
                scrollRef.current.scrollTo({ top: scrollY, behavior: 'smooth' });
            }
        }, 100);
    }

    return () => clearInterval(interval);
  }, [isToday, PIXELS_PER_MINUTE]);

  const handleSave = async (data: any) => {
    if (selectedBlock && selectedBlock.id) {
      await updateBlock(selectedBlock.id, data);
    } else {
      await addBlock(data);
    }
    setIsModalOpen(false);
    setSelectedBlock(null);
  };

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      const rect = scrollRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top + scrollRef.current.scrollTop;
      
      const clickedMinutes = Math.floor(clickY / PIXELS_PER_MINUTE);
      const roundedMinutes = Math.floor(clickedMinutes / 15) * 15;
      const h = Math.floor(roundedMinutes / 60);
      const m = roundedMinutes % 60;
      
      if (h >= END_HOUR) return;

      const timeString = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      setSelectedBlock({ startTime: timeString, date } as any);
      setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full relative bg-[#09090b] text-white overflow-hidden font-sans">
      
      {/* Floating Add Button */}
      <button 
        onClick={() => { setSelectedBlock(null); setIsModalOpen(true); }}
        className="absolute bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/10"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Timeline Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative no-scrollbar custom-scrollbar scroll-smooth">
         
         <div 
            className="relative w-full" 
            style={{ height: TOTAL_HEIGHT }}
            onClick={handleTimelineClick}
         >
            
            {/* 1. Hour Markers (Left Axis) */}
            {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
               const hour = START_HOUR + i;
               const top = i * 60 * PIXELS_PER_MINUTE;
               
               return (
                  <div 
                    key={hour} 
                    className="absolute left-0 w-full flex items-start pointer-events-none"
                    style={{ top: top, height: 60 * PIXELS_PER_MINUTE }}
                  >
                     <div className="w-16 pl-4 pt-1">
                        <span className="text-xl font-bold text-gray-700 select-none">
                           {String(hour).padStart(2, '0')}
                        </span>
                     </div>
                  </div>
               );
            })}

            {/* 2. Current Time Line */}
            {isToday && (
               <div 
                 className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
                 style={{ top: currentTimeMinutes * PIXELS_PER_MINUTE }}
               >
                  <div className="w-16 pl-2 pr-1 text-right">
                     <span className="text-[10px] font-bold text-red-500 bg-[#09090b] px-1 py-0.5 rounded">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                     </span>
                  </div>
                  <div className="flex-1 h-px bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
               </div>
            )}

            {/* 3. Events */}
            <div className="absolute top-0 bottom-0 left-[70px] right-2 sm:right-4">
               {sortedBlocks.map(block => {
                  const startMins = getMinutes(block.startTime);
                  const top = startMins * PIXELS_PER_MINUTE;
                  const height = Math.max(block.duration * PIXELS_PER_MINUTE, 20); 
                  
                  const Icon = CATEGORY_ICONS[block.category] || Circle;
                  const isCompleted = block.completed;

                  return (
                     <div
                       key={block.id}
                       onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); setIsModalOpen(true); }}
                       className="absolute w-full group z-10 transition-all duration-200"
                       style={{ top: top, height: height }}
                     >
                        <div className="flex h-full gap-2 py-0.5">
                           
                           {/* Left Icon Pill - Using block.color */}
                           <div 
                              className={`
                                w-10 sm:w-12 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all
                                ${isCompleted ? 'opacity-50 grayscale' : 'shadow-lg'}
                              `}
                              style={{ 
                                height: '100%', 
                                minHeight: '20px',
                                backgroundColor: block.color || '#3b82f6'
                              }}
                           >
                              <Icon size={16} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                           </div>

                           {/* Right Content Card */}
                           <div className={`
                              flex-1 rounded-xl border flex items-center justify-between px-3 py-1 transition-all
                              ${isCompleted 
                                ? 'bg-gray-900/40 border-gray-800 opacity-60' 
                                : 'bg-[#18181b] border-gray-800 hover:border-gray-700 hover:bg-[#202023] shadow-sm'
                              }
                           `}>
                              <div className="min-w-0 flex-1 pr-2">
                                 <h4 className={`font-bold text-[11px] sm:text-sm truncate leading-tight ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {block.title}
                                 </h4>
                                 {height > 35 && (
                                   <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-medium">
                                      <span>{block.startTime}</span>
                                   </div>
                                 )}
                              </div>

                              <div className="flex items-center gap-1">
                                 <button
                                   type="button"
                                   onClick={(e) => { e.stopPropagation(); if(confirm('Delete block?')) deleteBlock(block.id); }}
                                   className="p-1.5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                   title="Delete"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                                 <button
                                   type="button"
                                   onClick={(e) => { e.stopPropagation(); toggleBlock(block.id); }}
                                   className={`
                                     w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                                     ${isCompleted 
                                       ? `bg-emerald-500 border-transparent text-white` 
                                       : 'border-gray-600 text-transparent hover:border-gray-400'
                                     }
                                   `}
                                 >
                                    <Check size={12} strokeWidth={4} />
                                 </button>
                              </div>
                           </div>

                        </div>
                     </div>
                  );
               })}
            </div>

         </div>
      </div>

      {isModalOpen && (
         <TimeBlockModal 
            date={date}
            initialData={selectedBlock || undefined}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
            onDelete={selectedBlock && selectedBlock.id ? deleteBlock : undefined}
         />
      )}
    </div>
  );
};
