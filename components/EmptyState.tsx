import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Icon size={40} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};