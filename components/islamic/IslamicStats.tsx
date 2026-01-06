
import React, { useMemo } from 'react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { Star, Moon } from 'lucide-react';
import { LineChart } from '../Charts';
import { getHijriKey } from '../../utils/islamicUtils';
import { LanguageCode } from '../../types';

export const IslamicStats: React.FC = () => {
  const { prayers, adhkar, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  
  // --- Calculate Current Week Data (Sunday to Saturday) for Curves ---
  const currentWeekData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
    
    const data = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const key = getHijriKey(d, islamicSettings.hijriAdjustment);
        const dayName = d.toLocaleDateString(settings?.preferences?.language, { weekday: 'short' });

        // Adhkar Count (0-3)
        const dayAdhkar = adhkar.find(a => a.date === key);
        const adhkarCount = dayAdhkar ? 
            (dayAdhkar.morningCompleted ? 1 : 0) + 
            (dayAdhkar.eveningCompleted ? 1 : 0) + 
            (dayAdhkar.nightCompleted ? 1 : 0) : 0;

        // Sunnah Count
        const dayPrayer = prayers.find(p => p.date === key);
        const sunnahCount = dayPrayer ?
            (dayPrayer.sunnahFajr ? 1 : 0) +
            (dayPrayer.duha ? 1 : 0) +
            (dayPrayer.sunnahDhuhr ? 1 : 0) +
            (dayPrayer.sunnahAsr ? 1 : 0) +
            (dayPrayer.sunnahMaghrib ? 1 : 0) +
            (dayPrayer.sunnahIsha ? 1 : 0) +
            (dayPrayer.witr ? 1 : 0) : 0;

        data.push({
            day: dayName,
            adhkar: adhkarCount,
            sunnah: sunnahCount
        });
    }
    return data;
  }, [adhkar, prayers, islamicSettings.hijriAdjustment, settings?.preferences?.language]);

  const weekLabels = currentWeekData.map(d => d.day);
  const weekAdhkarValues = currentWeekData.map(d => d.adhkar);
  const weekSunnahValues = currentWeekData.map(d => d.sunnah);

  return (
    <div className="space-y-6">
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Adhkar Curve (Line Chart) */}
          <div className="bg-surface p-6 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col">
             <div className="mb-6">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                   <Moon size={18} className="text-indigo-500" /> Weekly Adhkar
                </h4>
                <p className="text-xs text-muted">Completed daily adhkar (Sun - Sat).</p>
             </div>
             <div className="flex-1 min-h-[200px]">
                <LineChart 
                    data={weekAdhkarValues} 
                    labels={weekLabels} 
                    color="#6366f1" 
                    height={200} 
                    goalValue={3} 
                />
             </div>
          </div>

          {/* Sunnah Curve (Line Chart) */}
          <div className="bg-surface p-6 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col">
             <div className="mb-6">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                   <Star size={18} className="text-amber-500" /> Sunnah & Nafl
                </h4>
                <p className="text-xs text-muted">Voluntary prayers (Sun - Sat).</p>
             </div>
             <div className="flex-1 min-h-[200px]">
                <LineChart 
                    data={weekSunnahValues} 
                    labels={weekLabels} 
                    color="#f59e0b" 
                    height={200} 
                    goalValue={5} // Soft goal for sunnahs
                />
             </div>
          </div>

       </div>
    </div>
  );
};
