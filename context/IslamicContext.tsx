import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DailyPrayers, QuranProgress, IslamicSettings, AdhkarProgress, DeenStatus, SunnahEntry } from '../types';
import { storage } from '../utils/storage';
import { getPrayerTimes, getHijriDate, getQiblaDirection, getHijriKey } from '../utils/islamicUtils';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface IslamicContextType {
  settings: IslamicSettings;
  prayers: DailyPrayers[];
  quran: QuranProgress;
  adhkar: AdhkarProgress[];
  todayPrayers: DailyPrayers;
  todayAdhkar: AdhkarProgress;
  loading: boolean;
  prayerTimes: Record<string, string>;
  hijriDate: { day: number; month: number; year: number; monthName: string };
  qiblaDirection: number;
  getPrayersForDate: (dateKey: string) => DailyPrayers;
  getAdhkarForDate: (dateKey: string) => AdhkarProgress;
  updatePrayerStatus: (prayer: keyof Omit<DailyPrayers, 'date' | 'sunnahs'>, status: DeenStatus, dateKey?: string) => void;
  updateSunnahStatus: (sunnahId: string, status: DeenStatus, dateKey?: string) => void;
  addSunnah: (title: string, rakats: string | number, time: string, dateKey?: string) => void;
  removeSunnah: (sunnahId: string, dateKey?: string) => void;
  updateAdhkarStatus: (type: 'morning' | 'evening' | 'night', status: DeenStatus, dateKey?: string) => void;
  updateAdhkarProgress: (updates: Partial<AdhkarProgress>, dateKey?: string) => void;
  updateQuranProgress: (progress: Partial<QuranProgress>) => void;
  updateSettings: (updates: Partial<IslamicSettings>) => void;
  resetQuranProgress: () => void;
}

const IslamicContext = createContext<IslamicContextType | undefined>(undefined);

const DEFAULT_SETTINGS: IslamicSettings = { calculationMethod: 'ISNA', asrMethod: 'Standard', hijriAdjustment: 0, location: { lat: 21.4225, lng: 39.8262 } };
const DEFAULT_QURAN: QuranProgress = { completedRubus: [], lastReadDate: new Date().toISOString(), khatamCount: 0 };
const DEFAULT_SUNNAHS: Omit<SunnahEntry, 'status'>[] = [
  { id: 'sf', title: 'Sunnah Fajr', rakats: 2, time: 'Before Fajr' },
  { id: 'dh', title: 'Duha', rakats: '2-8', time: 'Morning' },
  { id: 'wi', title: 'Witr', rakats: '1-3', time: 'Night' },
  { id: 'ta', title: 'Tahajjud', rakats: '2+', time: 'Late Night' },
];

