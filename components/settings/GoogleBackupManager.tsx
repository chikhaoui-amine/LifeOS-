import React, { useState, useMemo } from 'react';
import { Cloud, LogOut, Check, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Smartphone, ExternalLink } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useSync } from '../../context/SyncContext';
import { FirebaseService } from '../../services/FirebaseService';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../utils/storage';

export const GoogleBackupManager: React.FC = () => {
  const { settings } = useSettings();
  const { isSyncing, lastSyncedAt, user, syncNow } = useSync();
  const { showToast } = useToast();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<{code: string, message: string} | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await FirebaseService.signIn();
      // Success is handled by the subscriber in SyncContext
      showToast('Authenticating...', 'info');
    } catch (e: any) {
      console.error("Firebase Auth Error:", e);
      if (e.code === 'auth/popup-closed-by-user') {
        showToast('Sign in cancelled', 'info');
      } else if (e.code === 'auth/unauthorized-domain') {
        setAuthError({
          code: e.code,
          message: `Domain "${window.location.hostname}" is not authorized. You must add this URL to "Authorized Domains" in your Firebase Auth settings.`
        });
        showToast('Domain Not Authorized', 'error');
      } else {
        setAuthError({ code: e.code || 'unknown', message: e.message || 'An unexpected error occurred.' });
        showToast(`Sign in failed`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Disconnecting will RESET all local data to defaults for privacy. Are you sure?")) {
      try {
        await FirebaseService.signOut();
        await storage.clearAll();
        showToast('Signed out successfully', 'info');
        window.location.reload();
      } catch (e) {
        showToast('Error during sign out', 'error');
      }
    }
  };

  return (
    <div className="space-y-4">
      {!user ? (
        <div className="bg-surface rounded-[2rem] p-5 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-8">
              <div className="bg-foreground/5 p-4 sm:p-6 rounded-3xl border border-[var(--color-border)] shadow-inner">
                 <Cloud className="text-primary drop-shadow-md w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-1 sm:space-y-2">
                 <h3 className="text-lg sm:text-2xl font-black tracking-tight text-foreground">Sync Your LifeOS</h3>
                 <p className="text-muted font-medium leading-relaxed max-w-lg text-xs sm:text-sm">
                    Connect your Google Account to enable real-time cloud synchronization and multi-device access.
                 </p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <ShieldCheck size={12} className="text-emerald-500" /> Secure Encryption
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <Smartphone size={12} className="text-blue-500" /> Auto-Sync
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto min-w-[180px]">
                 <button 
                   onClick={handleConnect}
                   disabled={isLoading}
                   className="w-full py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                 >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 invert" alt="G" />}
                    Connect with Google
                 </button>
              </div>
           </div>
           
           {authError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 flex gap-3 animate-in slide-in-from-top-2">
                 <AlertTriangle className="text-red-500 shrink-0" size={20} />
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-red-800 dark:text-red-200 leading-relaxed">
                       {authError.message}
                    </p>
                    {authError.code === 'auth/unauthorized-domain' && (
                       <a 
                         href="https://console.firebase.google.com/" 
                         target="_blank" 
                         rel="noreferrer"
                         className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline"
                       >
                          Open Firebase Console <ExternalLink size={12} />
                       </a>
                    )}
                 </div>
              </div>
           )}
        </div>
      ) : (
        <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row">
           <div className="p-5 sm:p-8 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-4 sm:gap-5">
                 <div className="relative">
                    <div className="w-12 h-12 sm:w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden border-2 border-white dark:border-gray-800">
                       {user.photoURL ? (
                           <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-lg border-2 border-white dark:border-gray-900">
                       <Check size={10} strokeWidth={4} />
                    </div>
                 </div>
                 
                 <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-foreground truncate">{user.displayName || 'LifeOS Explorer'}</h3>
                    <p className="text-[10px] sm:text-sm font-medium text-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                          <Cloud size={10} /> Cloud Sync Active
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-5 sm:p-8 md:w-72 flex flex-col justify-center space-y-3 sm:space-y-4">
              <div className="space-y-1">
                 <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                    <span>Sync Status</span>
                    <span className={isSyncing ? 'text-blue-500' : 'text-green-500'}>{isSyncing ? 'Syncing...' : 'Encrypted'}</span>
                 </div>
                 <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    {isSyncing ? (
                       <div className="h-full bg-blue-500 animate-pulse w-full" />
                    ) : (
                       <div className="h-full bg-green-500 w-full" />
                    )}
                 </div>
                 <p className="text-[9px] text-right text-muted font-medium pt-0.5">
                    {lastSyncedAt ? `Last Sync: ${lastSyncedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Standing by'}
                 </p>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={syncNow}
                   disabled={isSyncing}
                   className="flex-1 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                 >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> Sync Now
                 </button>
                 <button 
                   onClick={handleDisconnect}
                   className="px-3 py-2.5 sm:py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                   title="Disconnect Account"
                 >
                    <LogOut size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};