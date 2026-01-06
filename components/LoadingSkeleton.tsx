import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, type = 'card' }) => {
  return (
    <div className={`grid ${type === 'card' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid-cols-1 gap-3'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
};