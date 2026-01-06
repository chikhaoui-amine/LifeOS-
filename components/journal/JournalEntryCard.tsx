
import React from 'react';
import { Heart, Lock, Clock, Bookmark, ChevronRight, Camera } from 'lucide-react';
import { JournalEntry } from '../../types';

/**
 * Fix: Added missing interface for JournalEntryCard props.
 */
interface JournalEntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onFavorite: () => void;
}

// Updated MOOD_MAP to match the simplified yellow face set
const MOOD_MAP: Record<string, { icon: string, color: string, bg: string, shadow: string }> = {
  happy: { icon: '🙂', color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/10' },
  excited: { icon: '🤩', color: 'text-yellow-500', bg: 'bg-yellow-500', shadow: 'shadow-yellow-500/10' },
  grateful: { icon: '😇', color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/10' },
  calm: { icon: '😌', color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/10' },
  neutral: { icon: '😐', color: 'text-slate-400', bg: 'bg-slate-400', shadow: 'shadow-slate-500/10' },
  tired: { icon: '🥱', color: 'text-indigo-400', bg: 'bg-indigo-400', shadow: 'shadow-indigo-400/10' },
  sad: { icon: '😔', color: 'text-indigo-700', bg: 'bg-indigo-700', shadow: 'shadow-indigo-800/10' },
  anxious: { icon: '😟', color: 'text-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/10' },
  angry: { icon: '😠', color: 'text-red-600', bg: 'bg-red-600', shadow: 'shadow-red-500/10' }
};

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onClick, onFavorite }) => {
  const date = new Date(entry.date);
  const isLocked = !!entry.securityPin;
  const mood = MOOD_MAP[entry.mood] || MOOD_MAP.neutral;
  const hasImage = entry.images && entry.images.length > 0;
  
  const readTime = Math.max(1, Math.ceil(entry.plainText.split(' ').length / 200));

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col bg-surface rounded-[2.5rem] border border-[var(--color-border)] shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden ${mood.shadow}`}
    >
      <div className={`h-1.5 w-full ${mood.bg} opacity-30 group-hover:opacity-70 transition-opacity duration-700`} />

      {hasImage && !isLocked && (
         <div className="h-48 w-full overflow-hidden relative">
            <img src={entry.images![0]} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-transparent to-transparent opacity-60" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white shadow-lg border border-white/20">
               <Camera size={14} strokeWidth={3} />
            </div>
         </div>
      )}

      <div className={`p-8 flex flex-col flex-1 ${isLocked ? 'blur-[4px] opacity-60 select-none' : ''}`}>
        
        <div className="flex justify-between items-center mb-6">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">
                 {date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xl font-black text-foreground tracking-tight">
                 {date.getDate()} {date.toLocaleDateString(undefined, { weekday: 'long' })}
              </span>
           </div>
           <div className="flex items-center gap-1.5 text-[9px] font-black text-muted uppercase tracking-widest bg-gray-50/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl">
              <Clock size={12} strokeWidth={3} /> {readTime} MIN
           </div>
        </div>

        <div className="flex-1 space-y-5">
           <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${mood.bg} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500 select-none`}>
                 {mood.icon}
              </div>
              <h3 className="font-serif font-black text-foreground text-2xl line-clamp-1 leading-none flex-1 tracking-tight">
                 {isLocked ? "Private Entry" : (entry.title || "No Title")}
              </h3>
           </div>

           <p className="text-muted text-lg leading-relaxed line-clamp-2 font-serif italic tracking-tight">
              {isLocked ? "Encrypted and protected by your secure PIN." : (entry.plainText || "Start your reflection...")}
           </p>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
           <div className="flex gap-2 overflow-hidden">
              {entry.tags.length > 0 ? entry.tags.slice(0, 2).map(tag => (
                 <span key={tag} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-muted text-[9px] font-black uppercase tracking-widest rounded-lg border border-[var(--color-border)]">
                    #{tag}
                 </span>
              )) : (
                 <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <Bookmark size={12} /> UNTAGGED
                 </span>
              )}
           </div>

           <div className="flex items-center gap-2">
              {entry.isFavorite && (
                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-full text-rose-500 shadow-sm">
                   <Heart size={14} fill="currentColor" />
                </div>
              )}
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400 group-hover:text-primary-600 transition-all">
                 <ChevronRight size={18} strokeWidth={3} />
              </div>
           </div>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[4px] transition-all">
           <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 border border-[var(--color-border)] group-hover:scale-110 transition-transform">
              <Lock size={28} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mt-6">Secure Vault</span>
        </div>
      )}

      {!isLocked && (
        <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-900 overflow-hidden shrink-0">
           <div 
             className="h-full bg-primary-500 transition-all duration-1000 ease-out" 
             style={{ width: `${entry.energyLevel * 10}%`, opacity: 0.6 }}
           />
        </div>
      )}
    </div>
  );
};
