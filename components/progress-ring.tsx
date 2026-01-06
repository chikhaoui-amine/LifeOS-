import React from 'react';

interface ProgressRingProps {
  radius?: number;
  stroke?: number;
  progress: number;
  color?: string;
  trackColor?: string;
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
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full rotate-[-90deg] overflow-visible">
        <circle className={`${trackColor} stroke-current fill-transparent opacity-10`} strokeWidth={strokeWidth} r={r} cx={center} cy={center} />
        <circle
          className={`${color} stroke-current fill-transparent transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - Math.min(100, Math.max(0, progress))}
          strokeLinecap="round"
          r={r}
          cx={center}
          cy={center}
        />
      </svg>
      {showValue && (
        <div className="absolute flex flex-col items-center justify-center text-foreground">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">{Math.round(progress)}<span className="text-[10px] opacity-40 ml-0.5">%</span></span>
        </div>
      )}
    </div>
  );
};