
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, ChevronRight, X, Sparkles, 
  Zap, Compass, Trash2, Loader2, BarChart3, Moon, DollarSign, Brain, Info,
  Check, ArrowUpRight, ArrowDownRight, Minus, Briefcase, TrendingUp
} from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { LifeOSReport, ReportPeriod, LanguageCode } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { getTranslation } from '../utils/translations';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

const Reports: React.FC = () => {
  const { reports, loading, generateReport, deleteReport, isGenerating, generationStep } = useReports();
  const { getFormattedCurrency } = useFinance();
  const { settings } = useSettings();
  const { showToast } = useToast();
  
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [activeTab, setActiveTab] = useState<ReportPeriod>('daily');
  const [selectedReport, setSelectedReport] = useState<LifeOSReport | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const displayedReports = useMemo(() => {
    return reports.filter(r => r.period === activeTab);
  }, [reports, activeTab]);

  const handleGenerateNow = async () => {
    const report = await generateReport(activeTab);
    if (report) {
      showToast("Intelligence update successful", "success");
    } else {
      showToast("Generation failed. Check AI API status.", "error");
    }
  };

  const handleRequestDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    const idToDelete = confirmDeleteId;
    
    // Optimistically close modal if we're deleting the active report
    if (selectedReport?.id === idToDelete) {
      setSelectedReport(null);
    }
    setConfirmDeleteId(null);

    try {
      await deleteReport(idToDelete);
      showToast("Report purged", "info");
    } catch (err) {
      showToast("Failed to delete report", "error");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getTrendIcon = (val: number) => {
     if (val > 0) return <ArrowUpRight size={12} className="text-emerald-500" />;
     if (val < 0) return <ArrowDownRight size={12} className="text-rose-500" />;
     return <Minus size={12} className="text-gray-400" />;
  };

  if (loading) return <div className="p-8"><LoadingSkeleton count={3} type="card" /></div>;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-32 relative">
      
      {/* Neural Generation Overlay */}
      {isGenerating && (
         <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
               <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
               <div className="absolute inset-3 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.5)]">
                  <Brain size={28} className="animate-pulse" />
               </div>
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-[0.2em] mb-2">Neural Processing</h2>
            <p className="text-primary-300 font-bold text-[9px] uppercase tracking-widest bg-primary-950/50 px-5 py-1.5 rounded-full border border-primary-800">
               {generationStep}
            </p>
         </div>
      )}

      {/* Hero Header */}
      <div className="bg-primary-600 rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-4 sm:p-10 shadow-xl shadow-primary-900/20 relative overflow-hidden text-white group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div>
               <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-full text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-3 backdrop-blur-sm border border-white/10">
                  <Sparkles size={10} /> Strategic Intelligence
               </div>
               <h1 className="text-xl sm:text-4xl font-black text-white tracking-tighter leading-none mb-1">Command Center</h1>
               <p className="text-white/70 text-[10px] sm:text-base max-w-lg font-medium">
                  Cross-module performance auditing powered by Gemini Vision.
               </p>
            </div>

            <button 
              onClick={handleGenerateNow} 
              disabled={isGenerating} 
              className="bg-white hover:bg-gray-50 text-primary-600 px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
               <Zap size={14} fill="currentColor" />
               Analyze {activeTab}
            </button>
         </div>
      </div>

      {/* Enhanced Navigation Toggle */}
      <div className="flex justify-center sm:justify-start">
        <div className="flex p-1.5 bg-gray-200/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 relative">
           {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 z-10
                  ${activeTab === tab 
                    ? 'text-white shadow-lg shadow-primary-500/20 bg-primary-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}
                `}
              >
                 {tab}
              </button>
           ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
         {displayedReports.map(report => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="group bg-surface rounded-[1.25rem] sm:rounded-[2rem] border border-[var(--color-border)] p-3 sm:p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between aspect-square relative"
            >
               <div className="space-y-1.5 sm:space-y-4">
                  <div className="flex justify-between items-start">
                     <span className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                        {(report.dateRange || "").split(' ')[0]}
                     </span>
                     <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/20 px-1 py-0.5 rounded text-emerald-600 font-black text-[7px] sm:text-[9px]">
                        {getTrendIcon(report.content.trends?.score || 0)}
                        {Math.abs(report.content.trends?.score || 0)}
                     </div>
                  </div>
                  <h3 className="text-[10px] sm:text-base font-bold text-foreground leading-tight line-clamp-2 uppercase tracking-tighter">
                     {report.content.title}
                  </h3>
               </div>

               <div className="flex flex-col items-center justify-center flex-1 my-1 sm:my-2">
                  <div className="relative">
                     <ProgressRing 
                        progress={report.content.score} 
                        radius={isMobile ? 32 : 40} 
                        stroke={isMobile ? 4 : 6} 
                        color={getScoreColor(report.content.score)} 
                        trackColor="text-gray-100 dark:text-gray-800"
                        showValue={false}
                     />
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-lg sm:text-3xl font-black tabular-nums ${getScoreColor(report.content.score)}`}>
                           {report.content.score}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-1 pt-2 sm:pt-5 border-t border-[var(--color-border)]">
                  <div className="flex flex-col items-center">
                     <CheckCircle2 size={10} className="text-emerald-500 mb-0.5" />
                     <span className="text-[8px] sm:text-[10px] font-black text-foreground">{report.content.metrics.tasksDone}</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <Moon size={10} className="text-primary-500 mb-0.5" />
                     <span className="text-[8px] sm:text-[10px] font-black text-foreground">{report.content.metrics.sleepAvg.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <Zap size={10} className="text-amber-500 mb-0.5" />
                     <span className="text-[8px] sm:text-[10px] font-black text-foreground">{Math.round(report.content.metrics.habitsRate)}%</span>
                  </div>
               </div>
               
               <button 
                 onClick={(e) => handleRequestDelete(report.id, e)}
                 className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                 aria-label="Remove report"
               >
                  <Trash2 size={12} />
               </button>
            </div>
         ))}
      </div>

      {/* Detailed Dossier Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex justify-center items-center p-0 sm:p-6 animate-in fade-in duration-300" onClick={() => setSelectedReport(null)}>
           <div className="bg-white dark:bg-[#09090b] w-full max-w-4xl h-full sm:h-[90vh] sm:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 border border-white/5" onClick={e => e.stopPropagation()}>
              
              {/* Scaled Header */}
              <div className="p-4 sm:p-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.02] relative shrink-0">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600" />
                 <div className="pr-4">
                    <span className="text-[7px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-1 block">
                       Dossier • {selectedReport.period}
                    </span>
                    <h2 className="text-base sm:text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                       {selectedReport.content.title}
                    </h2>
                    <p className="text-gray-400 font-bold text-[8px] sm:text-xs mt-1 uppercase tracking-widest">{selectedReport.dateRange}</p>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90">
                    <X size={18} sm-size={20} strokeWidth={3} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-12 space-y-8 sm:space-y-12">
                 
                 {/* Summary Section */}
                 <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center lg:items-start">
                    <div className="shrink-0 relative">
                       <ProgressRing 
                          progress={selectedReport.content.score} 
                          radius={isMobile ? 50 : 65} 
                          stroke={8} 
                          color={getScoreColor(selectedReport.content.score)} 
                          showValue={false}
                       />
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">{selectedReport.content.score}</span>
                          <span className="text-[6px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest">Score</span>
                       </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                       <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shadow-inner"><Info size={12} sm-size={14} /></div>
                          <h3 className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-400">Executive Summary</h3>
                       </div>
                       <p className="text-xs sm:text-lg font-serif text-gray-700 dark:text-gray-200 leading-relaxed italic border-l-0 lg:border-l-4 border-gray-100 dark:border-gray-800 lg:pl-8 py-1">
                          "{selectedReport.content.summary}"
                       </p>
                    </div>
                 </div>

                 {/* Benchmarks Grid */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { icon: CheckCircle2, label: 'Task Load', val: selectedReport.content.metrics.tasksDone, trend: selectedReport.content.trends?.tasks, color: 'emerald' },
                      { icon: Moon, label: 'Sleep Avg', val: `${selectedReport.content.metrics.sleepAvg.toFixed(1)}h`, trend: selectedReport.content.trends?.sleep, color: 'primary' },
                      { icon: Zap, label: 'Habit Flow', val: `${Math.round(selectedReport.content.metrics.habitsRate)}%`, trend: selectedReport.content.trends?.habits, color: 'amber' },
                      { icon: DollarSign, label: 'Outflow', val: (getFormattedCurrency(selectedReport.content.metrics.expenseTotal) || "").split('.')[0], trend: null, color: 'rose' }
                    ].map((m, i) => (
                       <div key={i} className={`bg-${m.color}-50 dark:bg-${m.color}-900/10 p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-${m.color}-100 dark:border-${m.color}-900/30`}>
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                             <m.icon size={16} sm-size={22} className={`text-${m.color}-600`} />
                             {m.trend !== null && (
                                <div className="flex items-center gap-0.5">
                                   {getTrendIcon(m.trend || 0)}
                                   <span className={`text-[7px] sm:text-[9px] font-black ${m.trend && m.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.abs(m.trend || 0)}%</span>
                                </div>
                             )}
                          </div>
                          <p className={`text-[7px] sm:text-[9px] font-black text-${m.color}-600/60 uppercase tracking-widest mb-0.5`}>{m.label}</p>
                          <p className="text-lg sm:text-2xl font-black text-foreground tabular-nums">{m.val}</p>
                       </div>
                    ))}
                 </div>

                 {/* Indicators */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="bg-white dark:bg-white/[0.02] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-gray-800">
                       <h3 className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-5 sm:mb-6 flex items-center gap-2">
                          <CheckCircle2 size={14} sm-size={16} /> Critical Wins
                       </h3>
                       <div className="space-y-3 sm:space-y-4">
                          {selectedReport.content.completedItems.map((item, i) => (
                             <div key={i} className="flex gap-2 sm:gap-3 items-start animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20"><Check size={8} sm-size={10} className="text-white" strokeWidth={4} /></div>
                                <p className="text-gray-700 dark:text-gray-300 font-bold text-[10px] sm:text-sm leading-snug">{item}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white dark:bg-white/[0.02] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-gray-800">
                       <h3 className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-rose-500 mb-5 sm:mb-6 flex items-center gap-2">
                          <AlertCircle size={14} sm-size={16} /> Growth Friction
                       </h3>
                       <div className="space-y-3 sm:space-y-4">
                          {selectedReport.content.missedItems.map((item, i) => (
                             <div key={i} className="flex gap-2 sm:gap-3 items-start animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-rose-500/20"><X size={8} sm-size={10} className="text-white" strokeWidth={4} /></div>
                                <p className="text-gray-700 dark:text-gray-300 font-bold text-[10px] sm:text-sm leading-snug">{item}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Strategy Blocks */}
                 <div className="space-y-6 sm:space-y-8">
                    <div className="bg-primary-600 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-600/30">
                       <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[70px] -translate-y-1/2 translate-x-1/2" />
                       <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-6 sm:mb-8">
                             <TrendingUp size={20} sm-size={24} className="text-primary-200" />
                             <h3 className="text-xs sm:text-xl font-black uppercase tracking-[0.3em]">System Synthesis</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
                             {selectedReport.content.insights.map((insight, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md p-4 sm:p-7 rounded-2xl border border-white/10 shadow-inner">
                                   <p className="text-[10px] sm:text-sm font-bold leading-relaxed">{insight}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="bg-surface rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 border border-primary-100 dark:border-primary-900/30 shadow-sm">
                       <div className="flex items-center gap-2 mb-6 sm:mb-8 text-primary-600">
                          <Compass size={20} sm-size={24} />
                          <h3 className="text-xs sm:text-xl font-black uppercase tracking-[0.3em]">Tactical Plan</h3>
                       </div>
                       <div className="space-y-3 sm:space-y-4">
                          {selectedReport.content.solutions.map((sol, i) => (
                             <div key={i} className="flex items-center gap-4 sm:gap-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 transition-colors group">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-gray-800 text-primary-600 flex items-center justify-center font-black text-xs sm:text-lg shadow-md group-hover:scale-110 transition-transform shrink-0">{i + 1}</div>
                                <p className="text-gray-800 dark:text-gray-200 font-black text-[10px] sm:text-base tracking-tight leading-tight">{sol}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

              </div>

              {/* Dossier Footer Actions */}
              <div className="p-4 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f11] flex flex-col sm:flex-row justify-between gap-3 shrink-0">
                 <button 
                   onClick={() => setConfirmDeleteId(selectedReport.id)} 
                   className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-[8px] sm:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
                 >
                    <Trash2 size={14} sm-size={16} /> PURGE DOSSIER
                 </button>
                 <button 
                   onClick={() => setSelectedReport(null)}
                   className="bg-black dark:bg-white text-white dark:text-black px-10 py-3.5 rounded-xl font-black text-[8px] sm:text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
                 >
                    Close Analysis
                 </button>
              </div>

           </div>
        </div>
      )}

      {/* Reliable Deletion Confirmation */}
      <ConfirmationModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title="Remove Report"
        message="This intelligence report will be permanently purged from the system. Proceed?"
        type="danger"
        confirmText="Remove"
      />
    </div>
  );
};

export default Reports;
