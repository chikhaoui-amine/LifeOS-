
export const getTodayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getWeekKey = (date: Date, startOfWeek: 'sunday' | 'monday' = 'sunday'): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (startOfWeek === 'monday' ? (day === 0 ? -6 : 1) : 0);
  const monday = new Date(d.setDate(diff));
  return formatDateKey(monday);
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

export const getRelativeTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const today = new Date(getTodayKey());
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return getDayName(target);
  return `${diffDays} days left`;
};

/**
 * Calculates the CURRENT active streak
 */
export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const today = getTodayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
     return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  
  if (!sortedDates.includes(formatDateKey(currentDate))) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateKey = formatDateKey(currentDate);
    if (sortedDates.includes(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculates the ALL-TIME longest streak
 */
export const calculateBestStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sorted = [...new Set(completedDates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let maxStreak = 1;
  let current = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i-1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
    
    // Dates are formatted YYYY-MM-DD, so diff of 1 means consecutive days
    if (Math.round(diff) === 1) {
      current++;
    } else {
      maxStreak = Math.max(maxStreak, current);
      current = 1;
    }
  }
  return Math.max(maxStreak, current);
};

// Calendar Helpers
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = [];
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDayIndex = firstDay.getDay(); 
  for (let i = startingDayIndex; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push(d);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const isSameMonth = (d1: Date, d2: Date) => {
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

export const isToday = (d: Date) => {
  const today = new Date();
  return d.getDate() === today.getDate() && 
         d.getMonth() === today.getMonth() && 
         d.getFullYear() === today.getFullYear();
};
