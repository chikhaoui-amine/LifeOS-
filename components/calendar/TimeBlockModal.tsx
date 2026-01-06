
import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, Type, Trash2, CheckCircle2, Circle, MoreHorizontal, Calendar, ArrowRight } from 'lucide-react';
import { TimeBlock, TIME_BLOCK_CATEGORIES } from '../../types';

interface TimeBlockModalProps {
  initialData?: TimeBlock;
  date: string;
  onSave: (block: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({ initialData, date, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [duration, setDuration] = useState(initialData?.duration || 60); // In minutes
  
  const [category, setCategory] = useState(initialData?.category || TIME_BLOCK_CATEGORIES[0].name);
  const [color, setColor] = useState(initialData?.color || TIME_BLOCK_CATEGORIES[0].color);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [completed, setCompleted] = useState(initialData?.completed || false);

  // Helper to calculate end time string
  const calculateEndTime = (start: string, minutes: number) => {
    const [h, m] = start.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m + minutes);
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(startTime, duration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow empty title, default to category name
    const finalTitle = title.trim() || category;

    onSave({
      ...initialData,
      title: finalTitle,
      startTime,
      endTime,
      duration,
      category,
      color,
      notes,
      date,
      completed,
    });
    onClose();
  };

  const handleCategorySelect = (cat: typeof TIME_BLOCK_CATEGORIES[0]) => {
    setCategory(cat.name);
    setColor(cat.color);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header Actions */}
        <div className="px-6 pt-6 flex justify-between items-center shrink-0">
           <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
             <X size={20} />
           </button>
           
           {initialData && (
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => { if(confirm('Delete this block?')) { onDelete?.(initialData.id); onClose(); } }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                   <Trash2 size={20} />
                </button>
             </div>
           )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
           {/* Title Input */}
           <div>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs doing?"
                className="w-full text-3xl font-bold bg-transparent border-none placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white focus:ring-0 p-0"
                autoFocus
              />
           </div>

           {/* Time Controls (Refined) */}
           <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
              
              {/* Start Time Row */}
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</label>
                    <div className="relative">
                       <input 
                         type="time" 
                         value={startTime}
                         onChange={e => setStartTime(e.target.value)}
                         className="bg-transparent font-mono text-2xl font-bold text-gray-900 dark:text-white focus:outline-none w-32 -ml-1 cursor-pointer"
                       />
                    </div>
                 </div>
                 <div className="text-gray-300 dark:text-gray-600">
                    <ArrowRight size={24} />
                 </div>
                 <div className="flex flex-col text-right">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</label>
                    <div className="font-mono text-2xl font-bold text-gray-500 dark:text-gray-400">
                       {endTime}
                    </div>
                 </div>
              </div>

              {/* Duration Slider & Presets */}
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</label>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                       {Math.floor(duration/60)}h {duration%60}m
                    </span>
                 </div>
                 
                 <input 
                   type="range" 
                   min="15" 
                   max="240" 
                   step="15"
                   value={duration} 
                   onChange={(e) => setDuration(parseInt(e.target.value))}
                   className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 mb-3"
                 />

                 <div className="flex gap-2 justify-between">
                    {[15, 30, 45, 60, 90, 120].map(mins => (
                       <button
                         key={mins}
                         type="button"
                         onClick={() => setDuration(mins)}
                         className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${duration === mins ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                       >
                          {mins}m
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Category Selection */}
           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</label>
              <div className="flex flex-wrap gap-3">
                 {TIME_BLOCK_CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                        ${category === cat.name ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 opacity-60 hover:opacity-100 hover:scale-105'}
                      `}
                      style={{ backgroundColor: category === cat.name ? cat.color : undefined }}
                      title={cat.name}
                    >
                       <span className="text-xl drop-shadow-sm filter" style={{ color: category === cat.name ? 'white' : 'inherit' }}>{cat.icon}</span>
                    </button>
                 ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                 {category}
              </div>
           </div>

           {/* Notes */}
           <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 resize-none text-sm h-16 p-0"
              />
           </div>

           {/* Completion Checkbox (Only if editing) */}
           {initialData && (
              <div 
                onClick={() => setCompleted(!completed)}
                className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${completed ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    {completed && <CheckCircle2 size={16} />}
                 </div>
                 <span className={`font-medium ${completed ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    Mark as Completed
                 </span>
              </div>
           )}

           {/* Save Button */}
           <button 
             type="submit"
             className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg shadow-xl shadow-gray-900/10 dark:shadow-white/5 active:scale-95 transition-all"
           >
              {initialData ? 'Update Block' : 'Create Block'}
           </button>

        </form>
      </div>
    </div>
  );
};
