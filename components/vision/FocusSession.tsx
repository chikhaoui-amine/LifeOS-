
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Music, Quote } from 'lucide-react';
import { VisionItem } from '../../types';

interface FocusSessionProps {
  items: VisionItem[];
  onClose: () => void;
}

// Simple base64 placeholder or use online assets if available. 
// For this demo, we'll simulate audio capability without huge base64 strings, 
// suggesting where to put real files.
const AMBIENT_TRACKS = [
  { name: 'Rain', file: 'rain' },
  { name: 'Waves', file: 'waves' },
  { name: 'Forest', file: 'forest' },
  { name: 'Flow', file: 'flow' },
];

export const FocusSession: React.FC<FocusSessionProps> = ({ items, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  
  // Filter only visual/quote items for slideshow
  const focusItems = items.filter(i => i.type === 'image' || i.type === 'quote' || i.type === 'goal_ref');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % focusItems.length);
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, focusItems.length]);

  const activeItem = focusItems[activeIndex];

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveIndex(prev => (prev + 1) % focusItems.length);
      if (e.key === 'ArrowLeft') setActiveIndex(prev => (prev - 1 + focusItems.length) % focusItems.length);
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusItems.length, onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col animate-in fade-in duration-700">
       
       {/* Top Controls */}
       <div className="absolute top-4 right-4 z-50 flex gap-3">
          <div className="flex bg-white/10 rounded-full backdrop-blur-md p-1 mr-2 items-center">
             <button 
               onClick={() => setSoundEnabled(!soundEnabled)}
               className={`p-2 rounded-full transition-all ${soundEnabled ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
             >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             {soundEnabled && (
                <div className="flex gap-1 px-2 animate-in slide-in-from-right-2 duration-300">
                   {AMBIENT_TRACKS.map(track => (
                      <button
                        key={track.name}
                        onClick={() => setActiveTrack(track.name)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition-colors ${activeTrack === track.name ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                      >
                         {track.name}
                      </button>
                   ))}
                </div>
             )}
          </div>

          <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
             {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-red-500/80 rounded-full transition-colors backdrop-blur-md group">
             <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
       </div>

       <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Background Blur Effect */}
          {activeItem.type === 'image' && (
             <div 
               key={activeItem.id + '-bg'}
               className="absolute inset-0 bg-cover bg-center blur-[120px] opacity-40 scale-110 animate-pulse-slow"
               style={{ backgroundImage: `url(${activeItem.content})` }}
             />
          )}

          {/* Breathing Circle Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
             <div className="w-[60vh] h-[60vh] rounded-full border border-white/20 animate-[ping_4s_ease-in-out_infinite]" />
             <div className="w-[40vh] h-[40vh] rounded-full border border-white/30 animate-[ping_4s_ease-in-out_infinite_reverse]" />
          </div>

          {/* Main Content */}
          <div key={activeItem.id} className="relative z-10 max-w-5xl p-8 text-center animate-in zoom-in-95 fade-in duration-1000">
             {activeItem.type === 'image' && (
                <div className="flex flex-col items-center">
                   <div className="relative group perspective">
                      <div className="absolute inset-0 bg-white transform rotate-3 scale-105 opacity-20 rounded-sm blur-sm"></div>
                      <img 
                        src={activeItem.content} 
                        className="max-h-[70vh] max-w-full rounded-sm shadow-2xl ring-8 ring-white transform transition-transform duration-[10000ms] ease-linear hover:scale-105"
                        alt="Vision" 
                      />
                   </div>
                   {activeItem.caption && (
                      <p className="mt-12 text-3xl md:text-5xl font-bold tracking-tight text-white font-handwriting rotate-[-1deg] drop-shadow-lg">{activeItem.caption}</p>
                   )}
                </div>
             )}

             {activeItem.type === 'quote' && (
                <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto">
                   <Quote size={64} className="text-white/20 mb-8" />
                   <p className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 font-serif">
                      "{activeItem.content}"
                   </p>
                   {activeItem.subContent && (
                      <div className="mt-12 flex items-center gap-4">
                         <div className="h-px w-12 bg-white/50" />
                         <p className="text-xl font-medium tracking-widest uppercase text-white/80">{activeItem.subContent}</p>
                         <div className="h-px w-12 bg-white/50" />
                      </div>
                   )}
                </div>
             )}

             {activeItem.type === 'goal_ref' && (
                <div className="bg-white/10 backdrop-blur-2xl p-16 rounded-[4rem] border border-white/20 shadow-2xl">
                   <p className="text-sm font-bold uppercase tracking-[0.4em] text-white/60 mb-8">Current Focus</p>
                   <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tight">{activeItem.content}</h2>
                   <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden max-w-2xl mx-auto border border-white/10">
                      <div className="h-full bg-white transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ width: `${activeItem.subContent}%` }} />
                   </div>
                   <p className="mt-6 text-2xl font-mono">{activeItem.subContent}% Complete</p>
                </div>
             )}
          </div>
       </div>

       {/* Progress Bar */}
       <div className="h-1 bg-white/10 w-full">
          <div 
            className="h-full bg-white transition-all duration-500 ease-linear shadow-[0_0_10px_white]" 
            style={{ width: `${((activeIndex + 1) / focusItems.length) * 100}%` }} 
          />
       </div>

       {/* Navigation Controls */}
       <button 
         onClick={() => setActiveIndex(prev => (prev - 1 + focusItems.length) % focusItems.length)}
         className="absolute left-6 top-1/2 -translate-y-1/2 p-6 text-white/10 hover:text-white transition-colors hover:scale-110"
       >
          <ChevronLeft size={64} />
       </button>
       <button 
         onClick={() => setActiveIndex(prev => (prev + 1) % focusItems.length)}
         className="absolute right-6 top-1/2 -translate-y-1/2 p-6 text-white/10 hover:text-white transition-colors hover:scale-110"
       >
          <ChevronRight size={64} />
       </button>

    </div>
  );
};
