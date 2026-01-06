
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Check, Brain, Users, Home, Dumbbell, BookOpen, Coffee, Circle, Palette, DollarSign, Heart, MessageCircle, Archive, Briefcase, ShoppingCart, Plane } from 'lucide-react';
import { useTimeBlocks } from '../../context/TimeBlockContext';
import { TimeBlockModal } from './TimeBlockModal';
import { TimeBlock } from '../../types';
import { getTodayKey } from '../../utils/dateUtils';

interface TimeBlockingViewProps {
  date: string;
}

// Category Configuration (Color & Icon)
const CATEGORY_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  'Deep Work': { color: '#818cf8', bg: 'bg-indigo-500', icon: Brain },
  'Meeting': { color: '#fbbf24', bg: 'bg-amber-500', icon: Users },
  'Chore': { color: '#34d399', bg: 'bg-emerald-500', icon: Home },
  'Health': { color: '#f87171', bg: 'bg-red-500', icon: Dumbbell },
  'Learning': { color: '#f472b6', bg: 'bg-pink-500', icon: BookOpen },
  'Break': { color: '#9ca3af', bg: 'bg-gray-500', icon: Coffee },
  'Creative': { color: '#a78bfa', bg: 'bg-violet-500', icon: Palette },
  'Finance': { color: '#4ade80', bg: 'bg-green-500', icon: DollarSign },
  'Family': { color: '#fb7185', bg: 'bg-rose-500', icon: Heart },
  'Social': { color: '#60a5fa', bg: 'bg-blue-500', icon: MessageCircle },
  'Admin': { color: '#94a3b8', bg: 'bg-slate-500', icon: Archive },
  'Work': { color: '#60a5fa', bg: 'bg-blue-600', icon: Briefcase },
  'Shopping': { color: '#fcd34d', bg: 'bg-yellow-500', icon: ShoppingCart },
  'Travel': { color: '#2dd4bf', bg: 'bg-teal-500', icon: Plane },
  'Other': { color: '#60a5fa', bg: 'bg-blue-500', icon: Circle },
};

export const TimeBlockingView: React.FC<TimeBlockingViewProps> = ({ date }) => {
  const { getBlocksForDate, addBlock, updateBlock, deleteBlock, toggleBlock } = useTimeBlocks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const blocks = getBlocksForDate(date);
  const isToday = date === getTodayKey();

  // Layout Constants
  const PIXELS_PER_MINUTE = 2; 
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
            scrollMins = Math.max(0, (now.getHours() * 60) - 60); 
        }
        
        setTimeout(() => {
            if(scrollRef.current) {
                const scrollY = scrollMins * PIXELS_PER_MINUTE;
                scrollRef.current.scrollTo({ top: scrollY, behavior: 'smooth' });
            }
        }, 100);
    }

    return () => clearInterval(interval);
  }, [isToday]);

  const handleSave = async (data: any) => {
    if (selectedBlock) {
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
      // Adjust click Y based on scroll position
      const clickY = e.clientY - rect.top + scrollRef.current.scrollTop;
      
      const clickedMinutes = Math.floor(clickY / PIXELS_PER_MINUTE);
      
      // Round to nearest 15
      const roundedMinutes = Math.floor(clickedMinutes / 15) * 15;
      const h = Math.floor(roundedMinutes / 60);
      const m = roundedMinutes % 60;
      
      if (h >= END_HOUR) return;

      const timeString = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      
      setSelectedBlock({ startTime: timeString } as any);
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth">
         
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
                     {/* Hour Number */}
                     <div className="w-16 pl-4 pt-1">
                        <span className="text-2xl font-bold text-gray-700 select-none">
                           {String(hour).padStart(2, '0')}
                        </span>
                     </div>
                     
                     {/* Horizontal Guide Line (Subtle) */}
                     {/* <div className="flex-1 border-t border-gray-800/50 mt-4 mr-4" /> */}
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
                     <span className="text-xs font-bold text-red-500 bg-[#09090b] px-1 py-0.5 rounded">
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
                  const height = Math.max(block.duration * PIXELS_PER_MINUTE, 40); // Min visual height
                  
                  const config = CATEGORY_CONFIG[block.category] || CATEGORY_CONFIG['Other'];
                  const Icon = config.icon;
                  const isCompleted = block.completed;

                  return (
                     <div
                       key={block.id}
                       onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); setIsModalOpen(true); }}
                       className="absolute w-full group z-10 transition-all duration-200"
                       style={{ top: top, height: height }}
                     >
                        <div className="flex h-full gap-3">
                           
                           {/* Left Icon Pill */}
                           <div 
                              className={`
                                w-12 sm:w-14 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all
                                ${config.bg} ${isCompleted ? 'opacity-50 grayscale' : 'shadow-lg'}
                              `}
                              style={{ 
                                height: '100%', 
                                minHeight: '40px' 
                              }}
                           >
                              <Icon size={20} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                           </div>

                           {/* Right Content Card */}
                           <div className={`
                              flex-1 rounded-2xl border flex items-center justify-between px-4 py-2 transition-all
                              ${isCompleted 
                                ? 'bg-gray-900/40 border-gray-800 opacity-60' 
                                : 'bg-[#18181b] border-gray-800 hover:border-gray-700 hover:bg-[#202023] shadow-sm'
                              }
                           `}>
                              <div className="min-w-0 flex-1 pr-4">
                                 <h4 className={`font-bold text-sm sm:text-base truncate leading-tight ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {block.title}
                                 </h4>
                                 <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                                    <span>{block.startTime} - {block.endTime}</span>
                                    <span>•</span>
                                    <span>{block.duration}m</span>
                                 </div>
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBlock(block.id); }}
                                className={`
                                  w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                                  ${isCompleted 
                                    ? `bg-${config.color} border-transparent text-white` 
                                    : 'border-gray-600 text-transparent hover:border-gray-400'
                                  }
                                `}
                                style={{ 
                                   backgroundColor: isCompleted ? config.color : 'transparent',
                                   borderColor: isCompleted ? 'transparent' : undefined 
                                }}
                              >
                                 <Check size={14} strokeWidth={4} />
                              </button>
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
            onDelete={selectedBlock ? deleteBlock : undefined}
         />
      )}
    </div>
  );
};
