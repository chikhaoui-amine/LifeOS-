
import React, { useState } from 'react';
import { Shield, AlertOctagon, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { useDigitalWellness } from '../../context/DigitalWellnessContext';

export const StrictModeSetup: React.FC = () => {
  const { enableStrictMode } = useDigitalWellness();
  const [duration, setDuration] = useState(60); // minutes
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const handleActivate = () => {
    if (confirmed) {
       enableStrictMode(duration);
    }
  };

  if (step === 1) {
     return (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 rounded-3xl p-8 border border-red-100 dark:border-red-900/50 shadow-sm text-center">
           <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Shield size={32} strokeWidth={2.5} />
           </div>
           
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Strict Mode</h2>
           <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto">
              Enter an unbreakable state of focus. Once activated, you cannot disable blocks or change settings until the timer ends.
           </p>

           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-sm mx-auto mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Duration</label>
              <div className="flex items-center justify-center gap-4">
                 <button onClick={() => setDuration(d => Math.max(15, d - 15))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xl">-</button>
                 <div className="text-3xl font-bold font-mono w-24 text-center text-gray-900 dark:text-white">
                    {Math.floor(duration / 60)}h {duration % 60}m
                 </div>
                 <button onClick={() => setDuration(d => d + 15)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-xl">+</button>
              </div>
           </div>

           <button 
             onClick={() => setStep(2)}
             className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
           >
              Continue Setup
           </button>
        </div>
     );
  }

  return (
     <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 border-2 border-red-100 dark:border-red-900 text-center animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-4 mb-8">
           <AlertOctagon size={48} className="text-red-600" />
           <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Final Warning</h2>
           <p className="text-red-700 dark:text-red-300 max-w-md">
              You are about to lock your digital environment for <strong>{Math.floor(duration / 60)}h {duration % 60}m</strong>.
              <br/><br/>
              There is <strong>NO WAY</strong> to cancel this once started. Rebooting your device will not stop the timer.
           </p>
        </div>

        <div className="space-y-3 max-w-xs mx-auto mb-8 text-left">
           <div className="flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
              <CheckCircle2 size={16} className="shrink-0" /> Settings will be locked
           </div>
           <div className="flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
              <CheckCircle2 size={16} className="shrink-0" /> Blocked sites cannot be opened
           </div>
           <div className="flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
              <CheckCircle2 size={16} className="shrink-0" /> No early exit option
           </div>
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
           <label className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 cursor-pointer">
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={e => setConfirmed(e.target.checked)} 
                className="w-5 h-5 accent-red-600 rounded"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">I understand and accept the rules</span>
           </label>

           <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                 Cancel
              </button>
              <button 
                onClick={handleActivate}
                disabled={!confirmed}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                 ACTIVATE
              </button>
           </div>
        </div>
     </div>
  );
};
