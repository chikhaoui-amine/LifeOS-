
import React, { useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  ListTodo, 
  CalendarDays, 
  BarChart3, 
  Settings,
  Target,
  Book,
  Moon,
  DollarSign,
  Utensils,
  BedDouble,
  RefreshCw,
  Zap,
  FileText,
  Compass
} from 'lucide-react';
import { NavRoute, LanguageCode } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useSync } from '../context/SyncContext';
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { getTranslation, isRTL } from '../utils/translations';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { settings, isGoogleConnected } = useSettings();
  const { isSyncing, syncNow } = useSync();
  const { habits } = useHabits();
  const { tasks } = useTasks();
  
  const language = (settings?.preferences?.language || 'en') as LanguageCode;
  const t = useMemo(() => getTranslation(language), [language]);
  const rtl = isRTL(language);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const allRoutes: NavRoute[] = [
    { id: 'today', path: '/', label: t.nav.today, icon: LayoutDashboard },
    { id: 'tasks', path: '/tasks', label: t.nav.tasks, icon: ListTodo },
    { id: 'habits', path: '/habits', label: t.nav.habits, icon: CheckCircle2 },
    { id: 'goals', path: '/goals', label: t.nav.goals, icon: Target },
    { id: 'vision', path: '/vision', label: 'Vision', icon: Compass },
    { id: 'calendar', path: '/calendar', label: t.nav.calendar, icon: CalendarDays },
    { id: 'journal', path: '/journal', label: t.nav.journal, icon: Book },
    { id: 'deen', path: '/deen', label: t.nav.deen, icon: Moon },
    { id: 'finance', path: '/finance', label: t.nav.finance, icon: DollarSign },
    { id: 'meals', path: '/meals', label: t.nav.meals, icon: Utensils },
    { id: 'sleep', path: '/sleep', label: t.nav.sleep, icon: BedDouble },
    { id: 'stats', path: '/statistics', label: t.nav.stats, icon: BarChart3 },
    { id: 'reports', path: '/reports', label: 'Reports', icon: FileText },
  ];

  const tabs = allRoutes.filter(route => {
    if (['today'].includes(route.id)) return true;
    if (settings?.disabledModules?.includes(route.id)) return false;
    if (route.id === 'deen' && !settings?.preferences?.enableIslamicFeatures) return false;
    return true;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const activeElement = scrollContainerRef.current.querySelector('.active-nav-item') as HTMLElement;
        if (activeElement) {
          const container = scrollContainerRef.current;
          const scrollLeft = activeElement.offsetLeft - (container.offsetWidth / 2) + (activeElement.offsetWidth / 2);
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans transition-colors duration-500 relative ${rtl ? 'rtl' : 'ltr'}`}>
      
      {/* Immersive Background Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
         <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
         <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--color-text-rgb),0.02)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Header - Refined Height and Floating Effect */}
      <header className="shrink-0 z-50 sticky top-0 transition-all duration-300 safe-top pt-2 sm:pt-3 px-2 sm:px-4">
        <div className="max-w-[1400px] mx-auto w-full bg-surface/80 backdrop-blur-2xl border border-foreground/10 rounded-3xl px-3 sm:px-6 h-16 flex items-center justify-between shadow-2xl ring-1 ring-white/10 dark:ring-black/20">
          
          {/* Enhanced Logo Section */}
          <div className="flex items-center gap-3 shrink-0 pl-1">
            <div className="relative group cursor-pointer" onClick={() => window.location.href = '#'}>
              <div className="relative w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25 transform group-hover:rotate-6 transition-all group-active:scale-90">
                <Zap size={18} fill="white" className="animate-pulse" />
              </div>
            </div>
            <div className="hidden lg:flex items-baseline gap-0.5">
              <span className="font-black text-xl tracking-tighter text-foreground">Life</span>
              <span className="font-bold text-xl tracking-tighter text-primary">OS</span>
            </div>
          </div>

          {/* Centered Pill Navigation - Enhanced Appearance */}
          <div className="flex-1 relative flex items-center justify-center h-full mx-4 overflow-hidden">
             <nav 
               ref={scrollContainerRef} 
               className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 px-4"
             >
               {tabs.map((route) => {
                 const isActive = location.pathname === route.path || (route.path !== '/' && location.pathname.startsWith(route.path));
                 return (
                   <NavLink
                     key={route.id}
                     to={route.path}
                     className={`
                       flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap group relative
                       ${isActive 
                         ? 'active-nav-item bg-primary text-white shadow-xl shadow-primary/20 scale-105 z-10' 
                         : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}
                     `}
                   >
                     {/* Subtle icon highlight for active state */}
                     <div className={`relative shrink-0 flex items-center justify-center transition-transform duration-500 ${isActive ? 'rotate-[360deg]' : 'group-hover:scale-110'}`}>
                        <route.icon 
                          size={16} 
                          strokeWidth={isActive ? 3 : 2.5} 
                          className="relative z-10"
                        />
                        {isActive && <div className="absolute inset-[-4px] bg-white/20 blur-md rounded-full -z-10 animate-pulse" />}
                     </div>
                     <span className={`leading-none ${isActive ? 'block' : 'hidden xl:block'}`}>
                       {route.label}
                     </span>
                     
                     {/* Bottom Indicator for non-active hover */}
                     {!isActive && (
                       <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary/40 rounded-full transition-all group-hover:w-1/3" />
                     )}
                   </NavLink>
                 );
               })}
             </nav>
          </div>

          {/* User Status Section - Refined */}
          <div className="flex items-center gap-2 shrink-0">
             {isGoogleConnected && (
               <button 
                 onClick={syncNow} 
                 className={`p-2.5 rounded-2xl transition-all duration-500 border border-transparent active:scale-90 relative group ${isSyncing ? 'text-primary bg-primary/10 animate-spin' : 'text-foreground/40 hover:bg-foreground/5 hover:text-foreground'}`}
                 title="Force Sync"
               >
                 <RefreshCw size={16} strokeWidth={2.5} />
                 {!isSyncing && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full border border-surface" />}
               </button>
             )}
             
             <NavLink 
               to="/settings" 
               className={({ isActive }) => `
                 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 relative group
                 ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground'}
               `}
             >
                {({ isActive }) => (
                  <>
                    <Settings size={17} strokeWidth={isActive ? 3 : 2.5} />
                    <span className="absolute inset-0 rounded-2xl border border-white/10 dark:border-black/20 pointer-events-none" />
                  </>
                )}
             </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar z-10 px-4 md:px-8 pt-6 sm:pt-8" id="main-content">
        <div className="max-w-[1400px] mx-auto w-full pb-32">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
