
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
  
  // Reordered routes for a logical productivity flow
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
    { id: 'settings', path: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const tabs = allRoutes.filter(route => {
    if (['today', 'settings'].includes(route.id)) return true;
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

      {/* Header - Styled to match premium dark pill navigation */}
      <header className="shrink-0 z-50 sticky top-0 transition-all duration-300 safe-top pt-2 px-2 sm:px-4">
        <div className="max-w-full mx-auto w-full bg-[#09090b] border border-white/5 rounded-[2rem] px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl ring-1 ring-white/5">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => window.location.href = '#'}>
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 transform group-hover:rotate-12 transition-transform">
                <Zap size={16} fill="white" />
              </div>
            </div>
            <div className="hidden xl:flex flex-col -space-y-1">
              <span className="font-black text-xs tracking-tighter uppercase text-white">LifeOS</span>
              <span className="text-[6px] font-black text-primary tracking-widest uppercase leading-none">Core</span>
            </div>
          </div>

          {/* Centered Pill Navigation */}
          <div className="flex-1 relative flex items-center justify-center h-full mx-4 overflow-hidden">
             <nav 
               ref={scrollContainerRef} 
               className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
             >
               {tabs.map((route) => (
                 <NavLink
                   key={route.id}
                   to={route.path}
                   className={({ isActive }) => `
                     flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap group
                     ${isActive 
                       ? 'active-nav-item bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                       : 'text-white/60 hover:text-white hover:bg-white/5'}
                   `}
                 >
                   <route.icon 
                     size={18} 
                     strokeWidth={2.5} 
                     className="transition-transform group-hover:scale-110"
                   />
                   <span className={location.pathname === route.path ? 'block' : 'hidden lg:block'}>
                     {route.label}
                   </span>
                 </NavLink>
               ))}
             </nav>
          </div>

          {/* User Status Section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
             <div className="flex items-center gap-1 sm:gap-2">
                {isGoogleConnected && (
                  <button 
                    onClick={syncNow} 
                    className={`p-2 rounded-full transition-all duration-500 border border-transparent active:scale-90 ${isSyncing ? 'text-primary bg-primary/10 animate-spin' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                    title="Force Sync"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}
                
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => `
                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}
                  `}
                >
                   <Settings size={18} />
                </NavLink>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar z-10 px-4 md:px-8 pt-4 sm:pt-6" id="main-content">
        <div className="max-w-[1300px] mx-auto w-full pb-32">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