export const IslamicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prayers, setPrayers] = useState<DailyPrayers[]>([]);
  const [quran, setQuran] = useState<QuranProgress>(DEFAULT_QURAN);
  const [adhkar, setAdhkar] = useState<AdhkarProgress[]>([]);
  const [settings, setSettings] = useState<IslamicSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [hijriDate, setHijriDate] = useState({ day: 1, month: 1, year: 1445, monthName: 'Muharram' });
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [currentHijriKey, setCurrentHijriKey] = useState("");

  const loadData = useCallback(async () => {
    const p = await storage.load<DailyPrayers[]>(STORAGE_KEYS.DEEN_PRAYERS);
    const q = await storage.load<QuranProgress>(STORAGE_KEYS.DEEN_QURAN);
    const a = await storage.load<AdhkarProgress[]>(STORAGE_KEYS.DEEN_ADHKAR);
    const s = await storage.load<IslamicSettings>(STORAGE_KEYS.DEEN_SETTINGS);
    if (p) setPrayers(p);
    if (q) setQuran(q);
    if (a) setAdhkar(a);
    if (s) setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  useEffect(() => {
    const today = new Date();
    setPrayerTimes(getPrayerTimes(today, settings.location.lat, settings.location.lng));
    setHijriDate(getHijriDate(today, settings.hijriAdjustment));
    setCurrentHijriKey(getHijriKey(today, settings.hijriAdjustment));
    setQiblaDirection(getQiblaDirection(settings.location.lat, settings.location.lng));
  }, [settings.location, settings.hijriAdjustment]);

  const getPrayersForDate = (dateKey: string): DailyPrayers => prayers.find(p => p.date === dateKey) || { date: dateKey, fajr: 'none', dhuhr: 'none', asr: 'none', maghrib: 'none', isha: 'none', sunnahs: DEFAULT_SUNNAHS.map(s => ({ ...s, status: 'none' })) };
  const getAdhkarForDate = (dateKey: string): AdhkarProgress => adhkar.find(a => a.date === dateKey) || { date: dateKey, morningStatus: 'none', eveningStatus: 'none', nightStatus: 'none', morningCount: 0, eveningCount: 0, nightCount: 0 };
  const todayPrayers = getPrayersForDate(currentHijriKey);
  const todayAdhkar = getAdhkarForDate(currentHijriKey);

  const persist = async (key: string, data: any) => storage.save(key, data);

  const updatePrayerStatus = async (prayer: keyof Omit<DailyPrayers, 'date' | 'sunnahs'>, status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const updated = prayers.find(p => p.date === targetKey) ? prayers.map(p => p.date === targetKey ? { ...p, [prayer]: status } : p) : [...prayers, { ...getPrayersForDate(targetKey), [prayer]: status }];
    setPrayers(updated);
    await persist(STORAGE_KEYS.DEEN_PRAYERS, updated);
  };

  const updateSunnahStatus = async (sunnahId: string, status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const updated = prayers.find(p => p.date === targetKey) ? prayers.map(p => p.date === targetKey ? { ...p, sunnahs: p.sunnahs.map(s => s.id === sunnahId ? { ...s, status } : s) } : p) : [...prayers, { ...getPrayersForDate(targetKey), sunnahs: getPrayersForDate(targetKey).sunnahs.map(s => s.id === sunnahId ? { ...s, status } : s) }];
    setPrayers(updated);
    await persist(STORAGE_KEYS.DEEN_PRAYERS, updated);
  };

  const addSunnah = async (title: string, rakats: string | number, time: string, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const newSunnah: SunnahEntry = { id: Date.now().toString(), title, rakats, time, status: 'none' };
    const updated = prayers.find(p => p.date === targetKey) ? prayers.map(p => p.date === targetKey ? { ...p, sunnahs: [...p.sunnahs, newSunnah] } : p) : [...prayers, { ...getPrayersForDate(targetKey), sunnahs: [...getPrayersForDate(targetKey).sunnahs, newSunnah] }];
    setPrayers(updated);
    await persist(STORAGE_KEYS.DEEN_PRAYERS, updated);
  };

  const removeSunnah = async (sunnahId: string, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const updated = prayers.map(p => p.date === targetKey ? { ...p, sunnahs: p.sunnahs.filter(s => s.id !== sunnahId) } : p);
    setPrayers(updated);
    await persist(STORAGE_KEYS.DEEN_PRAYERS, updated);
  };

  const updateAdhkarStatus = async (type: 'morning' | 'evening' | 'night', status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const statusKey = `${type}Status` as keyof AdhkarProgress;
    const updated = adhkar.find(a => a.date === targetKey) ? adhkar.map(a => a.date === targetKey ? { ...a, [statusKey]: status } : a) : [...adhkar, { ...getAdhkarForDate(targetKey), [statusKey]: status }];
    setAdhkar(updated);
    await persist(STORAGE_KEYS.DEEN_ADHKAR, updated);
  };

  const updateAdhkarProgress = async (updates: Partial<AdhkarProgress>, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const updated = adhkar.find(a => a.date === targetKey) ? adhkar.map(a => a.date === targetKey ? { ...a, ...updates } : a) : [...adhkar, { ...getAdhkarForDate(targetKey), ...updates }];
    setAdhkar(updated);
    await persist(STORAGE_KEYS.DEEN_ADHKAR, updated);
  };

  const updateQuranProgress = async (updates: Partial<QuranProgress>) => {
    const updated = { ...quran, ...updates, lastReadDate: new Date().toISOString() };
    setQuran(updated);
    await persist(STORAGE_KEYS.DEEN_QURAN, updated);
  };

  const resetQuranProgress = async () => {
    const updated = { completedRubus: [], lastReadDate: new Date().toISOString(), khatamCount: quran.khatamCount + 1 };
    setQuran(updated);
    await persist(STORAGE_KEYS.DEEN_QURAN, updated);
  };

  const updateSettings = async (updates: Partial<IslamicSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await persist(STORAGE_KEYS.DEEN_SETTINGS, updated);
  };

  return (
    <IslamicContext.Provider value={{ settings, prayers, quran, adhkar, todayPrayers, todayAdhkar, loading, prayerTimes, hijriDate, qiblaDirection, getPrayersForDate, getAdhkarForDate, updatePrayerStatus, updateSunnahStatus, addSunnah, removeSunnah, updateAdhkarStatus, updateAdhkarProgress, updateQuranProgress, updateSettings, resetQuranProgress }}>
      {children}
    </IslamicContext.Provider>
  );
};

export const useIslamic = () => {
  const context = useContext(IslamicContext);
  if (context === undefined) throw new Error('useIslamic must be used within a IslamicProvider');
  return context;
};