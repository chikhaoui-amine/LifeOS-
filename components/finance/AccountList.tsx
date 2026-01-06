
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Wallet, CreditCard, Landmark, DollarSign, TrendingUp, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';

export const AccountList: React.FC = () => {
  const { accounts, addAccount, deleteAccount, getFormattedCurrency, currency } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<AccountType>('checking');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName) {
       await addAccount({
          name: newAccountName,
          type: newAccountType,
          balance: parseFloat(newAccountBalance) || 0,
          currency: currency, 
          color: 'blue',
          icon: 'wallet',
          isExcludedFromTotal: false
       });
       setIsAdding(false);
       setNewAccountName('');
       setNewAccountBalance('');
    }
  };

  const getIcon = (type: AccountType) => {
     switch(type) {
        case 'credit': return <CreditCard size={20} />;
        case 'savings': return <DollarSign size={20} />;
        case 'investment': return <TrendingUp size={20} />; 
        case 'checking': return <Landmark size={20} />;
        default: return <Wallet size={20} />;
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Your Portfolio</h3>
          <button onClick={() => setIsAdding(!isAdding)} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
             {isAdding ? 'Cancel' : '+ New Account'}
          </button>
       </div>

       {isAdding && (
          <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[2rem] border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in slide-in-from-top-2 relative">
             <button type="button" onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={16} /></button>
             <h4 className="text-xs font-bold text-foreground mb-2">Create Account</h4>
             
             <input 
               placeholder="Account Name (e.g. Main Bank)" 
               value={newAccountName} 
               onChange={e => setNewAccountName(e.target.value)}
               className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
               autoFocus
             />
             <div className="flex gap-2">
               <select 
                  value={newAccountType}
                  onChange={e => setNewAccountType(e.target.value as AccountType)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium outline-none"
               >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="investment">Investment</option>
                  <option value="wallet">Cash Wallet</option>
               </select>
               <input 
                  type="number"
                  placeholder="Balance" 
                  value={newAccountBalance} 
                  onChange={e => setNewAccountBalance(e.target.value)}
                  className="w-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-bold outline-none"
               />
             </div>
             <button type="submit" disabled={!newAccountName} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 disabled:opacity-50">Create</button>
          </form>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
             <div key={acc.id} className="bg-surface p-5 rounded-[2rem] border border-[var(--color-border)] flex justify-between items-center group relative shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${acc.type === 'credit' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' : acc.type === 'savings' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                      {getIcon(acc.type)}
                   </div>
                   <div>
                      <p className="font-bold text-foreground text-sm">{acc.name}</p>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-70">{acc.type}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`font-black text-lg ${acc.balance < 0 ? 'text-rose-500' : 'text-foreground'}`}>{getFormattedCurrency(acc.balance)}</p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => { if(confirm('Delete account?')) deleteAccount(acc.id); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                   <MoreHorizontal size={16} />
                </button>
             </div>
          ))}
          {accounts.length === 0 && (
             <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No accounts configured</p>
             </div>
          )}
       </div>
    </div>
  );
};
