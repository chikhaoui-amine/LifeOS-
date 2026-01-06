import React from 'react';
import { useJournal } from '../../context/JournalContext';
import { StatsCard } from '../StatsCard';
import { BookOpen, Flame, Smile, TrendingUp } from 'lucide-react';
import { DonutChart } from '../Charts';

export const JournalStats: React.FC = () => {
  const { getStats } = useJournal();
  const { totalEntries, streak, moodDistribution } = getStats();

  const moodData = Object.entries(moodDistribution).map(([mood, count]) => {
     let color = '#9ca3af'; // neutral
     if (['happy', 'excited', 'grateful'].includes(mood)) color = '#22c55e'; // green
     if (['sad', 'anxious', 'angry', 'tired'].includes(mood)) color = '#ef4444'; // red
     if (['calm'].includes(mood)) color = '#3b82f6'; // blue
     
     return { label: mood, value: count, color };
  });

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Entries" value={totalEntries} icon={BookOpen} color="indigo" subtitle="Total written" />
          <StatsCard title="Streak" value={streak} icon={Flame} color="orange" subtitle="Consecutive days" />
          <StatsCard title="Top Mood" value={moodData.sort((a,b) => (b.value as number) - (a.value as number))[0]?.label || 'N/A'} icon={Smile} color="green" subtitle="Most frequent" />
       </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
             <h3 className="font-bold text-gray-900 dark:text-white mb-2">Mood Distribution</h3>
             <p className="text-sm text-gray-500 mb-4">How you've been feeling lately.</p>
             <div className="grid grid-cols-2 gap-2">
                {moodData.slice(0,6).map((m, i) => (
                   <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                      {m.label} ({m.value})
                   </div>
                ))}
             </div>
          </div>
          <div className="shrink-0">
             <DonutChart data={moodData} size={140} thickness={15} />
          </div>
       </div>
    </div>
  );
};