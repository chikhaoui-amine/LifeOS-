import React, { useState } from 'react';
import { X, Calendar, Tag, ArrowRightLeft, TrendingUp, TrendingDown, Wallet, Plus, ArrowLeft, PiggyBank } from 'lucide-react';
import { useFinance, CURRENCIES } from '../../context/FinanceContext';
import { TransactionType } from '../../types';

interface TransactionFormProps {
  onClose: () => void;
  type?: TransactionType;
}

const CATEGORIES = {
  expense: ['Food & Dining', 'Transportation', 'Housing', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Travel', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Refund', 'Other'],
  savings: ['Savings', 'Investment', 'Emergency Fund', 'Goal Contribution']
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, type: initialType = 'expense' }) => {
  const { accounts, addTransaction, currency } = useFinance();
  
  // Default to expense if passed type is invalid for new UI
  const validInitialType = initialType === 'income' ? 'income' : 'expense';
  
  const [type, setType] = useState<TransactionType>(validInitialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[validInitialType][0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Custom Category State
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Derive Currency Symbol
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    await addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      description: description || category,
      date,
      accountId,
      tags: []
    });
    onClose();
  };

  const handleTypeChange = (t: TransactionType) => {
    if (t === 'savings') return; // Should not happen with UI removal
    setType(t);
    setCategory(CATEGORIES[t][0]);
    setIsCustomCategory(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-surface z-10">
           <h2 className="text-lg font-bold text-foreground">Add Transaction</h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-muted">
             <X size={20} />
           </button>
        </div>

        {/* Type Switcher */}
        <div className="p-2 bg-gray-50 dark:bg-gray-900/50 sticky top-[60px] z-10">
           <div className="grid grid-cols-2 gap-1">
             {(['expense', 'income'] as const).map(t => (
               <button
                 key={t}
                 type="button"
                 onClick={() => handleTypeChange(t)}
                 className={`py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === t ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
               >
                 {t === 'expense' && <TrendingDown size={16} className="text-red-500" />}
                 {t === 'income' && <TrendingUp size={16} className="text-green-500" />}
                 <span className="capitalize">{t}</span>
               </button>
             ))}
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           {/* Amount */}
           <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Amount</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">{currencySymbol}</span>
                 <input 
                   type="number" 
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   placeholder="0.00"
                   className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-none text-3xl font-bold outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`}
                   autoFocus
                   step="0.01"
                 />
              </div>
           </div>

           {/* Accounts */}
           <div className="grid grid-cols-1 gap-4">
              <div>
                 <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Account</label>
                 <select 
                   value={accountId}
                   onChange={e => setAccountId(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none text-foreground font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                 >
                    {accounts.map(acc => (
                       <option key={acc.id} value={acc.id}>{acc.name} ({currencySymbol}{acc.balance})</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* Category */}
           <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">Category</label>
              
              {!isCustomCategory ? (
                <div className="flex flex-wrap gap-2">
                   {CATEGORIES[type as 'expense' | 'income'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${category === cat ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-surface border-gray-200 dark:border-gray-700 text-muted'}`}
                      >
                         {cat}
                      </button>
                   ))}
                   <button
                      type="button"
                      onClick={() => { setIsCustomCategory(true); setCategory(''); }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-primary-600 hover:border-primary-500 transition-all flex items-center gap-1"
                   >
                      <Plus size={14} /> Custom
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                   <button 
                     type="button" 
                     onClick={() => { setIsCustomCategory(false); setCategory(CATEGORIES[type as 'expense' | 'income'][0]); }}
                     className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-muted hover:text-foreground"
                   >
                      <ArrowLeft size={18} />
                   </button>
                   <input 
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter category name..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none text-foreground font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                      autoFocus
                   />
                </div>
              )}
           </div>

           {/* Details */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Date</label>
                 <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none text-sm text-foreground font-medium outline-none"
                    />
                 </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Note</label>
                 <input 
                   type="text"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   placeholder="What was this?"
                   className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none text-sm text-foreground font-medium outline-none"
                 />
              </div>
           </div>

           <button 
             type="submit" 
             disabled={!amount || !accountId || !category}
             className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all active:scale-95 mt-4"
           >
              Save Transaction
           </button>

        </form>
      </div>
    </div>
  );
};