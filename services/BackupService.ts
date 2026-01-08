import { BackupData, Habit, Task, AppSettings } from '../types';
import { storage } from '../utils/storage';

const AUTO_BACKUP_KEY = 'lifeos_auto_backups';
const MAX_AUTO_BACKUPS = 7;

// Global event for modules to listen to when a sync happens
export const SYNC_RELOAD_EVENT = 'lifeos-data-reload';

export const STORAGE_KEYS = {
  SETTINGS: 'lifeos_settings_v1',
  HABITS: 'lifeos_habits_v2',
  HABIT_CATEGORIES: 'lifeos_habit_categories_v1',
  TASKS: 'lifeos_tasks_v2',
  GOALS: 'lifeos_goals_v1',
  JOURNAL: 'lifeos_journal_v1',
  VISION_BOARD: 'lifeos_vision_board_v1',
  REPORTS: 'lifeos_reports_v2',
  TIME_BLOCKS: 'lifeos_time_blocks_v1',
  FINANCE_ACCOUNTS: 'lifeos_finance_accounts_v1',
  FINANCE_TXS: 'lifeos_finance_transactions_v1',
  FINANCE_BUDGETS: 'lifeos_finance_budgets_v1',
  FINANCE_GOALS: 'lifeos_finance_goals_v1',
  FINANCE_CURRENCY: 'lifeos_finance_currency_v1',
  MEAL_RECIPES: 'lifeos_recipes_v1',
  MEAL_FOODS: 'lifeos_foods_v1',
  MEAL_PLANS: 'lifeos_meal_plans_v1',
  MEAL_SHOPPING: 'lifeos_shopping_list_v1',
  SLEEP_LOGS: 'lifeos_sleep_logs_v1',
  SLEEP_SETTINGS: 'lifeos_sleep_settings_v1',
  DEEN_PRAYERS: 'lifeos_islamic_data_v2',
  DEEN_QURAN: 'lifeos_quran_v2',
  DEEN_ADHKAR: 'lifeos_adhkar_v1',
  DEEN_SETTINGS: 'lifeos_islamic_settings_v1',
  CUSTOM_THEMES: 'lifeos_custom_themes',
  ACTIVE_THEME: 'lifeos_active_theme_object',
  WELLNESS_APPS: 'lifeos_wellness_apps_v1',
  WELLNESS_SETTINGS: 'lifeos_wellness_settings_v1',
  WELLNESS_STATS: 'lifeos_wellness_stats_v1',
};

export const BackupService = {
  createBackupData: (habits: Habit[], tasks: Task[], settings: AppSettings): BackupData => {
    return {
      version: "1.8.0",
      appVersion: "1.8.0",
      exportDate: new Date().toISOString(),
      habits: habits || [],
      tasks: tasks || [],
      settings: settings
    };
  },

  downloadBackup: async (data: BackupData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `LifeOS_Master_Backup_${dateStr}.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  },

  validateBackup: (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    return !!data.settings && (!!data.habits || !!data.tasks);
  },

  readBackupFile: (file: File): Promise<BackupData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          if (BackupService.validateBackup(data)) resolve(data as BackupData);
          else reject(new Error("Invalid LifeOS backup format"));
        } catch (error) { reject(new Error("Failed to parse JSON file")); }
      };
      reader.readAsText(file);
    });
  },

  performReplace: async (data: BackupData) => {
    try {
        const ops = [];
        if (data.settings) ops.push(storage.save(STORAGE_KEYS.SETTINGS, data.settings));
        if (data.habits) ops.push(storage.save(STORAGE_KEYS.HABITS, data.habits));
        if (data.habitCategories) ops.push(storage.save(STORAGE_KEYS.HABIT_CATEGORIES, data.habitCategories));
        if (data.tasks) ops.push(storage.save(STORAGE_KEYS.TASKS, data.tasks));
        if (data.goals) ops.push(storage.save(STORAGE_KEYS.GOALS, data.goals));
        if (data.journal) ops.push(storage.save(STORAGE_KEYS.JOURNAL, data.journal));
        if (data.visionBoard) ops.push(storage.save(STORAGE_KEYS.VISION_BOARD, data.visionBoard));
        if (data.reports) ops.push(storage.save(STORAGE_KEYS.REPORTS, data.reports));
        if (data.timeBlocks) ops.push(storage.save(STORAGE_KEYS.TIME_BLOCKS, data.timeBlocks));

        if (data.finance) {
          ops.push(storage.save(STORAGE_KEYS.FINANCE_ACCOUNTS, data.finance.accounts || []));
          ops.push(storage.save(STORAGE_KEYS.FINANCE_TXS, data.finance.transactions || []));
          ops.push(storage.save(STORAGE_KEYS.FINANCE_BUDGETS, data.finance.budgets || []));
          ops.push(storage.save(STORAGE_KEYS.FINANCE_GOALS, data.finance.savingsGoals || []));
          if (data.finance.currency) ops.push(storage.save(STORAGE_KEYS.FINANCE_CURRENCY, data.finance.currency));
        }
        
        if (data.meals) {
          ops.push(storage.save(STORAGE_KEYS.MEAL_RECIPES, data.meals.recipes || []));
          ops.push(storage.save(STORAGE_KEYS.MEAL_FOODS, data.meals.foods || []));
          ops.push(storage.save(STORAGE_KEYS.MEAL_PLANS, data.meals.mealPlans || []));
          ops.push(storage.save(STORAGE_KEYS.MEAL_SHOPPING, data.meals.shoppingList || []));
        }
        
        if (data.sleepLogs) ops.push(storage.save(STORAGE_KEYS.SLEEP_LOGS, data.sleepLogs));
        if (data.sleepSettings) ops.push(storage.save(STORAGE_KEYS.SLEEP_SETTINGS, data.sleepSettings));
        
        if (data.prayers) ops.push(storage.save(STORAGE_KEYS.DEEN_PRAYERS, data.prayers));
        if (data.quran) ops.push(storage.save(STORAGE_KEYS.DEEN_QURAN, data.quran));
        if (data.adhkar) ops.push(storage.save(STORAGE_KEYS.DEEN_ADHKAR, data.adhkar));
        if (data.islamicSettings) ops.push(storage.save(STORAGE_KEYS.DEEN_SETTINGS, data.islamicSettings));
        
        if (data.customThemes) ops.push(storage.save(STORAGE_KEYS.CUSTOM_THEMES, data.customThemes));

        // Digital Wellness Sync
        if ((data as any).wellnessApps) ops.push(storage.save(STORAGE_KEYS.WELLNESS_APPS, (data as any).wellnessApps));
        if ((data as any).wellnessSettings) ops.push(storage.save(STORAGE_KEYS.WELLNESS_SETTINGS, (data as any).wellnessSettings));
        if ((data as any).wellnessStats) ops.push(storage.save(STORAGE_KEYS.WELLNESS_STATS, (data as any).wellnessStats));
        
        await Promise.all(ops);
        window.dispatchEvent(new CustomEvent(SYNC_RELOAD_EVENT));
        return true;
    } catch (e) {
        console.error("Critical Sync Replace Failure:", e);
        throw e;
    }
  },

  saveAutoSnapshot: async (snapshot: BackupData) => {
    const history = await storage.load<BackupData[]>(AUTO_BACKUP_KEY) || [];
    const newHistory = [snapshot, ...history].slice(0, MAX_AUTO_BACKUPS);
    await storage.save(AUTO_BACKUP_KEY, newHistory);
  }
};