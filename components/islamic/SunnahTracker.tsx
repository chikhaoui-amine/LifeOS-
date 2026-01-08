import React, { useState } from 'react';
import { Star, Check, Clock, X, Plus, Trash2, Sparkles } from 'lucide-react';
import { useIslamic } from '../../context/IslamicContext';
import { DeenStatus } from '../../types';

interface SunnahTrackerProps {
  dateKey?: string;
}

const SUNNAH_TEMPLATES = [
  { title: 'Sunnah Dhuhr', rakats: '4+2', time: 'With Dhuhr' },
  { title: 'Sunnah Asr', rakats: 4, time: 'Before Asr' },
  { title: 'Sunnah Maghrib', rakats: 2, time: 'After Maghrib' },
  { title: 'Sunnah Isha', rakats: 2, time: 'After Isha' },
];

export const SunnahTracker: React.FC<SunnahTrackerProps> = ({ dateKey }) => {
  const { getPrayersForDate, updateSunnahStatus, addSunnah, removeSunnah } = useIslamic();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const targetKey = dateKey || "";
  const dailyData = getPrayersForDate(targetKey);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTitle.trim()) {
      addSunnah(newTitle, '2', 'Voluntary', targetKey);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleApplyTemplate = (tpl: typeof SUNNAH_TEMPLATES[0]) => {
     addSunnah(tpl.title, tpl.rakats, tpl.time, targetKey);
     setIsAdding(false);
  };

  const StatusSelector = ({ current, onSelect }: { current: DeenStatus, onSelect: (s: DeenStatus) => void }) => {
    return (
      <div className="flex bg-foreground/[0.04] dark:bg-foreground/[0.06] p-0.5 rounded-xl gap-0.5 border border-foreground/[0.02]">
        <button 
          onClick={() => onSelect(current === 'on-time' ? 'none' : 'on-time')}
          className={`p-1.5 rounded-lg transition-all active:scale-90 ${current === 'on-time' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          <Check size={14} strokeWidth={4} />
        </button>
        <button 
          onClick={() => onSelect(current === 'late' ? 'none' : 'late')}
          className={`p-1.5 rounded-lg transition-all active:scale-90 ${current === 'late' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-amber-500'}`}
        >
          <Clock size={14} strokeWidth={3.5} />
        </button>
        <button 
          onClick={() => onSelect(current === 'missed' ? 'none' : 'missed')}
          className={`p-1.5 rounded-lg transition-all active:scale-90 ${current === 'missed' ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-rose-500'}`}
        >
          <X size={14} strokeWidth={3.5} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col h-full">
       <div className="p-4 sm:p-6 border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-[0.1em] flex items-center gap-2">
             <Star size={14} className="text-amber-500 fill-current" /> Sunnah & Nafl
          </h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${isAdding ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-amber-500 text-white shadow-md'}`}
          >
            {isAdding ? <X size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={4} />}
          </button>
       </div>
       
       <div className="p-2 sm:p-4 flex-1 overflow-y-auto no-scrollbar">
          {isAdding && (
            <div className="space-y-3 mb-4 animate-in slide-in-from-top-2">
               <form onSubmit={handleAdd} className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-2">
                  <input 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    placeholder="Nafl Name..."
                    className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 text-foreground placeholder:text-gray-400"
                    autoFocus
                  />
                  <button type="submit" className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check size={14} strokeWidth={4}/></button>
               </form>
               
               <div className="grid grid-cols-2 gap-1.5">
                  {SUNNAH_TEMPLATES.map(t => (
                     <button 
                        key={t.title} 
                        onClick={() => handleApplyTemplate(t)}
                        className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:border-amber-400 transition-colors group"
                     >
                        <Sparkles size={10} className="text-amber-500" />
                        <span className="text-[8px] font-bold text-gray-600 dark:text-gray-300 truncate">{t.title}</span>
                     </button>
                  ))}
               </div>
            </div>
          )}

          <div className="space-y-1.5">
             {dailyData.sunnahs.map((item) => (
                <div
                  key={item.id}
                  className={`
                    w-full flex items-center justify-between p-2 rounded-xl transition-all duration-300 group
                    ${item.status !== 'none' ? 'bg-amber-50/20 dark:bg-amber-900/5 border border-amber-500/10' : 'bg-foreground/[0.01] hover:bg-foreground/[0.03]'}
                  `}
                >
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-all duration-500 ${item.status === 'on-time' ? 'bg-emerald-500 text-white' : item.status === 'late' ? 'bg-amber-500 text-white' : item.status === 'missed' ? 'bg-rose-500 text-white' : 'bg-foreground/5 text-gray-400'}`}>
                         <Star size={14} fill={item.status !== 'none' ? "currentColor" : "none"} strokeWidth={2} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                         <p className={`text-[10px] font-black uppercase tracking-tight truncate ${item.status !== 'none' ? 'text-foreground' : 'text-gray-500'}`}>{item.title}</p>
                         <p className="text-[8px] font-black text-muted opacity-60 mt-0.5">{item.rakats}R</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1.5">
                      <StatusSelector current={item.status} onSelect={(s) => updateSunnahStatus(item.id, s, targetKey)} />
                      <button onClick={() => removeSunnah(item.id, targetKey)} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                   </div>
                </div>
             ))}
             {dailyData.sunnahs.length === 0 && !isAdding && (
               <div className="py-8 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-200">Empty</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};