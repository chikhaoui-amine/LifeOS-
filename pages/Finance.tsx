import React, { useState, useMemo } from 'react';
import { DollarSign, Wallet, PieChart, Plus, Search, TrendingUp, TrendingDown, PiggyBank, Settings, ArrowRightLeft, X } from 'lucide-react';
import { FinanceOverview } from '../components/finance/FinanceOverview';
import { AccountList } from '../components/finance/AccountList';
import { TransactionForm } from '../components/finance/TransactionForm';
import { useFinance, CURRENCIES } from '../context/FinanceContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const Finance: React.FC = () => {
  const { loading, currency, setCurrency, getTotalBalance, getFormattedCurrency, transactions } = useFinance();
  const [viewMode, setViewMode] = useState<'overview' | 'accounts'>('overview');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const totalBalance = getTotalBalance();

  // Calculate Monthly Stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthlyTransactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
  const expense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);

  const filteredCurrencies = useMemo(() => CURRENCIES.filter(c => 
    c.label.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  ), [currencySearch]);

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 relative">
      
      {/* Premium Header */}
      <header className="relative p-5 sm:p-6 rounded-[2rem] bg-[#1f2937] text-white shadow-2xl shadow-gray-900/20 group transition-all duration-500 hover:shadow-gray-900/30">
         {/* Background Effects Container (Clipped) */}
         <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_12s_infinite_linear]" />
             <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-[80px] mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[60px]" />
         </div>
         
         <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                   <div>
                      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none mb-1 drop-shadow-sm flex items-baseline">
                         {getFormattedCurrency(totalBalance).split('.')[0]}
                         <span className="text-2xl sm:text-3xl opacity-60 font-bold tracking-normal ml-1">.{getFormattedCurrency(totalBalance).split('.')[1] || '00'}</span>
                      </h1>
                      <p className="text-gray-400 font-bold text-xs sm:text-sm pl-1 uppercase tracking-widest">Total Net Worth</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                   <button 
                     onClick={() => setIsTxModalOpen(true)}
                     className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
                   >
                      <Plus size={16} strokeWidth={3} /> Add Transaction
                   </button>
                   
                   <div className="relative">
                      <button 
                        onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                        className="w-full sm:w-auto flex items-center justify-between gap-4 px-4 py-3 bg-gray-700/40 hover:bg-gray-700/60 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-gray-600/30 backdrop-blur-md"
                      >
                         <span className="opacity-70">Currency</span>
                         <span className="bg-gray-900/50 px-2 py-0.5 rounded-lg border border-gray-500/30 min-w-[2.5rem] text-center">{currency}</span>
                      </button>
                      
                      {showCurrencySelector && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-80">
                            <div className="p-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex gap-2">
                               <div className="relative flex-1">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={currencySearch}
                                    onChange={(e) => setCurrencySearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-gray-900 dark:text-white"
                                    autoFocus
                                  />
                               </div>
                               <button onClick={() => setShowCurrencySelector(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"><X size={16} /></button>
                            </div>
                            <div className="p-2 overflow-y-auto custom-scrollbar">
                               {filteredCurrencies.map(c => (
                                 <button
                                   key={c.code}
                                   onClick={() => { setCurrency(c.code); setShowCurrencySelector(false); setCurrencySearch(''); }}
                                   className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between group transition-colors ${currency === c.code ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                 >
                                    <span className="truncate mr-2">{c.label}</span>
                                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${currency === c.code ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>{c.code}</span>
                                 </button>
                               ))}
                            </div>
                        </div>
                      )}
                   </div>
                </div>
            </div>

            {/* Monthly Stats Compact Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
               <div className="bg-emerald-400/40 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-emerald-400/30">
                  <div className="flex items-center gap-1.5 text-emerald-50 mb-0.5 opacity-90">
                     <div className="p-1 bg-emerald-500/40 rounded-md"><TrendingUp size={10} /></div>
                     <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Income</span>
                     <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">In</span>
                  </div>
                  <span className="text-sm sm:text-lg font-black tracking-tight">{getFormattedCurrency(income)}</span>
               </div>
               
               <div className="bg-rose-500/40 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-rose-400/30">
                  <div className="flex items-center gap-1.5 text-rose-50 mb-0.5 opacity-90">
                     <div className="p-1 bg-rose-600/40 rounded-md"><TrendingDown size={10} /></div>
                     <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Expenses</span>
                     <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Out</span>
                  </div>
                  <span className="text-sm sm:text-lg font-black tracking-tight">{getFormattedCurrency(expense)}</span>
               </div>
            </div>
         </div>
      </header>

      {/* Navigation */}
      <div className="flex justify-center sm:justify-start">
         <div className="flex p-1.5 bg-gray-200/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 w-full sm:w-auto">
            <button 
               onClick={() => setViewMode('overview')} 
               className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'overview' ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-foreground'}`}
            >
               <PieChart size={14} strokeWidth={2.5} /> Overview
            </button>
            <button 
               onClick={() => setViewMode('accounts')} 
               className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'accounts' ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-foreground'}`}
            >
               <Wallet size={14} strokeWidth={2.5} /> Accounts
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
         {viewMode === 'overview' && (
            <FinanceOverview onAddTransaction={() => setIsTxModalOpen(true)} />
         )}
         {viewMode === 'accounts' && (
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
               <AccountList />
            </div>
         )}
      </div>

      {isTxModalOpen && <TransactionForm onClose={() => setIsTxModalOpen(false)} />}
    </div>
  );
};

export default Finance;