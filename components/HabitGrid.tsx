import React from 'react';
import { formatDateKey } from '../utils/dateUtils';

interface HabitGridProps {
  completedDates: string[];
  color: string;
  size?: 'sm' | 'md' | 'lg';
  daysToShow?: number;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ 
  completedDates, 
  color, 
  size = 'md',
  daysToShow = 105 // ~3.5 months (fits nicely in grids)
}) => {
  const dates = Array.from({ length: daysToShow }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((daysToShow - 1) - i));
    return {
      date: d,
      key: formatDateKey(d)
    };
  });

  const cellSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';

  // Map color names to Tailwind classes for dynamic rendering
  const getColorClass = (active: boolean) => {
    if (!active) return 'bg-gray-100 dark:bg-gray-700';
    
    // Simple mapping for demo, usually you'd use direct hex or a comprehensive map
    if (color === 'indigo') return 'bg-indigo-500';
    if (color === 'blue') return 'bg-blue-500';
    if (color === 'green') return 'bg-green-500';
    if (color === 'amber') return 'bg-amber-500';
    if (color === 'red') return 'bg-red-500';
    if (color === 'purple') return 'bg-purple-500';
    if (color === 'pink') return 'bg-pink-500';
    return 'bg-primary-500';
  };

  return (
    <div className={`flex flex-wrap ${gap} justify-end`}>
      {dates.map((item) => {
        const isCompleted = completedDates.includes(item.key);
        return (
          <div
            key={item.key}
            title={`${item.key}: ${isCompleted ? 'Completed' : 'Missed'}`}
            className={`
              ${cellSize} rounded-sm transition-all duration-300
              ${getColorClass(isCompleted)}
              ${isCompleted ? 'opacity-100 scale-100' : 'opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600'}
            `}
          />
        );
      })}
    </div>
  );
};