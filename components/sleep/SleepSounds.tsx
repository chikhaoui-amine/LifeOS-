
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Moon, CloudRain, Wind, Coffee, Music, TreePine } from 'lucide-react';

const SOUNDS = [
  { id: 'rain', name: 'Heavy Rain', icon: CloudRain, color: 'bg-blue-500' },
  { id: 'white_noise', name: 'White Noise', icon:  Wind, color: 'bg-gray-400' },
  { id: 'forest', name: 'Night Forest', icon: TreePine, color: 'bg-emerald-600' },
  { id: 'waves', name: 'Ocean Waves', icon: Moon, color: 'bg-cyan-600' },
  { id: 'cafe', name: 'Quiet Cafe', icon: Coffee, color: 'bg-amber-700' },
  { id: 'meditation', name: 'Deep Om', icon: Music, color: 'bg-violet-600' },
];

export const SleepSounds: React.FC = () => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timer, setTimer] = useState<number | null>(null); // Minutes
  
  // In a real app, these would be actual audio file paths
  // Using placeholder logic for UI demonstration
  
  const toggleSound = (id: string) => {
    if (activeSound === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSound(id);
      setIsPlaying(true);
    }
  };

  const activeSoundData = SOUNDS.find(s => s.id === activeSound);

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-lg">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <Music size={20} className="text-indigo-400" /> Sleep Sounds
          </h3>
          {activeSound && isPlaying && (
             <div className="flex gap-1 items-center">
                <span className="flex gap-0.5 h-3 items-end">
                   <span className="w-1 bg-indigo-400 animate-[bounce_1s_infinite] h-2"></span>
                   <span className="w-1 bg-indigo-400 animate-[bounce_1.2s_infinite] h-3"></span>
                   <span className="w-1 bg-indigo-400 animate-[bounce_0.8s_infinite] h-1.5"></span>
                </span>
                <span className="text-xs text-indigo-400 font-bold ml-1">Playing</span>
             </div>
          )}
       </div>

       {/* Sound Grid */}
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {SOUNDS.map(sound => (
             <button
               key={sound.id}
               onClick={() => toggleSound(sound.id)}
               className={`
                 relative p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden group
                 ${activeSound === sound.id ? 'ring-2 ring-indigo-500 bg-slate-800' : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'}
               `}
             >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${sound.color}`}>
                   <sound.icon size={20} />
                </div>
                <span className={`text-xs font-bold ${activeSound === sound.id ? 'text-white' : 'text-slate-400'}`}>
                   {sound.name}
                </span>
                {activeSound === sound.id && (
                   <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                )}
             </button>
          ))}
       </div>

       {/* Player Controls */}
       {activeSound && (
          <div className="bg-slate-800 rounded-2xl p-4 animate-in slide-in-from-bottom-2 fade-in">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                >
                   {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                <div className="flex-1">
                   <div className="flex justify-between text-xs text-slate-400 mb-1 font-bold uppercase tracking-wide">
                      <span>Volume</span>
                      <span>{Math.round(volume * 100)}%</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-slate-500" />
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                      />
                   </div>
                </div>
             </div>
             
             {/* Timer Chips (Mock) */}
             <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                {[15, 30, 45, 60].map(m => (
                   <button 
                     key={m}
                     onClick={() => setTimer(m === timer ? null : m)}
                     className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${timer === m ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-transparent text-slate-500 border-slate-600 hover:border-slate-500'}`}
                   >
                      {m} min
                   </button>
                ))}
             </div>
          </div>
       )}
    </div>
  );
};
