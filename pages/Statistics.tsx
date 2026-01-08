import React, { useState, useMemo } from 'react';
import { 
  Activity, Moon, CheckCircle2, ListTodo, Target, Droplets, Smile, DollarSign, 
  Calendar, ChevronLeft, ChevronRight, BarChart3, Star, Sparkles, TrendingUp,
  Zap, Brain, Wallet
} from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { useGoals } from '../context/GoalContext';
import { useJournal } from '../context/JournalContext';
import { useFinance } from '../context/FinanceContext';
import { useMeals } from '../context/MealContext';
import { useSleep } from '../context/SleepContext';
import { useIslamic } from '../context/IslamicContext';
import { useSettings } from '../context/SettingsContext';
import { LineChart, MultiLineChart } from '../components/Charts';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { formatDateKey } from '../utils/dateUtils';
import { StatsCard } from '../components/StatsCard';
import { DeenStatus } from '../types';

const Statistics: React.FC = () => {
  // Contexts
  const { habits } = useHabits();
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { entries: journal } = useJournal();
  const { transactions, getFormattedCurrency } = useFinance();
  const { mealPlans } = useMeals();
  const { logs: sleepLogs, loading: sleepLoading } = useSleep();
  const { adhkar, prayers } = useIslamic();
  const { settings } = useSettings();

  // State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11

  // Helpers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate strictly the days of the selected month (1 to 28/29/30/31)
  const daysInMonth = useMemo(() => {
    const days = [];
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
        days.push(new Date(selectedYear, selectedMonth, i));
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const labels = daysInMonth.map(d => d.getDate().toString());

  // --- Data Aggregation Logic ---

  const sleepData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      const log = sleepLogs.find(l => l.date === key);
      return log ? Number((log.durationMinutes / 60).toFixed(1)) : 0;
    });
  }, [sleepLogs, daysInMonth]);

  const habitsData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      return habits.filter(h => h.completedDates.includes(key)).length;
    });
  }, [habits, daysInMonth]);

  const tasksData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      return tasks.filter(t => 
        t.completed && 
        (t.completedAt?.startsWith(key) || (!t.completedAt && t.dueDate === key))
      ).length;
    });
  }, [tasks, daysInMonth]);

  const goalsData = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'in-progress' || g.status === 'completed');
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      let progressPoints = 0;
      habits.forEach(h => {
        if (h.completedDates.includes(key)) {
           const isLinked = activeGoals.some(g => g.linkedHabitIds?.includes(h.id));
           if (isLinked) progressPoints++;
        }
      });
      return progressPoints;
    });
  }, [goals, habits, daysInMonth]);

  const hydrationData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      const plan = mealPlans.find(p => p.date === key);
      return plan ? plan.waterIntake : 0;
    });
  }, [mealPlans, daysInMonth]);

  const moodMap: Record<string, number> = { 
    happy: 9, excited: 10, grateful: 8, calm: 7, neutral: 5, 
    tired: 4, anxious: 3, sad: 2, angry: 1 
  };
  const moodData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      const entry = journal.find(j => j.date.startsWith(key));
      return entry ? (moodMap[entry.mood] || 5) : 0;
    });
  }, [journal, daysInMonth]);

  const adhkarData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      const dayAdhkar = adhkar.find(a => a.date === key);
      if (!dayAdhkar) return 0;
      const isDone = (s: DeenStatus) => s === 'on-time' || s === 'late';
      return (isDone(dayAdhkar.morningStatus) ? 1 : 0) + 
             (isDone(dayAdhkar.eveningStatus) ? 1 : 0) + 
             (isDone(dayAdhkar.nightStatus) ? 1 : 0);
    });
  }, [adhkar, daysInMonth]);

  const sunnahData = useMemo(() => {
    return daysInMonth.map(date => {
      const key = formatDateKey(date);
      const dayPrayer = prayers.find(p => p.date === key);
      if (!dayPrayer) return 0;
      const isDone = (s: DeenStatus) => s === 'on-time' || s === 'late';
      return dayPrayer.sunnahs.filter(s => isDone(s.status)).length;
    });
  }, [prayers, daysInMonth]);

  const financeData = useMemo(() => {
    const income: number[] = [];
    const expense: number[] = [];
    const savings: number[] = [];
    daysInMonth.forEach(date => {
      const key = formatDateKey(date);
      const dayTxs = transactions.filter(t => t.date === key);
      income.push(dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0));
      expense.push(dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0));
      savings.push(dayTxs.filter(t => t.type === 'savings').reduce((acc, t) => acc + t.amount, 0));
    });
    return [
      { label: 'Income', data: income, color: '#10b981' },
      { label: 'Expense', data: expense, color: '#ef4444' },
      { label: 'Savings', data: savings, color: '#3b82f6' }
    ];
  }, [transactions, daysInMonth]);

  // Calculate Aggregates for Summary Cards
  const summaryStats = useMemo(() => {
    const totalTasks = tasksData.reduce((a, b) => a + b, 0);
    const sleepDays = sleepData.filter(d => d > 0);
    const avgSleep = sleepDays.length ? (sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length).toFixed(1) : '0';
    const totalHabits = habitsData.reduce((a, b) => a + b, 0);
    const totalSaved = financeData[2].data.reduce((a, b) => a + b, 0); // Savings index 2

    return { totalTasks, avgSleep, totalHabits, totalSaved };
  }, [tasksData, sleepData, habitsData, financeData]);

  if (sleepLoading) return <div className="p-8"><LoadingSkeleton count={4} /></div>;

  const Widget = ({ title, icon: Icon, color, children, className = "" }: any) => (
    <div className={`bg-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm flex flex-col h-full bg-[image:radial-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[image:radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] hover:shadow-md transition-shadow ${className}`}>
       <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
             <Icon size={18} />
          </div>
          <h3 className="font-bold text-foreground uppercase tracking-tight text-sm">{title}</h3>
       </div>
       <div className="flex-1 min-h-[180px]">
          {children}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 rotate-3">
              <BarChart3 size={20} sm-size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">Analytics</h1>
              <div className="flex items-center gap-3 mt-0.5">
                 <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">Performance Insights</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full xl:w-auto">
            {/* Year Selector */}
            <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-1 shrink-0 border border-[var(--color-border)]">
               <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-muted">
                  <ChevronLeft size={16} />
               </button>
               <span className="font-bold text-sm sm:text-base w-14 text-center tabular-nums text-foreground">{selectedYear}</span>
               <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-muted">
                  <ChevronRight size={16} />
               </button>
            </div>

            {/* Grid-based Month Selector */}
            <div className="flex-1 w-full overflow-x-auto no-scrollbar">
               <div className="flex xl:grid xl:grid-cols-12 gap-1.5 p-1">
                  {months.map((m, i) => (
                     <button
                       key={m}
                       onClick={() => setSelectedMonth(i)}
                       className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all text-center border shrink-0 whitespace-nowrap ${selectedMonth === i ? 'bg-primary-600 border-primary-600 text-white shadow-md' : 'bg-surface border-[var(--color-border)] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'}`}
                     >
                        {m.slice(0, 3)}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatsCard 
            title="Tasks Completed" 
            value={summaryStats.totalTasks} 
            icon={ListTodo} 
            color="blue" 
            subtitle="This Month"
         />
         <StatsCard 
            title="Avg Sleep" 
            value={`${summaryStats.avgSleep}h`} 
            icon={Moon} 
            color="indigo" 
            subtitle="Daily Average"
         />
         <StatsCard 
            title="Habit Volume" 
            value={summaryStats.totalHabits} 
            icon={CheckCircle2} 
            color="emerald" 
            subtitle="Total Reps"
         />
         <StatsCard 
            title="Net Savings" 
            value={getFormattedCurrency(summaryStats.totalSaved).split('.')[0]} 
            icon={Wallet} 
            color="green" 
            subtitle="Monthly Saved"
         />
      </div>

      <div className="space-y-8">
         {/* Productivity Section */}
         <section>
            <h2 className="text-sm font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
               <Brain size={16} /> Productivity Core
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               <Widget title="Task Completion" icon={ListTodo} color="blue">
                  <LineChart data={tasksData} labels={labels} color="#3b82f6" height={180} />
               </Widget>
               <Widget title="Habit Consistency" icon={CheckCircle2} color="emerald">
                  <LineChart data={habitsData} labels={labels} color="#10b981" height={180} />
               </Widget>
               <Widget title="Goal Advancement" icon={Target} color="amber">
                  <LineChart data={goalsData} labels={labels} color="#f59e0b" height={180} />
               </Widget>
            </div>
         </section>

         {/* Wellness Section */}
         <section>
            <h2 className="text-sm font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
               <Activity size={16} /> Health & Vitality
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               <Widget title="Sleep Duration" icon={Moon} color="indigo">
                  <LineChart data={sleepData} labels={labels} color="#6366f1" height={180} goalValue={settings?.sleep?.targetHours || 8} />
               </Widget>
               <Widget title="Hydration" icon={Droplets} color="cyan">
                  <LineChart data={hydrationData} labels={labels} color="#06b6d4" height={180} goalValue={settings?.meals?.waterGoal || 8} />
               </Widget>
               <Widget title="Mood & Journaling" icon={Smile} color="pink">
                  <LineChart data={moodData} labels={labels} color="#ec4899" height={180} />
               </Widget>
            </div>
         </section>

         {/* Deen Section (Conditional) */}
         {settings?.preferences?.enableIslamicFeatures && (
            <section>
               <h2 className="text-sm font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Moon size={16} /> Spiritual Growth
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Widget title="Daily Adhkar" icon={Sparkles} color="purple">
                      <LineChart data={adhkarData} labels={labels} color="#8b5cf6" height={180} goalValue={3} />
                  </Widget>
                  <Widget title="Sunnah Prayers" icon={Star} color="orange">
                      <LineChart data={sunnahData} labels={labels} color="#f97316" height={180} goalValue={5} />
                  </Widget>
               </div>
            </section>
         )}

         {/* Finance Section */}
         <section>
            <h2 className="text-sm font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={16} /> Financial Health
            </h2>
            <div className="grid grid-cols-1">
               <Widget title="Financial Flow" icon={TrendingUp} color="green">
                  <MultiLineChart datasets={financeData} labels={labels} height={250} />
               </Widget>
            </div>
         </section>
      </div>
    </div>
  );
};

export default Statistics;