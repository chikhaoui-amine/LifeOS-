
import React from 'react';
import { Goal } from '../../types';

interface LifeBalanceWheelProps {
  goals: Goal[];
  size?: number;
}

const CATEGORIES = [
  'Career & Business',
  'Financial',
  'Health & Fitness',
  'Relationships',
  'Personal Dev',
  'Fun & Rec', 
  'Spiritual',
  'Contribution'
];

export const LifeBalanceWheel: React.FC<LifeBalanceWheelProps> = ({ goals, size = 300 }) => {
  const scores = CATEGORIES.map(cat => {
    const catGoals = goals.filter(g => 
        (g.category.includes(cat) || (cat === 'Fun & Rec' && (g.category.includes('Adventure') || g.category.includes('Hobbies')))) && 
        g.status !== 'cancelled'
    );
    if (catGoals.length === 0) return 2; 
    const totalProgress = catGoals.reduce((acc, g) => acc + (g.currentValue / g.targetValue), 0);
    return 3 + ((totalProgress / catGoals.length) * 7);
  });

  const center = size / 2;
  const radius = (size / 2) - 35; // Adjusted radius for better fit
  const angleStep = (Math.PI * 2) / CATEGORIES.length;

  const getPoint = (index: number, value: number) => {
    const angle = (index * angleStep) - (Math.PI / 2);
    const r = (value / 10) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r
    };
  };

  const points = scores.map((val, i) => {
    const p = getPoint(i, val);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Subtle Outer Boundary */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
          
          {/* Axis Lines */}
          {CATEGORIES.map((_, i) => {
            const p = getPoint(i, 10);
            return (
              <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            );
          })}

          {/* Minimalist Data Shape */}
          <polygon
            points={points}
            fill="rgb(var(--color-primary-rgb) / 0.15)"
            stroke="rgb(var(--color-primary-rgb))"
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
          />

          {/* Vertex Dots */}
          {scores.map((val, i) => {
            const p = getPoint(i, val);
            return (
              <circle key={i} cx={p.x} cy={p.y} r="2.5" className="fill-primary-600 transition-all duration-1000" />
            );
          })}

          {/* Enhanced Labels for Visibility with Higher Contrast */}
          {CATEGORIES.map((cat, i) => {
            const angle = (i * angleStep) - (Math.PI / 2);
            const labelR = radius + 18; // Pulled in slightly for tighter scale
            const x = center + Math.cos(angle) * labelR;
            const y = center + Math.sin(angle) * labelR;
            
            let anchor: "middle" | "start" | "end" = 'middle';
            if (x > center + 10) anchor = 'start';
            if (x < center - 10) anchor = 'end';

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="text-[7px] font-black fill-foreground uppercase tracking-[0.15em]"
              >
                {cat.split(' ')[0]}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 text-center">
        <span className="text-[9px] font-black text-foreground uppercase tracking-[0.3em]">Integrity Balance</span>
      </div>
    </div>
  );
};
