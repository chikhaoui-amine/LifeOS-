
import React, { useState, useMemo } from 'react';
import { Cloud, LogOut, Check, Loader2, RefreshCw, AlertTriangle, ShieldCheck, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useSync } from '../../context/SyncContext';
import { FirebaseService } from '../../services/FirebaseService';
import { getTranslation } from '../../utils/translations';
import { LanguageCode } from '../../types';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../utils/storage';

export const GoogleBackupManager: React.FC = () => {
  const { settings } = useSettings();
  const { isSyncing, lastSyncedAt, user, syncNow, syncStatus } = useSync();
  const { showToast } = useToast();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<{code: string, message: string} | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await FirebaseService.signIn();
      showToast('Cloud connection requested...', 'info');
    } catch (e: any) {
      console.error("Firebase Auth UI Error:", e);
      if (e.code === 'auth/popup-closed-by-user') {
        showToast('Sign-in cancelled', 'info');
      } else if (e.code === 'auth/unauthorized-domain') {
        setAuthError({
          code: e.code,
          message: `This domain (${window.location.hostname}) requires authorization in your Firebase project settings.`
        });
        showToast('Environment Blocked', 'error');
      } else {
        setAuthError({ code: e.code || 'unknown', message: e.message || 'Verification failed. Try again.' });
        showToast(`Cloud connection failed`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Safe Disconnect: Your local data will be reset to defaults to protect your privacy on this device. Cloud data remains safe. Continue?")) {
      try {
        setIsLoading(true);
        // Attempt one final sync before wiping
        showToast('Performing final cloud mirror...', 'info');
        await syncNow().catch(e => console.warn("Final sync failed, proceeding to disconnect", e));
        
        await FirebaseService.signOut();
        await storage.clearAll();
        // Clear sync marker
        localStorage.removeItem('lifeos_last_cloud_sync_ts');
        
        showToast('Account Disconnected', 'info');
        window.location.reload();
      } catch (e) {
        showToast('Error during logout', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const statusLabel = useMemo(() => {
    if (isSyncing) return 'Mirroring...';
    if (syncStatus === 'connecting') return 'Connecting...';
    if (syncStatus === 'handshake') return 'Restoring...';
    if (syncStatus === 'error') return 'Sync Error';
    return 'Stable';
  }, [isSyncing, syncStatus]);

  return (
    <div className="space-y-4">
      {!user ? (
        <div className="bg-surface rounded-[2rem] p-6 sm:p-10 border border-[var(--color-border)] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
           
           <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
              <div className="bg-foreground/5 p-4 sm:p-5 rounded-3xl border border-[var(--color-border)] shadow-inner relative">
                 <Cloud className="text-primary drop-shadow-md w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
                 <div className="absolute -top-1 -right-1">
                    <Sparkles size={16} className="text-primary animate-bounce" />
                 </div>
              </div>
              
              <div className="flex-1 text-center space-y-2 sm:space-y-3">
                 <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground uppercase">Universal Continuity</h3>
                 <p className="text-muted font-medium leading-relaxed max-w-md text-xs sm:text-sm px-6">
                    Encrypt your LifeOS architecture and mirror it across all your devices in real-time.
                 </p>
                 <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted bg-foreground/5 px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                       <ShieldCheck size={14} className="text-emerald-500" /> AES-256
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted bg-foreground/5 px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                       <Smartphone size={14} className="text-blue-500" /> Live Mirror
                    </div>
                 </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-3">
                 <button 
                   onClick={handleConnect}
                   disabled={isLoading}
                   className="w-full py-4 sm:py-5 bg-primary hover:bg-primary-600 text-white rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 transition-all active:scale-[0.96] hover:scale-[1.01] disabled:opacity-70 flex items-center justify-center gap-4 group/btn"
                 >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <div className="bg-white p-1 rounded-lg shadow-sm">
                        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                      </div>
                    )}
                    <span className="relative z-10">Authorize Cloud Sync</span>
                 </button>
              </div>
           </div>
           
           {authError && (
              <div className="mt-8 p-5 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row gap-4 animate-in slide-in-from-top-4">
                 <div className="shrink-0 w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center text-rose-600">
                    <AlertTriangle size={24} />
                 </div>
                 <div className="space-y-3 flex-1">
                    <div>
                       <h4 className="font-black text-rose-900 dark:text-rose-100 text-xs uppercase tracking-widest mb-1">Authorization Restriction</h4>
                       <p className="text-xs font-bold text-rose-800/70 dark:text-rose-200/60 leading-relaxed">
                          {authError.message}
                       </p>
                    </div>
                    {authError.code === 'auth/unauthorized-domain' && (
                       <a 
                         href="https://console.firebase.google.com/" 
                         target="_blank" 
                         rel="noreferrer"
                         className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 hover:shadow-md transition-all"
                       >
                          Firebase Configuration Console <ExternalLink size={12} />
                       </a>
                    )}
                 </div>
              </div>
           )}
        </div>
      ) : (
        <div className="bg-surface rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-2xl hover:shadow-black/5">
           <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--color-border)] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-5 sm:gap-6">
                 <div className="relative group">
                    <div className="w-14 h-14 sm:w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black overflow-hidden border-4 border-white dark:border-gray-800 transform group-hover:scale-105 transition-transform">
                       {user.photoURL ? (
                           <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-gray-900 shadow-xl">
                       <Check size={12} strokeWidth={4} />
                    </div>
                 </div>
                 
                 <div className="min-w-0">
                    <h3 className="text-lg sm:text-2xl font-black text-foreground truncate tracking-tighter uppercase leading-none mb-1">{user.displayName || 'Architect'}</h3>
                    <p className="text-xs sm:text-base font-bold text-muted truncate opacity-70 mb-2">{user.email}</p>
                    <div className="flex items-center gap-2">
                       <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Cloud Channel Active
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 sm:p-8 md:w-80 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black text-muted uppercase tracking-[0.4em]">
                    <span>Telemetry</span>
                    <span className={(isSyncing || syncStatus === 'handshake' || syncStatus === 'connecting') ? 'text-blue-500 animate-pulse' : syncStatus === 'error' ? 'text-rose-500' : 'text-emerald-500'}>{statusLabel}</span>
                 </div>
                 <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner p-0.5">
                    {(isSyncing || syncStatus === 'handshake' || syncStatus === 'connecting') ? (
                       <div className="h-full bg-blue-500 animate-pulse rounded-full w-full" />
                    ) : syncStatus === 'error' ? (
                       <div className="h-full bg-rose-500 w-full rounded-full" />
                    ) : (
                       <div className="h-full bg-emerald-500 w-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                    )}
                 </div>
                 <p className="text-[10px] text-right text-muted font-bold uppercase tracking-widest pt-1">
                    {lastSyncedAt ? `Last Sync: ${lastSyncedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Initial Session'}
                 </p>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={syncNow}
                   disabled={isSyncing || syncStatus !== 'stable'}
                   className="flex-[2] py-3.5 bg-primary text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary-500/20 transition-all active:scale-[0.94] disabled:opacity-50 hover:bg-primary-600"
                 >
                    <RefreshCw size={14} strokeWidth={3} className={isSyncing ? "animate-spin" : ""} /> Force Update
                 </button>
                 <button 
                   onClick={handleDisconnect}
                   disabled={isLoading}
                   className="flex-1 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-[0.94] border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-center"
                   title="Disconnect Logic"
                 >
                    <LogOut size={20} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
