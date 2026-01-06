
import React, { useState, useMemo, useRef } from 'react';
import { 
  Bell, Trash2, Plus, Download, Upload, Palette, Check, 
  ChevronDown, ChevronUp, Globe, Cloud, Calendar, Moon, 
  Shield, Cpu, Sparkles, Sun, Edit2, Zap, AlertTriangle, Loader2, WifiOff, Terminal, Eye, EyeOff, LayoutGrid, X, Settings as SettingsIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { SettingSection } from '../components/settings/SettingSection';
import { SettingItem } from '../components/settings/SettingItem';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ThemePreview } from '../components/ThemePreview';
import { GoogleBackupManager } from '../components/settings/GoogleBackupManager';
import { PREBUILT_THEMES } from '../utils/themeLibrary';
import { BackupService } from '../services/BackupService';
import { storage } from '../utils/storage';
import { LanguageCode } from '../types';
import { getTranslation } from '../utils/translations';

// Modules (Contexts for backup)
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { useJournal } from '../context/JournalContext';
import { useGoals } from '../context/GoalContext';
import { useFinance } from '../context/FinanceContext';
import { useMeals } from '../context/MealContext';
import { useSleep } from '../context/SleepContext';
import { useTimeBlocks } from '../context/TimeBlockContext';
import { useIslamic } from '../context/IslamicContext';
import { useVisionBoard } from '../context/VisionBoardContext';
import { useReports } from '../context/ReportContext';

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Violet', value: '#8b5cf6' },
];

