
import React, { useState } from 'react';
import { X, Moon, Clock, ShieldAlert, Check } from 'lucide-react';
import { useSleep } from '../../context/SleepContext';

interface SleepSettingsModalProps {
  onClose: () => void;
}

export const SleepSettingsModal: React.FC<SleepSettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSleep();
  
  const [targetHours, setTargetHours] = useState(settings.targetHours);
  const [minHours, setMinHours] = useState(settings.minHours);
  const [bedTime, setBedTime] = useState(settings.bedTimeGoal);
  const [wakeTime, setWakeTime] = useState(settings.wakeTimeGoal);

  const handleSave = () => {
    updateSettings({
      targetHours,
      minHours,
      bedTimeGoal: bedTime,
      wakeTimeGoal: wakeTime
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
           <div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                 <Moon size={22} className="text-indigo-500 fill-current" />
                 Sleep Goals
              </h3>
              <p className="text-xs text-gray-500 font-medium">Customize your recovery targets</p>
           </div>
           <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
           
           {/* Range Configuration */}
           <div className="space-y-5">
              {/* Ideal Target */}
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={14} strokeWidth={3} /> Ideal Target
                    </label>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{targetHours}h</span>
                 </div>
                 
                 <input 
                   type="range" 
                   min="5" 
                   max="12" 
                   step="0.5"
                   value={targetHours}
                   onChange={e => setTargetHours(parseFloat(e.target.value))}
                   className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                 />
                 <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>5h</span>
                    <span>12h</span>
                 </div>
                 <p className="text-[11px] font-medium text-gray-500 mt-3 leading-snug">
                    Your calculated sleep debt will be based on this goal. Aim for 7-9 hours for optimal health.
                 </p>
              </div>

              {/* Minimum */}
              <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-800/50 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                       <ShieldAlert size={14} strokeWidth={3} /> Danger Zone
                    </label>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{minHours}h</span>
                 </div>
                 
                 <input 
                   type="range" 
                   min="4" 
                   max={targetHours} 
                   step="0.5"
                   value={minHours}
                   onChange={e => setMinHours(parseFloat(e.target.value))}
                   className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                 />
                 <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>4h</span>
                    <span>{targetHours}h</span>
                 </div>
                 <p className="text-[11px] font-medium text-gray-500 mt-3 leading-snug">
                    You will receive critical health warnings if your average sleep drops below this limit.
                 </p>
              </div>
           </div>

           {/* Schedule */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Bedtime</label>
                 <input 
                   type="time" 
                   value={bedTime}
                   onChange={e => setBedTime(e.target.value)}
                   className="w-full bg-transparent font-bold text-xl text-gray-900 dark:text-white outline-none"
                 />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Wake Up</label>
                 <input 
                   type="time" 
                   value={wakeTime}
                   onChange={e => setWakeTime(e.target.value)}
                   className="w-full bg-transparent font-bold text-xl text-gray-900 dark:text-white outline-none"
                 />
              </div>
           </div>

           <button 
             onClick={handleSave}
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
           >
              <Check size={20} strokeWidth={3} /> Save Goals
           </button>

        </div>
      </div>
    </div>
  );
};
