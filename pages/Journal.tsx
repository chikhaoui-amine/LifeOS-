
import React, { useState, useMemo, useEffect } from 'react';
// Added BookOpen to imports to fix the "Cannot find name 'BookOpen'" error
import { Plus, Search, List, LayoutGrid, Calendar, Sparkles, TrendingUp, X, BookOpen } from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { JournalEntryCard } from '../components/journal/JournalEntryCard';
import { JournalForm } from '../components/journal/JournalForm';
import { JournalStats } from '../components/journal/JournalStats';
import { PinModal } from '../components/journal/PinModal';
import { JournalCalendar } from '../components/journal/JournalCalendar';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { JournalEntry, LanguageCode } from '../types';
import { useToast } from '../context/ToastContext';

const Journal: React.FC = () => {
  const { entries, loading, addEntry, updateEntry, deleteEntry, toggleFavorite } = useJournal();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [viewMode, setViewMode] = useState<'timeline' | 'stats' | 'calendar'>('timeline');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinModalState, setPinModalState] = useState<{ isOpen: boolean; entry: JournalEntry | null }>({ isOpen: false, entry: null });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
       const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             e.plainText.toLowerCase().includes(searchQuery.toLowerCase());
       return matchesSearch;
    }).sort((a: JournalEntry, b: JournalEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery]);

  const handleSave = async (data: any) => {
    if (selectedEntry) {
       await updateEntry(selectedEntry.id, data);
       setSelectedEntry(null);
    } else {
       await addEntry(data);
    }
    setIsFormOpen(false);
  };

  const handleEntryClick = (entry: JournalEntry) => {
    if (entry.securityPin) setPinModalState({ isOpen: true, entry });
    else openEditor(entry);
  };

  const openEditor = (entry: JournalEntry) => {
     setSelectedEntry(entry);
     setIsFormOpen(true);
  };

  const handlePinVerify = (pin: string) => {
     if (pinModalState.entry && pin === pinModalState.entry.securityPin) {
        setPinModalState({ isOpen: false, entry: null });
        openEditor(pinModalState.entry);
     } else {
        showToast("Incorrect PIN", "error");
     }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <header className="relative p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] bg-primary-600 text-white overflow-hidden shadow-2xl shadow-primary-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
               <Sparkles size={12} className="animate-pulse" /> Sanctuary
            </div>
            <h1 className="text-4xl sm:text-7xl font-black font-serif tracking-tighter leading-none">{isMobile ? 'Journal' : t.journal.title}</h1>
            <p className="text-white/80 max-w-md text-sm sm:text-xl font-serif italic leading-relaxed">{t.journal.subtitle}</p>
          </div>

          <button 
            onClick={() => { setSelectedEntry(null); setIsFormOpen(true); }}
            className="shrink-0 bg-white hover:bg-gray-50 text-primary-600 px-6 py-4 sm:px-10 rounded-2xl sm:rounded-[2rem] flex items-center justify-center gap-3 font-black text-xs sm:text-base shadow-xl active:scale-95 transition-all"
          >
            <Plus size={20} sm-size={24} strokeWidth={4} />
            <span className="uppercase tracking-widest">{t.journal.newEntry}</span>
          </button>
        </div>
      </header>

      {/* Nav & Search */}
      <div className="sticky top-2 z-20 space-y-2">
         <div className="bg-[#0f172a] p-1.5 rounded-2xl sm:rounded-[1.5rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-2 border border-white/5">
            <div className="flex items-center p-1 overflow-x-auto no-scrollbar gap-1">
               {[
                 { id: 'timeline', icon: List, label: t.journal.timeline },
                 { id: 'calendar', icon: Calendar, label: t.journal.calendar },
                 { id: 'stats', icon: LayoutGrid, label: t.journal.insights }
               ].map(m => (
                 <button 
                    key={m.id}
                    onClick={() => setViewMode(m.id as any)} 
                    className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === m.id ? 'bg-[#1e293b] text-primary-500 shadow-md ring-1 ring-white/5' : 'text-slate-400 hover:text-white'}`}
                 >
                    <m.icon size={16} strokeWidth={3} /> {m.label}
                 </button>
               ))}
            </div>

            {viewMode === 'timeline' && (
               <div className="relative flex-1 md:max-w-xs group px-2 pb-2 md:pb-0">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={14} strokeWidth={3} />
                  <input 
                    type="text" 
                    placeholder={t.journal.search} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e293b] border-none outline-none text-xs font-bold text-white placeholder:text-slate-600"
                  />
               </div>
            )}
         </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? <LoadingSkeleton count={3} /> : (
          viewMode === 'timeline' ? (
             filteredEntries.length === 0 ? <EmptyState icon={BookOpen} title={t.journal.empty} description={searchQuery ? "No matches." : t.journal.emptyDesc} /> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {filteredEntries.map(entry => <JournalEntryCard key={entry.id} entry={entry} onClick={() => handleEntryClick(entry)} onFavorite={() => toggleFavorite(entry.id)} />)}
             </div>
          ) : viewMode === 'calendar' ? <JournalCalendar entries={entries} onDateSelect={() => {}} onEntryClick={handleEntryClick} /> : <JournalStats />
        )}
      </div>

      {isFormOpen && <JournalForm initialData={selectedEntry || {}} onSave={handleSave} onClose={() => { setIsFormOpen(false); setSelectedEntry(null); }} onDelete={deleteEntry} />}
      <PinModal isOpen={pinModalState.isOpen} onClose={() => setPinModalState({ isOpen: false, entry: null })} onVerify={handlePinVerify} />
    </div>
  );
};

export default Journal;
