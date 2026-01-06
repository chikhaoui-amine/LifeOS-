
import React, { useState } from 'react';
import { X, Moon, Sun, Coffee, Activity, Smartphone, Zap, CloudRain, Briefcase, Star } from 'lucide-react';
import { SleepLog, SleepMood } from '../../types';

interface SleepLogModalProps {
  initialData?: SleepLog;
  date: string;
  onSave: (log: Omit<SleepLog, 'id'>) => void;
  onClose: () => void;
}

const FACTORS = [
  { id: 'caffeine', label: 'Caffeine', icon: Coffee },
  { id: 'screen_time', label: 'Screen Time', icon: Smartphone },
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'stress', label: 'Stress', icon: Zap },
  { id: 'late_meal', label: 'Late Meal', icon: Moon },
  { id: 'alcohol', label: 'Alcohol', icon: CloudRain },
  { id: 'work', label: 'Work', icon: Briefcase },
];

const MOODS: { id: SleepMood; label: string; emoji: string }[] = [
  { id: 'refreshed', label: 'Refreshed', emoji: '🤩' },
  { id: 'normal', label: 'Normal', emoji: '🙂' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'groggy', label: 'Groggy', emoji: '🥴' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
];

export const SleepLogModal: React.FC<SleepLogModalProps> = ({ initialData, date, onSave, onClose }) => {
  const defaultBedTime = new Date(date);
  defaultBedTime.setDate(defaultBedTime.getDate() - 1);
  defaultBedTime.setHours(23, 0, 0, 0);

  const defaultWakeTime = new Date(date);
  defaultWakeTime.setHours(7, 0, 0, 0);

  const [bedTime, setBedTime] = useState(initialData?.bedTime || defaultBedTime.toISOString());
  const [wakeTime, setWakeTime] = useState(initialData?.wakeTime || defaultWakeTime.toISOString());
  const [quality, setQuality] = useState(initialData?.qualityRating || 75);
  const [mood, setMood] = useState<SleepMood>(initialData?.mood || 'normal');
  const [factors, setFactors] = useState<string[]>(initialData?.factors || []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const toLocalISO = (isoStr: string) => {
    const d = new Date(isoStr);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const calculateDuration = () => {
    const start = new Date(bedTime).getTime();
    const end = new Date(wakeTime).getTime();
    const diffMs = end - start;
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const duration = calculateDuration();
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      bedTime: new Date(bedTime).toISOString(),
      wakeTime: new Date(wakeTime).toISOString(),
      durationMinutes: duration,
      qualityRating: quality,
      mood,
      factors,
      notes,
      naps: initialData?.naps || []
    });
    onClose();
  };

  const toggleFactor = (id: string) => {
    setFactors(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-950 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="bg-slate-900 p-5 sm:p-8 flex justify-between items-start border-b border-slate-800">
           <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                 <Moon size={20} sm-size={24} className="text-primary-400" />
                 Log Sleep
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
           </div>
           <button onClick={onClose} className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-2xl text-slate-500 transition-all hover:text-white">
              <X size={20} sm-size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-10 custom-scrollbar">
           
           <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                 <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Bedtime</label>
                 <input 
                   type="datetime-local" 
                   value={toLocalISO(bedTime)}
                   onChange={e => setBedTime(new Date(e.target.value).toISOString())}
                   className="w-full bg-slate-900 text-white border border-slate-700 rounded-2xl px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Wake Up</label>
                 <input 
                   type="datetime-local" 
                   value={toLocalISO(wakeTime)}
                   onChange={e => setWakeTime(new Date(e.target.value).toISOString())}
                   className="w-full bg-slate-900 text-white border border-slate-700 rounded-2xl px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                 />
              </div>
           </div>

           <div className="bg-primary-500/5 rounded-3xl p-4 sm:p-6 text-center border border-primary-500/20">
              <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Calculated Duration</span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-mono">
                 {hours}<span className="text-primary-400 text-base sm:text-lg ml-1">H</span> {minutes}<span className="text-primary-400 text-base sm:text-lg ml-1">M</span>
              </div>
           </div>

           <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Quality Rating</label>
                    <span className="text-xl sm:text-2xl font-black text-primary-400">{quality}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={quality} 
                   onChange={e => setQuality(parseInt(e.target.value))}
                   className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-500"
                 />
              </div>

              <div className="space-y-3 sm:space-y-4">
                 <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Morning Mood</label>
                 <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {MOODS.map(m => (
                       <button
                         key={m.id}
                         type="button"
                         onClick={() => setMood(m.id)}
                         className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-2xl border-2 transition-all group ${mood === m.id ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800'}`}
                       >
                          <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight truncate w-full text-center">{m.label}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Sleep Factors</label>
              <div className="flex flex-wrap gap-2">
                 {FACTORS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFactor(f.id)}
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-2 border-2 transition-all ${factors.includes(f.id) ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-inner' : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'}`}
                    >
                       <f.icon size={12} sm-size={14} />
                       {f.label}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Personal Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="How did you dream tonight? Any interruptions?"
                className="w-full bg-slate-900 text-white border-2 border-slate-800 rounded-3xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24 sm:h-32 resize-none transition-all placeholder:text-slate-700"
              />
           </div>
        </div>

        <div className="p-5 sm:p-8 border-t border-slate-800 bg-slate-900">
           <button 
             onClick={handleSubmit}
             className="w-full py-4 sm:py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[1.5rem] font-black text-base sm:text-lg shadow-2xl shadow-primary-600/30 transition-all active:scale-[0.98]"
           >
              Update Log
           </button>
        </div>

      </div>
    </div>
  );
};
