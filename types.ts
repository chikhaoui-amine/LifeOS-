
import { LucideIcon } from 'lucide-react';

export interface NavRoute {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

export type LanguageCode = 'en' | 'ar' | 'es' | 'fr';

export type FrequencyType = 'daily' | 'weekly' | 'once';
export type HabitType = 'boolean' | 'counter' | 'timer';

export type MoodType = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'excited' | 'grateful' | 'tired';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  type: HabitType;
  goal: number;
  unit: string;
  frequency: {
    type: FrequencyType;
    days: number[];
  };
  completedDates: string[]; 
  progress: Record<string, number>; 
  archived: boolean;
  createdAt: string;
  reminders: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueTime?: string;
  dueWeek?: string; 
  dueMonth?: string; 
  category: string;
  tags: string[];
  subtasks: Subtask[];
  completedAt?: string;
  createdAt: string;
}

export type VisionItemType = 'image' | 'quote' | 'goal_ref' | 'affirmation' | 'sticker' | 'shape';

export interface VisionItem {
  id: string;
  type: VisionItemType;
  content: string; 
  caption?: string; 
  subContent?: string; 
  width: '1' | '2'; 
  height: '1' | '2' | '3'; 
  x?: number;
  y?: number;
  widthPx?: number;
  heightPx?: number;
  rotation?: number;
  zIndex?: number;
  opacity?: number;
  scale?: number;
  color?: string; 
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  linkedGoalId?: string;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; 
  endTime: string;   
  duration: number;  
  date: string;      
  category: string;
  color: string;
  completed: boolean;
  notes?: string;
}

export const TIME_BLOCK_CATEGORIES = [
  { name: 'Deep Work', color: '#818cf8', icon: '🧠' },
  { name: 'Meeting', color: '#fbbf24', icon: '👥' },
  { name: 'Chore', color: '#34d399', icon: '🏠' },
  { name: 'Health', color: '#f87171', icon: '💪' },
  { name: 'Learning', color: '#f472b6', icon: '📚' },
  { name: 'Break', color: '#9ca3af', icon: '☕' },
  { name: 'Creative', color: '#a78bfa', icon: '🎨' },
  { name: 'Finance', color: '#4ade80', icon: '💰' },
  { name: 'Family', color: '#fb7185', icon: '❤️' },
  { name: 'Social', color: '#60a5fa', icon: '💬' },
  { name: 'Admin', color: '#94a3b8', icon: '📂' },
  { name: 'Work', color: '#60a5fa', icon: '💼' },
  { name: 'Shopping', color: '#fcd34d', icon: '🛒' },
  { name: 'Travel', color: '#2dd4bf', icon: '✈️' },
  { name: 'Other', color: '#60a5fa', icon: '⭕' },
];

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string; 
  checked?: boolean; 
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  title: string;
  image?: string; 
  icon?: string; 
  description: string;
  prepTime: number; 
  cookTime: number; 
  servings: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  difficulty: Difficulty;
  cuisine: string;
  tags: string[]; 
  ingredients: Ingredient[];
  instructions: string[]; 
  rating: number; 
  isFavorite: boolean;
  sourceUrl?: string;
  notes?: string;
}

export interface Food {
  id: string;
  name: string;
  icon: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize: string; 
  category: string;
  isFavorite: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanDay {
  date: string; 
  breakfast?: string; 
  lunch?: string;
  dinner?: string;
  snack?: string;
  waterIntake: number; 
  caloriesConsumed?: number;
}

export interface ShoppingListItem extends Ingredient {
  recipeId?: string; 
  isCustom?: boolean;
}

export type SleepMood = 'refreshed' | 'normal' | 'groggy' | 'tired' | 'anxious';

export interface SleepLog {
  id: string;
  date: string; 
  bedTime: string; 
  wakeTime: string; 
  durationMinutes: number; 
  qualityRating: number; 
  mood: SleepMood;
  factors: string[]; 
  dreams?: string;
  naps: any[];
  notes?: string;
}

export interface SleepSettings {
  targetHours: number; 
  minHours: number;    
  bedTimeGoal: string; 
  wakeTimeGoal: string; 
  windDownMinutes: number;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalNote {
  id: string;
  content: string;
  date: string;
}

export type GoalTimeFrame = 'long-term' | 'mid-term' | 'short-term' | 'quarterly' | 'monthly';

export type GoalType = 'milestone' | 'numeric' | 'habit';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  timeFrame: GoalTimeFrame;
  startDate: string;
  targetDate: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  motivation?: string;
  milestones: GoalMilestone[];
  notes: GoalNote[];
  tags: string[];
  color: string;
  coverImage?: string;
  linkedHabitIds: string[];
  createdAt: string;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  plainText: string;
  date: string;
  mood: MoodType;
  energyLevel: number;
  tags: string[];
  isFavorite: boolean;
  isLocked: boolean;
  securityPin?: string;
  images?: string[];
  weather?: string;
  location?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  icon: string;
  prompts: string[];
  content: string;
}

export type TransactionType = 'income' | 'expense' | 'savings';

export type AccountType = 'checking' | 'savings' | 'credit' | 'wallet' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isExcludedFromTotal: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  accountId: string;
  toAccountId?: string;
  tags: string[];
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface DailyPrayers {
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  fajrQadha?: boolean;
  dhuhrQadha?: boolean;
  asrQadha?: boolean;
  maghribQadha?: boolean;
  ishaQadha?: boolean;
  sunnahFajr?: boolean;
  sunnahDhuhr?: boolean;
  sunnahAsr?: boolean;
  sunnahMaghrib?: boolean;
  sunnahIsha?: boolean;
  witr?: boolean;
  tahajjud?: boolean;
  duha?: boolean;
}

export interface QuranProgress {
  completedRubus: number[]; 
  lastReadDate: string;
  khatamCount: number;
}

export interface AdhkarProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  nightCompleted: boolean;
  morningCount: number;
  eveningCount: number;
  nightCount: number;
}

