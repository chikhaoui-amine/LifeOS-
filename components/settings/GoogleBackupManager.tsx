import React, { useState, useMemo } from 'react';
import { Cloud, LogOut, Check, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Smartphone, ExternalLink, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useSync } from '../../context/SyncContext';
import { FirebaseService } from '../../services/FirebaseService';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../utils/storage';
import { FirebaseConfigModal } from './FirebaseConfigModal';

export const GoogleBackupManager: React.FC = () => {
  const { settings } = useSettings();
  const { isSyncing, lastSyncedAt, user, syncNow } = useSync();
  const { showToast } = useToast();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<{code: string, message: string} | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await FirebaseService.signIn();
      showToast('Authenticating...', 'info');
    } catch (e: any) {
      console.error("Firebase Auth Error:", e);
      if (e.code === 'auth/popup-closed-by-user') {
        showToast('Sign in cancelled', 'info');
      } else if (e.code === 'auth/unauthorized-domain') {
        setAuthError({
          code: e.code,
          message: `This domain (${window.location.hostname}) is not whitelisted by the current Firebase project. To fix this, add it to 'Authorized Domains' in Firebase Auth.`
        });
        showToast('Domain Not Authorized', 'error');
      } else {
        setAuthError({ code: e.code || 'unknown', message: e.message || 'An unexpected error occurred during sign-in.' });
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
        <div className="bg-surface rounded-[2rem] p-5 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
           
           <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
              <div className="bg-foreground/5 p-3 sm:p-4 rounded-2xl border border-[var(--color-border)] shadow-inner relative">
                 <Cloud className="text-primary drop-shadow-md w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                 <div className="absolute -top-1 -right-1">
                    <Sparkles size={14} className="text-primary animate-bounce" />
                 </div>
              </div>
              
              <div className="flex-1 text-center space-y-1 sm:space-y-2">
                 <h3 className="text-lg sm:text-xl font-black tracking-tighter text-foreground uppercase">Sync Your LifeOS</h3>
                 <p className="text-muted font-medium leading-relaxed max-w-md text-[10px] sm:text-xs px-4">
                    Connect your Google Account to enable real-time cloud synchronization and multi-device access.
                 </p>
                 <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <ShieldCheck size={12} className="text-emerald-500" /> Secure
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted bg-foreground/5 px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                       <Smartphone size={12} className="text-blue-500" /> Auto-Sync
                    </div>
                 </div>
              </div>

              <div className="w-full max-w-sm px-2 pt-1 flex flex-col gap-3">
                 <button 
                   onClick={handleConnect}
                   disabled={isLoading}
                   className="w-full py-3 sm:py-4 bg-primary hover:bg-primary-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all active:scale-[0.97] hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />
                    
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <div className="bg-white p-1 rounded-lg shadow-sm">
                        <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" alt="G" />
                      </div>
                    )}
                    <span className="relative z-10 drop-shadow-sm">Connect with Google</span>
                 </button>
              </div>
           </div>
           
           {authError && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row gap-3 animate-in slide-in-from-top-2">
                 <div className="shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center text-red-600">
                    <AlertTriangle size={20} />
                 </div>
                 <div className="space-y-3 flex-1">
                    <div>
                       <h4 className="font-black text-red-900 dark:text-red-100 text-[10px] uppercase tracking-widest mb-0.5">Authorization Error</h4>
                       <p className="text-[10px] font-bold text-red-800/70 dark:text-red-200/60 leading-relaxed">
                          {authError.message}
                       </p>
                    </div>
                    {authError.code === 'auth/unauthorized-domain' && (
                       <div className="flex flex-wrap gap-3">
                          <a 
                            href="https://console.firebase.google.com/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-50 shadow-sm transition-all"
                          >
                             Open Firebase Console <ExternalLink size={10} />
                          </a>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      ) : (
        <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl hover:shadow-black/5">
           <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-4 sm:gap-5">
                 <div className="relative group">
                    <div className="w-12 h-12 sm:w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden border-2 border-white dark:border-gray-800 transform group-hover:rotate-3 transition-transform">
                       {user.photoURL ? (
                           <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white dark:border-gray-900 shadow-lg">
                       <Check size={10} strokeWidth={4} />
                    </div>
                 </div>
                 
                 <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black text-foreground truncate tracking-tighter uppercase">{user.displayName || 'LifeOS Explorer'}</h3>
                    <p className="text-[10px] sm:text-sm font-bold text-muted truncate opacity-80">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]">
                          <Cloud size={10} className="animate-pulse" /> Cloud Active
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-5 sm:p-7 md:w-72 flex flex-col justify-center space-y-4">
              <div className="space-y-1.5">
                 <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-[0.3em]">
                    <span>Status</span>
                    <span className={isSyncing ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}>{isSyncing ? 'Syncing...' : 'Encrypted'}</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    {isSyncing ? (
                       <div className="h-full bg-blue-500 animate-pulse w-full" />
                    ) : (
                       <div className="h-full bg-emerald-500 w-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    )}
                 </div>
                 <p className="text-[8px] text-right text-muted font-bold uppercase tracking-widest pt-0.5">
                    {lastSyncedAt ? `Last: ${lastSyncedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Standing by'}
                 </p>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={syncNow}
                   disabled={isSyncing}
                   className="flex-1 py-2.5 bg-primary text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 hover:bg-primary-600"
                 >
                    <RefreshCw size={12} strokeWidth={3} className={isSyncing ? "animate-spin" : ""} /> Sync
                 </button>
                 <button 
                   onClick={handleDisconnect}
                   className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-95 border border-red-100 dark:border-red-900/30 shadow-sm"
                   title="Disconnect Account"
                 >
                    <LogOut size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {showConfigModal && (
         <FirebaseConfigModal onClose={() => setShowConfigModal(false)} />
      )}
    </div>
  );
};