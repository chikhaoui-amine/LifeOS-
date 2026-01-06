
import React from 'react';

interface ProgressRingProps {
  radius?: number;
  stroke?: number;
  progress: number;
  color?: string; // Expects text color classes like 'text-primary-600'
  trackColor?: string; // Expects text color classes like 'text-gray-200'
  showValue?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  radius = 60, 
  stroke = 8, 
  progress,
  color = 'text-primary-600',
  trackColor = 'text-gray-200 dark:text-gray-700',
  showValue = true
}) => {
  const viewBoxSize = 100;
  const center = viewBoxSize / 2;
  
  const strokeWidth = (stroke / (radius * 2)) * 100;
  const r = center - (strokeWidth / 2);

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full rotate-[-90deg] overflow-visible"
      >
        <defs>
           <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
           </filter>
        </defs>

        {/* Outer Shadow Ring (Optional depth) */}
        <circle
          className="text-black/5 dark:text-white/5 stroke-current fill-transparent"
          strokeWidth={strokeWidth + 2}
          r={r}
          cx={center}
          cy={center}
        />

        {/* Background Track */}
        <circle
          className={`${trackColor} stroke-current fill-transparent opacity-10`}
          strokeWidth={strokeWidth}
          r={r}
          cx={center}
          cy={center}
        />

        {/* Progress Path with Glow */}
        <circle
          className={`${color} stroke-current fill-transparent transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - Math.min(100, Math.max(0, progress))}
          strokeLinecap="round"
          filter="url(#ringGlow)"
          r={r}
          cx={center}
          cy={center}
        />
        
        {/* Subtle Inner Accent Ring */}
        <circle
          className={`${color} stroke-current fill-transparent opacity-20`}
          strokeWidth={1}
          pathLength="100"
          strokeDasharray="1, 4"
          r={r - strokeWidth}
          cx={center}
          cy={center}
        />
      </svg>
      {showValue && (
        <div className="absolute flex flex-col items-center justify-center text-gray-900 dark:text-white">
          <span className="text-3xl font-black tracking-tighter leading-none">{Math.round(progress)}<span className="text-sm opacity-40 ml-0.5">%</span></span>
        </div>
      )}
    </div>
  );
};
