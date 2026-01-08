import React, { useState, useMemo } from 'react';
import { PiggyBank, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { ConfirmationModal } from '../ConfirmationModal';
import { LanguageCode } from '../../types';

export const FinanceOverview: React.FC<{ onAddTransaction: () => void }> = ({ onAddTransaction }) => {
  const { transactions, getFormattedCurrency, deleteTransaction } = useFinance();
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const handleDeleteClick = (id: string) => {
    setConfirmConfig({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (confirmConfig.id) {
      deleteTransaction(confirmConfig.id);
      setConfirmConfig({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       
       <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
             {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
       </div>

       {/* Recent Transactions */}
       <div>
          <h3 className="text-sm font-black text-foreground mb-4 px-2 uppercase tracking-widest opacity-60">{t.finance.recent}</h3>
          <div className="space-y-3">
             {transactions.slice(0, 8).map(tx => {
                const isExpense = tx.type === 'expense';
                const isSavings = tx.type === 'savings';
                return (
                   <div key={tx.id} className="group flex items-center justify-between p-4 bg-surface rounded-[1.5rem] border border-[var(--color-border)] hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isExpense ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : isSavings ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20'}`}>
                            {isExpense ? <ArrowDownRight size={18} /> : isSavings ? <PiggyBank size={18} /> : <ArrowUpRight size={18} />}
                         </div>
                         <div>
                            <p className="font-bold text-foreground text-sm">{tx.description}</p>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`font-black text-sm sm:text-base ${isExpense ? 'text-foreground' : isSavings ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                           {isExpense ? '-' : '+'}{getFormattedCurrency(tx.amount)}
                        </span>
                        
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(tx.id); }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                   </div>
                )
             })}
             {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-400 rounded-[2rem] border-2 border-dashed border-[var(--color-border)]">
                   <p className="text-xs font-black uppercase tracking-widest opacity-60">No activity recorded</p>
                </div>
             )}
          </div>
       </div>

       <ConfirmationModal 
         isOpen={confirmConfig.isOpen}
         onClose={() => setConfirmConfig({ isOpen: false, id: null })}
         onConfirm={confirmDelete}
         title="Delete Transaction"
         message="Are you sure you want to delete this transaction?"
         type="danger"
       />
    </div>
  );
};