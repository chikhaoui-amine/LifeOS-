
import { BackupData, Habit, Task, AppSettings } from '../types';
import { storage } from '../utils/storage';

export const SYNC_RELOAD_EVENT = 'lifeos-data-reload';

export const STORAGE_KEYS = {
  SETTINGS: 'lifeos_settings_v1',
  HABITS: 'lifeos_habits_v2',
  HABIT_CATEGORIES: 'lifeos_habit_categories_v1',
  TASKS: 'lifeos_tasks_v2',
  TASK_SECTIONS: 'lifeos_task_sections_v1',
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
  // Fix: Added missing AUTO_SNAPSHOT key for safety backups
  AUTO_SNAPSHOT: 'lifeos_auto_snapshot_v1',
};

export const BackupService = {
  createBackupData: (habits: Habit[], tasks: Task[], settings: AppSettings, timestamp?: string): BackupData => {
    return {
      version: "2.0.0",
      appVersion: "2.0.0",
      exportDate: timestamp || new Date().toISOString(),
      habits: habits || [],
      tasks: tasks || [],
      settings: settings
    };
  },

  isDataEmpty: (data: BackupData): boolean => {
    if (!data) return true;
    const hasHabits = data.habits && data.habits.length > 0;
    const hasTasks = data.tasks && data.tasks.length > 0;
    const hasJournal = (data as any).journal && (data as any).journal.length > 0;
    const hasFinance = (data as any).finance?.transactions && (data as any).finance.transactions.length > 0;
    return !hasHabits && !hasTasks && !hasJournal && !hasFinance;
  },

  // Fix: Implemented downloadBackup for manual exports
  downloadBackup: (data: BackupData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Fix: Implemented readBackupFile for manual restores
  readBackupFile: (file: File): Promise<BackupData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  },

  // Fix: Implemented saveAutoSnapshot for safety backups
  saveAutoSnapshot: async (data: BackupData) => {
    await storage.save(STORAGE_KEYS.AUTO_SNAPSHOT, data);
  },

  performReplace: async (data: BackupData) => {
    if (!data || !data.settings) return false;

    console.log("LifeOS Backup: Performing atomic replace of local storage...");
    const ops = [
      storage.save(STORAGE_KEYS.SETTINGS, data.settings),
      storage.save(STORAGE_KEYS.HABITS, data.habits || []),
      storage.save(STORAGE_KEYS.TASKS, data.tasks || []),
      storage.save(STORAGE_KEYS.HABIT_CATEGORIES, (data as any).habitCategories || []),
      storage.save(STORAGE_KEYS.TASK_SECTIONS, (data as any).taskSections || []),
      storage.save(STORAGE_KEYS.GOALS, (data as any).goals || []),
      storage.save(STORAGE_KEYS.JOURNAL, (data as any).journal || []),
      storage.save(STORAGE_KEYS.VISION_BOARD, (data as any).visionBoard || []),
      storage.save(STORAGE_KEYS.REPORTS, (data as any).reports || []),
      storage.save(STORAGE_KEYS.TIME_BLOCKS, (data as any).timeBlocks || []),
      storage.save(STORAGE_KEYS.CUSTOM_THEMES, (data as any).customThemes || [])
    ];

    if (data.finance) {
      ops.push(storage.save(STORAGE_KEYS.FINANCE_ACCOUNTS, data.finance.accounts || []));
      ops.push(storage.save(STORAGE_KEYS.FINANCE_TXS, data.finance.transactions || []));
      ops.push(storage.save(STORAGE_KEYS.FINANCE_BUDGETS, data.finance.budgets || []));
      ops.push(storage.save(STORAGE_KEYS.FINANCE_GOALS, data.finance.savingsGoals || []));
      ops.push(storage.save(STORAGE_KEYS.FINANCE_CURRENCY, data.finance.currency || 'USD'));
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

    // Digital Wellness
    if ((data as any).wellnessApps) ops.push(storage.save(STORAGE_KEYS.WELLNESS_APPS, (data as any).wellnessApps));
    if ((data as any).wellnessSettings) ops.push(storage.save(STORAGE_KEYS.WELLNESS_SETTINGS, (data as any).wellnessSettings));
    if ((data as any).wellnessStats) ops.push(storage.save(STORAGE_KEYS.WELLNESS_STATS, (data as any).wellnessStats));

    await Promise.all(ops);
    window.dispatchEvent(new CustomEvent(SYNC_RELOAD_EVENT));
    return true;
  }
};
