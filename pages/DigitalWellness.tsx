
import React, { useMemo } from 'react';
import { Smartphone, Zap, Shield, Chrome, Lock, LayoutGrid } from 'lucide-react';
import { useDigitalWellness } from '../context/DigitalWellnessContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { AppBlockerList } from '../components/digital-wellness/AppBlockerList';
import { StrictModeSetup } from '../components/digital-wellness/StrictModeSetup';
import { FocusMode } from '../components/digital-wellness/FocusMode';
import { StrictModeOverlay } from '../components/digital-wellness/StrictModeOverlay';
import { StatsCard } from '../components/StatsCard';
import { LanguageCode } from '../types';

const DigitalWellness: React.FC = () => {
  const { settings: dwSettings, strictModeTimeLeft, stats } = useDigitalWellness();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const formattedScreenTime = useMemo(() => {
    const h = Math.floor(stats.screenTimeMinutes / 60);
    const m = stats.screenTimeMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [stats.screenTimeMinutes]);

  const productivityScore = useMemo(() => {
    const focusRatio = Math.min(1, stats.completedFocusMinutes / 120);
    const screenTimePenalty = Math.max(0, (stats.screenTimeMinutes - stats.completedFocusMinutes) / 240);
    const score = Math.max(0, Math.round((focusRatio * 100) - (screenTimePenalty * 20)));
    return score;
  }, [stats.completedFocusMinutes, stats.screenTimeMinutes]);

  const productivityLabel = useMemo(() => {
    if (productivityScore >= 80) return "High Productivity";
    if (productivityScore >= 50) return "Moderate Flow";
    if (productivityScore >= 20) return "Getting Started";
    return "Idle Today";
  }, [productivityScore]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <StrictModeOverlay />
      
      {/* Header - Optimized for Mobile */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-4 relative">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
              <Smartphone size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">{t.wellness.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">{t.wellness.subtitle}</span>
              </div>
           </div>
        </div>

        {dwSettings.strictMode && (
           <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 animate-pulse text-xs sm:text-sm self-start">
              <Lock size={14} /> {t.wellness.active}: {Math.floor(strictModeTimeLeft/60)}m left
           </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
         {/* Dynamic Stats */}
         <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatsCard 
              title={t.wellness.screenTime} 
              value={formattedScreenTime} 
              icon={Smartphone} 
              color="indigo" 
              subtitle="Today (Active)" 
            />
            <StatsCard 
              title={t.wellness.loads} 
              value={stats.unlocks} 
              icon={Lock} 
              color="orange" 
              subtitle="Today" 
            />
            <StatsCard 
              title={t.wellness.productivity} 
              value={productivityScore} 
              icon={Zap} 
              color="green" 
              subtitle={productivityLabel} 
            />
         </div>

         {/* Left Col: Focus Timer */}
         <div className="lg:col-span-1 h-full min-h-[350px]">
            <FocusMode />
         </div>

         {/* Center Col: Strict Mode & Blocker */}
         <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {!dwSettings.strictMode ? (
               <StrictModeSetup />
            ) : (
               <div className="bg-red-50 dark:bg-red-900/10 p-6 sm:p-8 rounded-3xl border border-red-200 dark:border-red-800 text-center">
                  <Shield size={40} className="mx-auto text-red-500 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t.wellness.active}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{t.wellness.locked}</p>
               </div>
            )}
            
            <AppBlockerList />
         </div>
      </div>

      {/* Browser Extension Promo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
               <Chrome size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold mb-1">{t.wellness.extension}</h3>
               <p className="text-blue-100 mb-4 max-w-xl text-sm">
                  To enable robust website blocking that can't be bypassed by closing the tab, install the LifeOS Companion extension. Syncs with your Strict Mode settings.
               </p>
               <button className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg text-sm">
                  Install Extension
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default DigitalWellness;
