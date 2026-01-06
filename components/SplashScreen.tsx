
import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence
    const t1 = setTimeout(() => setStage(1), 300);   // Ring Start
    const t2 = setTimeout(() => setStage(2), 1100);  // Checkmark Start
    const t3 = setTimeout(() => setStage(3), 1900);  // Burst/Glow & Text
    const t4 = setTimeout(() => setStage(4), 3500);  // Exit Trigger

    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  const isExiting = stage === 4;

  // Modern Checkmark Path
  const checkPath = "M 32 50 L 45 63 L 70 38";

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0F172A] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Main Logo Container */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                 <linearGradient id="successGradient" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ADE80" /> {/* Green 400 */}
                    <stop offset="100%" stopColor="#3B82F6" /> {/* Blue 500 */}
                 </linearGradient>
                 <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                       <feMergeNode in="coloredBlur"/>
                       <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                 </filter>
              </defs>

              {/* 1. The Ring */}
              <circle 
                cx="50" cy="50" r="42" 
                stroke="url(#successGradient)" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="origin-center -rotate-90 transition-all duration-[1000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  strokeDasharray: 264, // 2 * PI * 42
                  strokeDashoffset: stage >= 1 ? 0 : 264,
                  opacity: stage >= 1 ? 1 : 0
                }}
              />

              {/* 2. The Checkmark (True Sign) */}
              <path 
                d={checkPath}
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                className="transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  strokeDasharray: 60,
                  strokeDashoffset: stage >= 2 ? 0 : 60,
                  opacity: stage >= 2 ? 1 : 0
                }}
              />

              {/* 3. Success Burst Particles */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                 <line 
                   key={i}
                   x1="50" y1="50" x2="50" y2="38"
                   stroke="url(#successGradient)"
                   strokeWidth="2"
                   strokeLinecap="round"
                   className={`origin-center transition-all duration-700 ease-out ${stage >= 3 ? 'opacity-0 scale-150' : 'opacity-0 scale-0'}`}
                   style={{
                     transform: `rotate(${angle}deg) translateY(${stage >= 3 ? '-35px' : '-20px'})`,
                     opacity: stage === 3 ? 1 : 0 // Flash only on stage 3 start
                   }}
                 />
              ))}
           </svg>

           {/* Inner Glow Pulse */}
           <div className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl transition-all duration-1000 ${stage >= 3 ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`} />
        </div>

        {/* Text Reveal */}
        <div className={`mt-8 overflow-hidden flex flex-col items-center transition-all duration-1000 ease-out ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
           <h1 className="text-4xl font-sans font-bold tracking-[0.15em] text-white drop-shadow-md">
              LifeOS
           </h1>
           <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.4em] mt-2 animate-pulse">
              System Ready
           </p>
        </div>

      </div>
    </div>
  );
};
