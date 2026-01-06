
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'primary'
}) => {
  // Map generic colors to theme-aware classes if needed, or default to primary
  const iconColorClass = color === 'primary' || color === 'indigo' || color === 'blue' 
    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
    : `text-${color}-600 dark:text-${color}-400 bg-${color}-50 dark:bg-${color}-900/20`;

  return (
    <div className="bg-surface rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl hover-lift">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl shadow-inner ${iconColorClass}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-4xl font-black text-foreground tracking-tighter leading-none">{value}</h3>
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{title}</p>
        {subtitle && <p className="text-xs text-muted italic mt-2 opacity-70">{subtitle}</p>}
      </div>
    </div>
  );
};