const LANGUAGE_OPTIONS: { label: string; value: LanguageCode }[] = [
  { label: 'English (US)', value: 'en' },
  { label: 'العربية (Arabic)', value: 'ar' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Français (French)', value: 'fr' },
];

const TOGGLEABLE_MODULES = [
  { id: 'vision', label: 'Vision Board', icon: Sparkles },
  { id: 'habits', label: 'Habits', icon: Check },
  { id: 'tasks', label: 'Tasks', icon: LayoutGrid },
  { id: 'goals', label: 'Goals', icon: Zap },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'meals', label: 'Meal Planner', icon: Sun },
  { id: 'sleep', label: 'Sleep Tracker', icon: Moon },
  { id: 'journal', label: 'Journal', icon: Edit2 },
  { id: 'finance', label: 'Finance', icon: Loader2 }, // Using generic icon
  { id: 'deen', label: 'Islamic Features', icon: Moon },
  { id: 'statistics', label: 'Statistics', icon: SettingsIcon },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { currentTheme, savedThemes, applyTheme, updateThemePrimaryColor, deleteCustomTheme } = useTheme();
  
  // Data Contexts for Manual Export
  const { habits, categories: habitCategories } = useHabits();
  const { tasks } = useTasks();
  const { entries: journal } = useJournal();
  const { goals } = useGoals();
  const { accounts, transactions, budgets, savingsGoals, currency } = useFinance();
  const { recipes, foods, mealPlans, shoppingList } = useMeals();
  const { logs: sleepLogs, settings: sleepSettings } = useSleep();
  const { timeBlocks } = useTimeBlocks();
  const { prayers, quran, adhkar, settings: islamicSettings } = useIslamic();
  const { items: visionBoard } = useVisionBoard();
  const { reports } = useReports();
  
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [showThemes, setShowThemes] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allThemes = [...PREBUILT_THEMES, ...savedThemes];

  const handleBackupData = () => {
     const data = BackupService.createBackupData(habits, tasks, settings);
     // Attach comprehensive module data
     Object.assign(data, {
        habitCategories, journal, goals, visionBoard, reports,
        finance: { accounts, transactions, budgets, savingsGoals, currency },
        meals: { recipes, foods, mealPlans, shoppingList },
        sleepLogs, sleepSettings, timeBlocks,
        prayers, quran, adhkar, islamicSettings,
        customThemes: savedThemes
     });

     BackupService.downloadBackup(data);
     showToast('Master backup file generated', 'success');
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await BackupService.readBackupFile(file);
      setModalConfig({
        isOpen: true,
        title: 'Restore Master Backup',
        message: 'This will overwrite ALL data (Vision, Finance, Habits, Tasks, etc.). The app will reload. Proceed?',
        type: 'danger',
        confirmText: 'Restore & Reload',
        onConfirm: async () => {
           await BackupService.performReplace(data);
           window.location.reload();
        }
      });
    } catch (err) {
      showToast('Invalid backup file format', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetApp = () => {
    setModalConfig({
        isOpen: true,
        title: t.settings.reset,
        message: 'This will delete ALL data permanently from this device. This action cannot be reversed.',
        type: 'nuclear',
        confirmText: 'Factory Reset',
        onConfirm: async () => {
            await storage.clearAll();
            window.location.reload();
        }
    });
  };

  const toggleModule = (id: string) => {
    const currentDisabled = settings.disabledModules || [];
    const isCurrentlyDisabled = currentDisabled.includes(id);
    let newDisabled;
    if (isCurrentlyDisabled) {
      newDisabled = currentDisabled.filter(m => m !== id);
    } else {
      newDisabled = [...currentDisabled, id];
    }
    
    if (id === 'deen') {
        updateSettings({ 
            disabledModules: newDisabled,
            preferences: { ...settings.preferences, enableIslamicFeatures: isCurrentlyDisabled }
        });
    } else {
        updateSettings({ disabledModules: newDisabled });
    }
  };

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      
      {/* Header - Minimalist */}
      <header className="py-6 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{t.nav.settings}</h1>
           <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
      </header>

      {/* Hero: Cloud Sync Card */}
      <section className="mb-10">
         <GoogleBackupManager />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Preferences & Customization */}
        <div className="space-y-8">
            <SettingSection title={t.settings.preferences}>
              <SettingItem 
                label={t.settings.language}
                subLabel="Primary interface language"
                icon={Globe}
                type="select"
                options={LANGUAGE_OPTIONS}
                value={settings?.preferences?.language || 'en'}
                onChange={(val) => updateSettings({ preferences: { ...settings?.preferences, language: val as LanguageCode } })}
              />
              
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm sm:text-base text-foreground">Start of Week</span>
                      <span className="text-xs text-muted mt-0.5">Weekly Reset Day</span>
                    </div>
                </div>
                <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-[var(--color-border)] self-end sm:self-center">
                    {['sunday', 'monday'].map(day => (
                      <button
                        key={day}
                        onClick={() => updateSettings({ preferences: { ...settings?.preferences, startOfWeek: day } })}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${settings?.preferences?.startOfWeek === day ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-muted hover:text-foreground'}`}
                      >
                          {day}
                      </button>
                    ))}
                </div>
              </div>

              <SettingItem 
                  label="Navigation Tabs"
                  subLabel="Toggle features on/off"
                  icon={LayoutGrid}
                  type="link"
                  onClick={() => setIsModulesModalOpen(true)}
              />

              <SettingItem 
                  label={t.settings.islamicFeatures}
                  subLabel="Prayer times, Quran & Hijri calendar"
                  icon={Moon}
                  type="toggle"
                  value={settings?.preferences?.enableIslamicFeatures}
                  onChange={(val) => {
                      toggleModule('deen'); // Re-using logic
                  }}
              />
            </SettingSection>

            {/* Notification Settings could go here */}
        </div>

        {/* RIGHT COLUMN: Appearance & Data */}
        <div className="space-y-8">
            
            {/* Visual Theme Card */}
            <div>
               <h2 className="px-1 mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</h2>
               <div className="bg-surface rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden p-6">
                  <div className="flex items-start justify-between mb-6">
                     <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{currentTheme.name}</h3>
                        <p className="text-xs text-muted">Current Theme</p>
                     </div>
                     <div className="flex gap-2">
                        {Object.values(currentTheme.colors).slice(0, 4).map((c, i) => (
                           <div key={i} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" style={{ backgroundColor: c as string }} />
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-3">Accent Color</span>
                        <div className="flex flex-wrap gap-2">
                            {ACCENT_COLORS.map(color => (
                              <button
                                key={color.value}
                                onClick={() => updateThemePrimaryColor(color.value)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm border-2 ${currentTheme.colors.primary.toLowerCase() === color.value.toLowerCase() ? 'border-foreground' : 'border-transparent'}`}
                                style={{ backgroundColor: color.value }}
                              >
                                {currentTheme.colors.primary.toLowerCase() === color.value.toLowerCase() && (
                                  <Check size={12} className="text-white drop-shadow-md" strokeWidth={4} />
                                )}
                              </button>
                            ))}
                        </div>
                     </div>

                     <button 
                       onClick={() => setShowThemes(!showThemes)}
                       className="w-full py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest text-foreground transition-colors flex items-center justify-center gap-2"
                     >
                        <Palette size={16} /> Browse Theme Library
                     </button>

                     {showThemes && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 pt-2">
                           {allThemes.map(theme => (
                              <ThemePreview 
                                key={theme.id}
                                theme={theme}
                                isActive={currentTheme.id === theme.id}
                                onClick={() => applyTheme(theme)}
                                onEdit={theme.isCustom ? () => navigate('/settings/theme-creator', { state: { theme } }) : undefined}
                                onDelete={theme.isCustom ? () => deleteCustomTheme(theme.id) : undefined}
                              />
                           ))}
                           <button onClick={() => navigate('/settings/theme-creator')} className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center justify-center gap-2 transition-all text-muted hover:text-primary-600">
                              <Plus size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Create New</span>
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <SettingSection title="Data Management">
              <SettingItem label="Export Data" subLabel="Download full JSON backup" icon={Download} onClick={handleBackupData} />
              
              <div onClick={handleRestoreClick} className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 text-foreground cursor-pointer border-b border-[var(--color-border)]">
                 <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg"><Upload size={18} /></div>
                    <div className="flex flex-col">
                       <span className="font-medium text-sm sm:text-base">Restore Backup</span>
                       <span className="text-xs text-muted mt-0.5">Import from JSON file</span>
                    </div>
                 </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

              <SettingItem label={t.settings.reset} subLabel="Erase local device data" icon={Trash2} type="danger" onClick={handleResetApp} />
            </SettingSection>
        </div>
      </div>

      {/* Modules Modal */}
      {isModulesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-surface rounded-[2.5rem] w-full max-w-md shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg"><LayoutGrid size={20} /></div>
                    <h3 className="font-bold text-lg text-foreground">Navigation Tabs</h3>
                 </div>
                 <button onClick={() => setIsModulesModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {TOGGLEABLE_MODULES.map(module => {
                   const isDisabled = settings.disabledModules?.includes(module.id);
                   const Icon = module.icon;
                   return (
                     <button key={module.id} onClick={() => toggleModule(module.id)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-transparent hover:border-[var(--color-border)]">
                        <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-xl ${isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                              <Icon size={18} />
                           </div>
                           <span className={`font-bold text-sm ${isDisabled ? 'text-muted' : 'text-foreground'}`}>{module.label}</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${!isDisabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                           <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${!isDisabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
        onConfirm={modalConfig.onConfirm} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        type={modalConfig.type} 
        confirmText={modalConfig.confirmText} 
      />
    </div>
  );
};

export default Settings;
