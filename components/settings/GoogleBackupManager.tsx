import React, { useState, useMemo } from 'react';
import { Cloud, LogOut, Check, Loader2, RefreshCw, User as UserIcon, AlertTriangle, ShieldCheck, Smartphone } from 'lucide-react';
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
  const [authError, setAuthError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await FirebaseService.signIn();
      showToast('Signed in successfully', 'success');
    } catch (e: any) {
      console.error("Firebase Auth Error:", e);
      if (e.code === 'auth/popup-closed-by-user') {
        showToast('Sign in cancelled', 'info');
      } else if (e.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setAuthError(`Domain "${domain}" is not authorized. Add it to Firebase Console.`);
        showToast('Unauthorized Domain', 'error');
      } else if (e.code === 'auth/cancelled-popup-request') {
        // Ignore
      } else {
        showToast(`Sign in failed: ${e.message}`, 'error');
        setAuthError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Disconnecting will RESET all local data to defaults. Are you sure?")) {
      await FirebaseService.signOut();
      await storage.clearAll();
      showToast('Signed out & Data Reset', 'info');
      setAuthError(null);
      window.location.reload();
    }
  };

  return (
    <>
      {!user ? (
        <div className="bg-surface rounded-[2rem] p-5 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-8">
              <div className="bg-foreground/5 p-4 sm:p-6 rounded-3xl border border-[var(--color-border)] shadow-inner">
                 <Cloud className="text-primary drop-shadow-md w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-1 sm:space-y-2">
                 <h3 className="text-lg sm:text-2xl font-black tracking-tight text-foreground">Sync Your LifeOS</h3>
                 <p className="text-muted font-medium leading-relaxed max-w-lg text-xs sm:text-sm">
                    Securely backup your habits, tasks, and journals to the cloud. Access your system from any device.
                 </p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <ShieldCheck size={12} /> Encrypted
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <Smartphone size={12} /> Sync
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto min-w-[180px]">
                 <button 
                   onClick={handleConnect}
                   disabled={isLoading}
                   className="w-full py-3 sm:py-4 bg-white text-primary-700 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-primary-50 transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                 >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" alt="G" />}
                    Connect
                 </button>
                 {authError && (
                   <div className="text-[9px] text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-900/30">
                      <AlertTriangle size={10} /> <span className="truncate">{authError}</span>
                   </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row">
           <div className="p-5 sm:p-8 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-4 sm:gap-5">
                 <div className="relative">
                    <div className="w-12 h-12 sm:w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
                       {user.photoURL ? (
                           <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           (user.displayName?.[0] || 'U').toUpperCase()
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-lg border-2 border-white dark:border-gray-900">
                       <Check size={10} strokeWidth={4} />
                    </div>
                 </div>
                 
                 <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-foreground truncate">{user.displayName || 'LifeOS User'}</h3>
                    <p className="text-[10px] sm:text-sm font-medium text-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                          <Cloud size={10} /> Cloud Active
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-5 sm:p-8 md:w-72 flex flex-col justify-center space-y-3 sm:space-y-4">
              <div className="space-y-1">
                 <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                    <span>Status</span>
                    <span className={isSyncing ? 'text-blue-500' : 'text-green-500'}>{isSyncing ? 'Syncing...' : 'Up to date'}</span>
                 </div>
                 <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    {isSyncing ? (
                       <div className="h-full bg-blue-500 animate-[shimmer_1s_infinite_linear] w-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                    ) : (
                       <div className="h-full bg-green-500 w-full" />
                    )}
                 </div>
                 <p className="text-[9px] text-right text-muted font-medium pt-0.5">
                    {lastSyncedAt ? `Last: ${lastSyncedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Ready'}
                 </p>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={syncNow}
                   disabled={isSyncing}
                   className="flex-1 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
                 >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> Sync
                 </button>
                 <button 
                   onClick={handleDisconnect}
                   className="px-3 py-2.5 sm:py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                   title="Sign Out"
                 >
                    <LogOut size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};