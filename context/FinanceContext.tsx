import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, Transaction, Budget, SavingsGoal, TransactionType } from '../types';
import { storage } from '../utils/storage';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'RUB', symbol: '₽', label: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { code: 'MXN', symbol: 'Mex$', label: 'Mexican Peso' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', label: 'Thai Baht' },
  { code: 'VND', symbol: '₫', label: 'Vietnamese Dong' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Złoty' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'ILS', symbol: '₪', label: 'Israeli New Shekel' },
  { code: 'EGP', symbol: 'E£', label: 'Egyptian Pound' },
  { code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee' },
  { code: 'KWD', symbol: 'KD', label: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'QR', label: 'Qatari Riyal' },
  { code: 'OMR', symbol: 'OMR', label: 'Omani Rial' },
  { code: 'BHD', symbol: 'BD', label: 'Bahraini Dinar' },
  { code: 'JOD', symbol: 'JD', label: 'Jordanian Dinar' },
  { code: 'LBP', symbol: 'L£', label: 'Lebanese Pound' },
  { code: 'MAD', symbol: 'DH', label: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'DA', label: 'Algerian Dinar' },
  { code: 'TND', symbol: 'DT', label: 'Tunisian Dinar' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'Rs', label: 'Nepalese Rupee' },
  { code: 'ARS', symbol: '$', label: 'Argentine Peso' },
  { code: 'COP', symbol: '$', label: 'Colombian Peso' },
  { code: 'CLP', symbol: '$', label: 'Chilean Peso' },
  { code: 'PEN', symbol: 'S/', label: 'Peruvian Sol' },
  { code: 'HUF', symbol: 'Ft', label: 'Hungarian Forint' },
  { code: 'CZK', symbol: 'Kč', label: 'Czech Koruna' },
  { code: 'RON', symbol: 'lei', label: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', label: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', label: 'Croatian Kuna' },
  { code: 'ISK', symbol: 'kr', label: 'Icelandic Króna' },
  { code: 'UAH', symbol: '₴', label: 'Ukrainian Hryvnia' },
  { code: 'KZT', symbol: '₸', label: 'Kazakhstani Tenge' },
  { code: 'TWD', symbol: 'NT$', label: 'New Taiwan Dollar' }
].sort((a, b) => a.label.localeCompare(b.label));

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  currency: string;
  
  // Accounts
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  
  // Helpers
  getFormattedCurrency: (amount: number) => string;
  getTotalBalance: () => number;
  setCurrency: (code: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const FINANCE_STORAGE_KEYS = {
  ACCOUNTS: 'lifeos_finance_accounts_v1',
  TRANSACTIONS: 'lifeos_finance_transactions_v1',
  BUDGETS: 'lifeos_finance_budgets_v1',
  GOALS: 'lifeos_finance_goals_v1',
  CURRENCY: 'lifeos_finance_currency_v1',
};

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

  // Load Data
  useEffect(() => {
    const load = async () => {
      const storedAccounts = await storage.load<Account[]>(FINANCE_STORAGE_KEYS.ACCOUNTS);
      const storedTransactions = await storage.load<Transaction[]>(FINANCE_STORAGE_KEYS.TRANSACTIONS);
      const storedBudgets = await storage.load<Budget[]>(FINANCE_STORAGE_KEYS.BUDGETS);
      const storedGoals = await storage.load<SavingsGoal[]>(FINANCE_STORAGE_KEYS.GOALS);
      const storedCurrency = await storage.load<string>(FINANCE_STORAGE_KEYS.CURRENCY);

      setAccounts(storedAccounts || DEFAULT_ACCOUNTS);
      setTransactions(storedTransactions || []);
      setBudgets(storedBudgets || []);
      setSavingsGoals(storedGoals || []);
      if (storedCurrency) setCurrencyState(storedCurrency);
      setLoading(false);
    };
    load();
  }, []);

  // Sync logic handled by individual actions to ensure atomic updates with storage
  const saveData = async (key: string, data: any) => {
    await storage.save(key, data);
  };

  const setCurrency = async (code: string) => {
    setCurrencyState(code);
    await saveData(FINANCE_STORAGE_KEYS.CURRENCY, code);
  };

  // --- Account Actions ---
  const addAccount = async (data: Omit<Account, 'id'>) => {
    const newAccount = { ...data, id: Date.now().toString() };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    await saveData(FINANCE_STORAGE_KEYS.ACCOUNTS, updated);
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const updated = accounts.map(a => a.id === id ? { ...a, ...updates } : a);
    setAccounts(updated);
    await saveData(FINANCE_STORAGE_KEYS.ACCOUNTS, updated);
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    await saveData(FINANCE_STORAGE_KEYS.ACCOUNTS, updated);
  };

  // --- Transaction Actions ---
  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    
    // Update State
    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    await saveData(FINANCE_STORAGE_KEYS.TRANSACTIONS, updatedTransactions);

    // Update Account Balances
    let updatedAccounts = [...accounts];
    
    if (data.type === 'income') {
      updatedAccounts = updatedAccounts.map(a => 
        a.id === data.accountId ? { ...a, balance: a.balance + data.amount } : a
      );
    } else if (data.type === 'expense') {
      updatedAccounts = updatedAccounts.map(a => 
        a.id === data.accountId ? { ...a, balance: a.balance - data.amount } : a
      );
    } else if (data.type === 'savings' && data.toAccountId) { // 'savings' acts like transfer
      updatedAccounts = updatedAccounts.map(a => {
        if (a.id === data.accountId) return { ...a, balance: a.balance - data.amount }; // From
        if (a.id === data.toAccountId) return { ...a, balance: a.balance + data.amount }; // To
        return a;
      });
    }

    setAccounts(updatedAccounts);
    await saveData(FINANCE_STORAGE_KEYS.ACCOUNTS, updatedAccounts);
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Revert Balance
    let updatedAccounts = [...accounts];
    if (tx.type === 'income') {
      updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a);
    } else if (tx.type === 'expense') {
      updatedAccounts = updatedAccounts.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a);
    } else if (tx.type === 'savings' && tx.toAccountId) {
      updatedAccounts = updatedAccounts.map(a => {
        if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
        if (a.id === tx.toAccountId) return { ...a, balance: a.balance - tx.amount };
        return a;
      });
    }

    setAccounts(updatedAccounts);
    await saveData(FINANCE_STORAGE_KEYS.ACCOUNTS, updatedAccounts);

    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    await saveData(FINANCE_STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
  };

  // --- Budget Actions ---
  const addBudget = async (data: Omit<Budget, 'id'>) => {
    const newBudget = { ...data, id: Date.now().toString() };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await saveData(FINANCE_STORAGE_KEYS.BUDGETS, updated);
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    setBudgets(updated);
    await saveData(FINANCE_STORAGE_KEYS.BUDGETS, updated);
  };

  const deleteBudget = async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await saveData(FINANCE_STORAGE_KEYS.BUDGETS, updated);
  };

  // --- Savings Actions ---
  const addSavingsGoal = async (data: Omit<SavingsGoal, 'id'>) => {
    const newGoal = { ...data, id: Date.now().toString() };
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    await saveData(FINANCE_STORAGE_KEYS.GOALS, updated);
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g);
    setSavingsGoals(updated);
    await saveData(FINANCE_STORAGE_KEYS.GOALS, updated);
  };

  const deleteSavingsGoal = async (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(updated);
    await saveData(FINANCE_STORAGE_KEYS.GOALS, updated);
  };

  // --- Helpers ---
  const getFormattedCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getTotalBalance = () => {
    return accounts.reduce((acc, curr) => !curr.isExcludedFromTotal ? acc + curr.balance : acc, 0);
  };

  return (
    <FinanceContext.Provider value={{
      accounts, transactions, budgets, savingsGoals, loading, currency,
      addAccount, updateAccount, deleteAccount,
      addTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
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
