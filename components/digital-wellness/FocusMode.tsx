
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Zap, Coffee, CheckCircle2, Settings2, X } from 'lucide-react';
import { useDigitalWellness } from '../../context/DigitalWellnessContext';

export const FocusMode: React.FC = () => {
  const { activeMode, setActiveMode, recordFocusSession } = useDigitalWellness();
  
  // Settings State
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  // Sync timeLeft when settings change (only if timer is not running)
  useEffect(() => {
    if (!isActive) {
      if (sessionType === 'focus') setTimeLeft(focusDuration * 60);
      else setTimeLeft(breakDuration * 60);
    }
  }, [focusDuration, breakDuration, isActive, sessionType]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      
      // Notify
      if (Notification.permission === "granted") {
         const title = sessionType === 'focus' ? "Focus Session Complete" : "Break Over";
         const body = sessionType === 'focus' ? "Time to take a break!" : "Ready to focus again?";
         new Notification(title, { body, icon: '/vite.svg' });
      }

      // Record Focus Minutes
      if (sessionType === 'focus') {
        recordFocusSession(focusDuration);
      }

      // Auto-switch logic
      if (sessionType === 'focus') {
         setActiveMode('none');
         alert("Focus Session Complete! Take a break.");
         setSessionType('break');
         setTimeLeft(breakDuration * 60);
      } else {
         alert("Break over! Ready to focus?");
         setSessionType('focus');
         setTimeLeft(focusDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType, focusDuration, breakDuration, setActiveMode, recordFocusSession]);

  const toggleTimer = () => {
    if (!isActive) {
       setActiveMode(sessionType === 'focus' ? 'focus' : 'none');
    } else {
       setActiveMode('none');
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setActiveMode('none');
    setTimeLeft(sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const switchSession = (type: 'focus' | 'break') => {
    setIsActive(false);
    setActiveMode('none');
    setSessionType(type);
    setTimeLeft(type === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-between h-full relative overflow-hidden">
       {isActive && sessionType === 'focus' && (
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
       )}

       <div className="flex justify-between items-center w-full mb-6 z-10">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
            <button 
              onClick={() => switchSession('focus')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sessionType === 'focus' ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
               Focus
            </button>
            <button 
              onClick={() => switchSession('break')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sessionType === 'break' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
               Break
            </button>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
             <Settings2 size={18} />
          </button>
       </div>

       {showSettings && (
         <div className="absolute top-16 left-4 right-4 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl z-20 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Settings2 size={14} /> Configure Timer
               </h4>
               <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Focus (min)</label>
                  <input 
                    type="number" 
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold text-center outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Break (min)</label>
                  <input 
                    type="number" 
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold text-center outline-none"
                  />
               </div>
            </div>
         </div>
       )}

       <div className="text-center z-10 flex-1 flex flex-col justify-center">
          <div className="text-7xl font-mono font-bold text-gray-900 dark:text-white tracking-tighter mb-2 tabular-nums">
             {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
             {isActive ? (
                sessionType === 'focus' ? <><Zap size={14} className="text-primary-500 fill-current animate-pulse" /> Stay Focused</> : <><Coffee size={14} className="text-green-500" /> Recharge</>
             ) : 'Ready'}
          </p>
       </div>

       <div className="flex gap-4 mt-8 z-10 w-full px-4">
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
             {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
          </button>
          {isActive && (
             <button 
               onClick={resetTimer}
               className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
             >
                <Square size={20} fill="currentColor" />
             </button>
          )}
       </div>
    </div>
  );
};