export interface IslamicSettings {
  calculationMethod: string;
  asrMethod: string;
  hijriAdjustment: number;
  location: {
    lat: number;
    lng: number;
    city?: string;
  };
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportContent {
  score: number; 
  title: string; 
  summary: string;
  completedItems: string[]; 
  missedItems: string[]; 
  insights: string[]; 
  solutions: string[]; 
  metrics: {
    sleepAvg: number; 
    expenseTotal: number;
    tasksDone: number;
    habitsRate: number; 
    deenScore?: number;
  };
  trends: {
    score: number;
    tasks: number;
    habits: number;
    sleep: number;
  };
}

export interface LifeOSReport {
  id: string;
  period: ReportPeriod;
  dateRange: string; 
  createdAt: string;
  content: ReportContent;
}

export interface BlockedApp {
  id: string;
  name: string;
  url: string;
  category: string;
  isBlocked: boolean;
}

export type BlockMode = 'none' | 'focus' | 'strict';

export interface WellnessSettings {
  strictMode: boolean;
  strictModeEndTime?: string;
  emergencyUnlockUsed: boolean;
}

export interface AppSettings {
  notifications: {
    enabled: boolean;
    habits: boolean;
    tasks: boolean;
    dailySummary: boolean;
    morningTime: string;
    eveningTime: string;
  };
  preferences: {
    language: LanguageCode;
    startOfWeek: 'sunday' | 'monday';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    timeFormat: '12h' | '24h';
    autoBackup: boolean;
    enableIslamicFeatures: boolean;
    reportDay: number; 
  };
  disabledModules: string[];
  islamic?: IslamicSettings;
  sleep?: SleepSettings;
  scratchpad?: string;
  meals?: {
    waterGoal: number;
  };
}

export interface BackupData {
  version: string;
  appVersion: string;
  exportDate: string;
  settings: AppSettings;
  habits: Habit[];
  habitCategories?: string[];
  tasks: Task[];
  goals?: Goal[];
  journal?: JournalEntry[];
  visionBoard?: VisionItem[];
  prayers?: DailyPrayers[];
  quran?: QuranProgress;
  adhkar?: AdhkarProgress[];
  islamicSettings?: IslamicSettings;
  finance?: {
    accounts: Account[];
    transactions: Transaction[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    currency: string;
  };
  meals?: {
    recipes: Recipe[];
    foods: Food[];
    mealPlans: MealPlanDay[];
    shoppingList: ShoppingListItem[];
  };
  sleepLogs?: SleepLog[];
  sleepSettings?: SleepSettings;
  timeBlocks?: TimeBlock[];
  reports?: LifeOSReport[]; 
  customThemes?: Theme[];
}

export type NotificationType = 'habit' | 'task' | 'summary' | 'achievement' | 'streak';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  type: ThemeMode;
  colors: ThemeColors;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  font: 'Inter' | 'Roboto' | 'Poppins' | 'Serif' | 'Mono';
  isCustom?: boolean;
}

export interface ThemeContextType {
  currentTheme: Theme;
  savedThemes: Theme[];
  applyTheme: (theme: Theme) => void;
  updateThemePrimaryColor: (color: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (id: string) => void;
  exportTheme: (theme: Theme) => string;
  importTheme: (json: string) => boolean;
  resetToDefault: () => void;
}
