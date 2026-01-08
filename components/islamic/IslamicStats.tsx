import React, { useMemo, useState, useEffect } from 'react';
import { useIslamic } from '../../context/IslamicContext';
import { useSettings } from '../../context/SettingsContext';
import { Star, Moon } from 'lucide-react';
import { LineChart } from '../Charts';
import { getHijriKey } from '../../utils/islamicUtils';
import { LanguageCode, DeenStatus } from '../../types';

export const IslamicStats: React.FC = () => {
  const { prayers, adhkar, settings: islamicSettings } = useIslamic();
  const { settings } = useSettings();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
        const isDone = (s: DeenStatus) => s === 'on-time' || s === 'late';
        const adhkarCount = dayAdhkar ? 
            (isDone(dayAdhkar.morningStatus) ? 1 : 0) + 
            (isDone(dayAdhkar.eveningStatus) ? 1 : 0) + 
            (isDone(dayAdhkar.nightStatus) ? 1 : 0) : 0;

        // Sunnah Count
        const dayPrayer = prayers.find(p => p.date === key);
        const sunnahCount = dayPrayer ? dayPrayer.sunnahs.filter(s => isDone(s.status)).length : 0;

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

  const chartHeight = isMobile ? 140 : 200;

  return (
    <div className="space-y-4 sm:space-y-6">
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Adhkar Curve (Line Chart) */}
          <div className="bg-surface p-5 sm:p-6 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col">
             <div className="mb-4 sm:mb-6">
                <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                   <Moon size={16} className="text-indigo-500" /> Weekly Adhkar
                </h4>
                <p className="text-[10px] text-muted">Sun - Sat progress cycle.</p>
             </div>
             <div className="flex-1 min-h-[140px] sm:min-h-[200px]">
                <LineChart 
                    data={weekAdhkarValues} 
                    labels={weekLabels} 
                    color="#6366f1" 
                    height={chartHeight} 
                    goalValue={3} 
                />
             </div>
          </div>

          {/* Sunnah Curve (Line Chart) */}
          <div className="bg-surface p-5 sm:p-6 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col">
             <div className="mb-4 sm:mb-6">
                <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                   <Star size={16} className="text-amber-500" /> Sunnah & Nafl
                </h4>
                <p className="text-[10px] text-muted">Sun - Sat voluntary reps.</p>
             </div>
             <div className="flex-1 min-h-[140px] sm:min-h-[200px]">
                <LineChart 
                    data={weekSunnahValues} 
                    labels={weekLabels} 
                    color="#f59e0b" 
                    height={chartHeight} 
                    goalValue={5} 
                />
             </div>
          </div>

       </div>
    </div>
  );
};