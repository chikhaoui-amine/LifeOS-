
import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, XCircle, Timer, ShieldCheck } from 'lucide-react';
import { useDigitalWellness } from '../../context/DigitalWellnessContext';

export const StrictModeOverlay: React.FC = () => {
  const { settings, strictModeTimeLeft, emergencyUnlock } = useDigitalWellness();
  const [showEmergency, setShowEmergency] = useState(false);
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [mathProblem, setMathProblem] = useState<{q: string, a: number} | null>(null);
  const [answer, setAnswer] = useState('');

  // Generate math problem for emergency unlock
  useEffect(() => {
    if (showEmergency && !mathProblem) {
       const a = Math.floor(Math.random() * 50) + 20;
       const b = Math.floor(Math.random() * 50) + 20;
       const c = Math.floor(Math.random() * 10) + 2;
       setMathProblem({ q: `(${a} + ${b}) × ${c}`, a: (a + b) * c });
    }
  }, [showEmergency]);

  if (!settings.strictMode) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === mathProblem?.a) {
       if (confirm("EMERGENCY UNLOCK: This will be logged. Are you sure?")) {
          emergencyUnlock();
       }
    } else {
       setUnlockAttempts(p => p + 1);
       setAnswer('');
       alert("Incorrect answer. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
       
       <div className="max-w-md w-full text-center space-y-8 relative z-10">
          <div className="flex justify-center mb-6">
             <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-pulse">
                <Lock size={64} strokeWidth={3} />
             </div>
          </div>

          <div>
             <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-red-100">Strict Mode Active</h1>
             <p className="text-red-200 font-medium">Your digital environment is locked down.</p>
          </div>

          <div className="bg-black/30 p-8 rounded-3xl border border-red-500/30 backdrop-blur-xl">
             <div className="flex items-center justify-center gap-3 text-red-400 mb-2">
                <Timer size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Time Remaining</span>
             </div>
             <div className="text-5xl font-mono font-bold tabular-nums tracking-tight">
                {formatTime(strictModeTimeLeft)}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-center gap-2 text-sm text-red-300 opacity-80">
                <ShieldCheck size={16} />
                <span>Settings Locked</span>
                <span>•</span>
                <span>Uninstall Blocked</span>
             </div>
             
             {!showEmergency ? (
                <button 
                  onClick={() => setShowEmergency(true)}
                  className="text-xs text-red-400 hover:text-white underline decoration-dashed underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
                >
                   Emergency Override
                </button>
             ) : (
                <div className="bg-red-900/50 p-6 rounded-2xl border border-red-500/50 animate-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-2 text-red-200 font-bold mb-4 justify-center">
                      <AlertTriangle size={20} /> Emergency Unlock
                   </div>
                   <p className="text-sm text-red-200 mb-4">Solve to prove this is urgent:</p>
                   <div className="text-2xl font-mono font-bold mb-4">{mathProblem?.q} = ?</div>
                   <form onSubmit={handleUnlockAttempt} className="flex gap-2">
                      <input 
                        type="number" 
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        className="flex-1 bg-black/40 border border-red-500/30 rounded-lg px-4 py-2 text-white outline-none focus:border-red-400"
                        placeholder="Answer"
                        autoFocus
                      />
                      <button type="submit" className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold">
                         Verify
                      </button>
                   </form>
                   <button onClick={() => setShowEmergency(false)} className="mt-4 text-xs text-red-400 hover:text-white flex items-center justify-center gap-1 w-full">
                      <XCircle size={14} /> Cancel
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
