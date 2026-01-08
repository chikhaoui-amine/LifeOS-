import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Account, Transaction, Budget, SavingsGoal } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'MXN', symbol: '$', label: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', label: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'TWD', symbol: 'NT$', label: 'New Taiwan Dollar' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Zloty' },
  { code: 'THB', symbol: '฿', label: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
  { code: 'HUF', symbol: 'Ft', label: 'Hungarian Forint' },
  { code: 'CZK', symbol: 'Kč', label: 'Czech Koruna' },
  { code: 'ILS', symbol: '₪', label: 'Israeli New Shekel' },
  { code: 'CLP', symbol: '$', label: 'Chilean Peso' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'COP', symbol: '$', label: 'Colombian Peso' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'RON', symbol: 'lei', label: 'Romanian Leu' },
  { code: 'AFN', symbol: '؋', label: 'Afghan Afghani' },
  { code: 'ALL', symbol: 'L', label: 'Albanian Lek' },
  { code: 'DZD', symbol: 'دج', label: 'Algerian Dinar' },
  { code: 'AOA', symbol: 'Kz', label: 'Angolan Kwanza' },
  { code: 'ARS', symbol: '$', label: 'Argentine Peso' },
  { code: 'AMD', symbol: '֏', label: 'Armenian Dram' },
  { code: 'AWG', symbol: 'ƒ', label: 'Aruban Florin' },
  { code: 'AZN', symbol: '₼', label: 'Azerbaijani Manat' },
  { code: 'BSD', symbol: '$', label: 'Bahamian Dollar' },
  { code: 'BHD', symbol: '.د.ب', label: 'Bahraini Dinar' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  { code: 'BBD', symbol: '$', label: 'Barbadian Dollar' },
  { code: 'BYN', symbol: 'Br', label: 'Belarusian Ruble' },
  { code: 'BZD', symbol: 'BZ$', label: 'Belize Dollar' },
  { code: 'BMD', symbol: '$', label: 'Bermudian Dollar' },
  { code: 'BTN', symbol: 'Nu.', label: 'Bhutanese Ngultrum' },
  { code: 'BOB', symbol: '$b', label: 'Bolivian Boliviano' },
  { code: 'BAM', symbol: 'KM', label: 'Bosnia-Herzegovina Convertible Mark' },
  { code: 'BWP', symbol: 'P', label: 'Botswanan Pula' },
  { code: 'BND', symbol: '$', label: 'Brunei Dollar' },
  { code: 'BGN', symbol: 'лв', label: 'Bulgarian Lev' },
  { code: 'BIF', symbol: 'FBu', label: 'Burundian Franc' },
  { code: 'KHR', symbol: '៛', label: 'Cambodian Riel' },
  { code: 'CVE', symbol: '$', label: 'Cape Verdean Escudo' },
  { code: 'KYD', symbol: '$', label: 'Cayman Islands Dollar' },
  { code: 'XAF', symbol: 'FCFA', label: 'Central African CFA Franc' },
  { code: 'XPF', symbol: 'CFP', label: 'CFP Franc' },
  { code: 'GIP', symbol: '£', label: 'Gibraltar Pound' },
  { code: 'GMD', symbol: 'D', label: 'Gambian Dalasi' },
  { code: 'GEL', symbol: '₾', label: 'Georgian Lari' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { code: 'GNF', symbol: 'FG', label: 'Guinean Franc' },
  { code: 'GYD', symbol: '$', label: 'Guyanese Dollar' },
  { code: 'HTG', symbol: 'G', label: 'Haitian Gourde' },
  { code: 'HNL', symbol: 'L', label: 'Honduran Lempira' },
  { code: 'ISK', symbol: 'kr', label: 'Icelandic Króna' },
  { code: 'IQD', symbol: 'ع.د', label: 'Iraqi Dinar' },
  { code: 'IRR', symbol: '﷼', label: 'Iranian Rial' },
  { code: 'JMD', symbol: 'J$', label: 'Jamaican Dollar' },
  { code: 'JOD', symbol: 'JD', label: 'Jordanian Dinar' },
  { code: 'KZT', symbol: '₸', label: 'Kazakhstani Tenge' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'KWD', symbol: 'KD', label: 'Kuwaiti Dinar' },
  { code: 'KGS', symbol: 'лв', label: 'Kyrgystani Som' },
  { code: 'LAK', symbol: '₭', label: 'Laotian Kip' },
  { code: 'LBP', symbol: '£', label: 'Lebanese Pound' },
  { code: 'LSL', symbol: 'L', label: 'Lesotho Loti' },
  { code: 'LRD', symbol: '$', label: 'Liberian Dollar' },
  { code: 'LYD', symbol: 'LD', label: 'Libyan Dinar' },
  { code: 'MOP', symbol: 'MOP$', label: 'Macanese Pataca' },
  { code: 'MKD', symbol: 'ден', label: 'Macedonian Denar' },
  { code: 'MGA', symbol: 'Ar', label: 'Malagasy Ariary' },
  { code: 'MWK', symbol: 'MK', label: 'Malawian Kwacha' },
  { code: 'MVR', symbol: 'Rf', label: 'Maldivian Rufiyaa' },
  { code: 'MRU', symbol: 'UM', label: 'Mauritanian Ouguiya' },
  { code: 'MUR', symbol: '₨', label: 'Mauritian Rupee' },
  { code: 'MDL', symbol: 'L', label: 'Moldovan Leu' },
  { code: 'MNT', symbol: '₮', label: 'Mongolian Tugrik' },
  { code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham' },
  { code: 'MZN', symbol: 'MT', label: 'Mozambican Metical' },
  { code: 'MMK', symbol: 'K', label: 'Myanmar Kyat' },
  { code: 'NAD', symbol: '$', label: 'Namibian Dollar' },
  { code: 'NPR', symbol: '₨', label: 'Nepalese Rupee' },
  { code: 'NIO', symbol: 'C$', label: 'Nicaraguan Córdoba' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'OMR', symbol: '﷼', label: 'Omani Rial' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
  { code: 'PAB', symbol: 'B/.', label: 'Panamanian Balboa' },
  { code: 'PGK', symbol: 'K', label: 'Papua New Guinean Kina' },
  { code: 'PYG', symbol: 'Gs', label: 'Paraguayan Guarani' },
  { code: 'PEN', symbol: 'S/.', label: 'Peruvian Sol' },
  { code: 'QAR', symbol: '﷼', label: 'Qatari Rial' },
  { code: 'RWF', symbol: 'R₣', label: 'Rwandan Franc' },
  { code: 'STN', symbol: 'Db', label: 'São Tomé & Príncipe Dobra' },
  { code: 'RSD', symbol: 'дин.', label: 'Serbian Dinar' },
  { code: 'SCR', symbol: '₨', label: 'Seychellois Rupee' },
  { code: 'SLL', symbol: 'Le', label: 'Sierra Leonean Leone' },
  { code: 'SOS', symbol: 'S', label: 'Somali Shilling' },
  { code: 'LKR', symbol: '₨', label: 'Sri Lankan Rupee' },
  { code: 'SDG', symbol: 'ج.س.', label: 'Sudanese Pound' },
  { code: 'SRD', symbol: '$', label: 'Surinamese Dollar' },
  { code: 'SZL', symbol: 'E', label: 'Swazi Lilangeni' },
  { code: 'SYP', symbol: '£', label: 'Syrian Pound' },
  { code: 'TJS', symbol: 'SM', label: 'Tajikistani Somoni' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling' },
  { code: 'TOP', symbol: 'T$', label: 'Tongan Paʻanga' },
  { code: 'TTD', symbol: 'TT$', label: 'Trinidad & Tobago Dollar' },
  { code: 'TND', symbol: 'DT', label: 'Tunisian Dinar' },
  { code: 'TMT', symbol: 'T', label: 'Turkmenistani Manat' },
  { code: 'UGX', symbol: 'USh', label: 'Ugandan Shilling' },
  { code: 'UAH', symbol: '₴', label: 'Ukrainian Hryvnia' },
  { code: 'UYU', symbol: '$U', label: 'Uruguayan Peso' },
  { code: 'UZS', symbol: 'лв', label: 'Uzbekistani Som' },
  { code: 'VUV', symbol: 'VT', label: 'Vanuatu Vatu' },
  { code: 'VES', symbol: 'Bs.S', label: 'Venezuelan Bolívar' },
  { code: 'VND', symbol: '₫', label: 'Vietnamese Dong' },
  { code: 'YER', symbol: '﷼', label: 'Yemeni Rial' },
  { code: 'ZMW', symbol: 'ZK', label: 'Zambian Kwacha' },
  { code: 'ZWL', symbol: '$', label: 'Zimbabwean Dollar' },
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