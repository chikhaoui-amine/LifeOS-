
import React, { useState, useMemo, useRef } from 'react';
import { RotateCcw, Plus, Fingerprint } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';

export const TasbihWidget: React.FC = () => {
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [label, setLabel] = useState('SubhanAllah');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const progress = Math.min(100, (count / target) * 100);
  const circumference = 2 * Math.PI * 52; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleIncrement = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
    setCount(c => c + 1);
    
    // Simple visual press effect
    if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(0.92)';
        setTimeout(() => {
            if (buttonRef.current) buttonRef.current.style.transform = 'scale(1)';
        }, 100);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const presets = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', 'Astaghfirullah', 'Salawat'];

  return (
    <div className="bg-surface rounded-[2.5rem] border border-[var(--color-border)] p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-between min-h-[360px]">
       
       {/* Background Decor */}
       <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

       {/* Header Controls */}
       <div className="w-full flex justify-between items-center z-10 mb-6">
          <select 
            value={label} 
            onChange={(e) => { setLabel(e.target.value); setCount(0); }}
            className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer appearance-none border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5 hover:border-emerald-500 transition-colors"
          >
             {presets.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button 
            onClick={handleReset} 
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
            title="Reset Counter"
          >
             <RotateCcw size={16} />
          </button>
       </div>

       {/* Main Interaction Area */}
       <div className="relative flex items-center justify-center flex-1 w-full">
          {/* Progress Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <svg className="w-64 h-64 transform -rotate-90">
                <circle cx="128" cy="128" r="52" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                <circle 
                    cx="128" cy="128" r="52" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-emerald-500 transition-all duration-300 ease-out"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
             </svg>
          </div>

          {/* Tap Button */}
          <button 
            ref={buttonRef}
            onClick={handleIncrement}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 flex flex-col items-center justify-center text-white z-10 transition-transform duration-100 select-none group relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 rounded-full border-4 border-white/10" />
             
             <span className="text-6xl font-black font-mono tracking-tighter tabular-nums drop-shadow-md relative z-10">
                {count}
             </span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1 flex items-center gap-1">
                <Fingerprint size={12} /> Tap
             </span>
          </button>
       </div>

       {/* Target Selector */}
       <div className="w-full flex justify-center gap-2 mt-8 z-10 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl">
          {[33, 100, 1000].map(val => (
             <button 
               key={val}
               onClick={() => setTarget(val)}
               className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${target === val ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
             >
                {val}
             </button>
          ))}
       </div>
    </div>
  );
};
