import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Account, Transaction, Budget, SavingsGoal } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  // ... rest of currencies truncated for brevity in change block
].sort((a, b) => (a.label || "").localeCompare(b.label || ""));

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  currency: string;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  getFormattedCurrency: (amount: number) => string;
  getTotalBalance: () => number;
  setCurrency: (code: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Cash Wallet', type: 'wallet', balance: 0, currency: 'USD', color: 'green', icon: 'wallet', isExcludedFromTotal: false }
];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [currency, setCurrencyState] = useState('USD');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const storedAccounts = await storage.load<Account[]>(STORAGE_KEYS.FINANCE_ACCOUNTS);
    const storedTransactions = await storage.load<Transaction[]>(STORAGE_KEYS.FINANCE_TXS);
    const storedBudgets = await storage.load<Budget[]>(STORAGE_KEYS.FINANCE_BUDGETS);
    const storedGoals = await storage.load<SavingsGoal[]>(STORAGE_KEYS.FINANCE_GOALS);
    const storedCurrency = await storage.load<string>(STORAGE_KEYS.FINANCE_CURRENCY);

    setAccounts(storedAccounts || DEFAULT_ACCOUNTS);
    setTransactions(storedTransactions || []);
    setBudgets(storedBudgets || []);
    setSavingsGoals(storedGoals || []);
    if (storedCurrency) setCurrencyState(storedCurrency);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // Listen for sync reload events
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const saveData = async (key: string, data: any) => {
    await storage.save(key, data);
  };

  const setCurrency = async (code: string) => {
    setCurrencyState(code);
    await saveData(STORAGE_KEYS.FINANCE_CURRENCY, code);
  };

  const addAccount = async (data: Omit<Account, 'id'>) => {
    const newAccount = { ...data, id: Date.now().toString() };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    await saveData(STORAGE_KEYS.FINANCE_ACCOUNTS, updated);
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const updated = accounts.map(a => a.id === id ? { ...a, ...updates } : a);
    setAccounts(updated);
    await saveData(STORAGE_KEYS.FINANCE_ACCOUNTS, updated);
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    await saveData(STORAGE_KEYS.FINANCE_ACCOUNTS, updated);
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    await saveData(STORAGE_KEYS.FINANCE_TXS, updatedTransactions);

    let updatedAccounts = [...accounts];
    if (data.type === 'income') {
      updatedAccounts = updatedAccounts.map(a => a.id === data.accountId ? { ...a, balance: a.balance + data.amount } : a);
    } else if (data.type === 'expense') {
      updatedAccounts = updatedAccounts.map(a => a.id === data.accountId ? { ...a, balance: a.balance - data.amount } : a);
    } else if (data.type === 'savings' && data.toAccountId) {
      updatedAccounts = updatedAccounts.map(a => {
        if (a.id === data.accountId) return { ...a, balance: a.balance - data.amount };
        if (a.id === data.toAccountId) return { ...a, balance: a.balance + data.amount };
        return a;
      });
    }
    setAccounts(updatedAccounts);
    await saveData(STORAGE_KEYS.FINANCE_ACCOUNTS, updatedAccounts);
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    let updatedAccounts = [...accounts];
    if (tx.type === 'income') {
      updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a);
    } else if (tx.type === 'expense') {
      updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a);
    }
    setAccounts(updatedAccounts);
    await saveData(STORAGE_KEYS.FINANCE_ACCOUNTS, updatedAccounts);
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    await saveData(STORAGE_KEYS.FINANCE_TXS, updatedTransactions);
  };

  const addBudget = async (data: Omit<Budget, 'id'>) => {
    const updated = [...budgets, { ...data, id: Date.now().toString() }];
    setBudgets(updated);
    await saveData(STORAGE_KEYS.FINANCE_BUDGETS, updated);
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    setBudgets(updated);
    await saveData(STORAGE_KEYS.FINANCE_BUDGETS, updated);
  };

  const deleteBudget = async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await saveData(STORAGE_KEYS.FINANCE_BUDGETS, updated);
  };

  const addSavingsGoal = async (data: Omit<SavingsGoal, 'id'>) => {
    const updated = [...savingsGoals, { ...data, id: Date.now().toString() }];
    setSavingsGoals(updated);
    await saveData(STORAGE_KEYS.FINANCE_GOALS, updated);
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g);
    setSavingsGoals(updated);
    await saveData(STORAGE_KEYS.FINANCE_GOALS, updated);
  };

  const deleteSavingsGoal = async (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(updated);
    await saveData(STORAGE_KEYS.FINANCE_GOALS, updated);
  };

  const getFormattedCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  const getTotalBalance = () => accounts.reduce((acc, curr) => !curr.isExcludedFromTotal ? acc + curr.balance : acc, 0);

  return (
    <FinanceContext.Provider value={{
      accounts, transactions, budgets, savingsGoals, loading, currency,
      addAccount, updateAccount, deleteAccount, addTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      getFormattedCurrency, getTotalBalance, setCurrency
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};