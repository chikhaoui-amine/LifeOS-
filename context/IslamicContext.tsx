import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailyPrayers, QuranProgress, IslamicSettings, AdhkarProgress, DeenStatus, SunnahEntry } from '../types';
import { storage } from '../utils/storage';
import { getPrayerTimes, getHijriDate, getQiblaDirection, getHijriKey } from '../utils/islamicUtils';

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

const ISLAMIC_STORAGE_KEY = 'lifeos_islamic_data_v2'; 
const ISLAMIC_SETTINGS_KEY = 'lifeos_islamic_settings_v1';
const QURAN_STORAGE_KEY = 'lifeos_quran_v2'; 
const ADHKAR_STORAGE_KEY = 'lifeos_adhkar_v1';

const DEFAULT_SETTINGS: IslamicSettings = {
  calculationMethod: 'ISNA',
  asrMethod: 'Standard',
  hijriAdjustment: 0,
  location: { lat: 21.4225, lng: 39.8262 } 
};

const DEFAULT_QURAN: QuranProgress = {
  completedRubus: [], 
  lastReadDate: new Date().toISOString(),
  khatamCount: 0
};

// Removed Dhuhr, Asr, Maghrib, Isha Sunnahs as requested
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

  useEffect(() => {
    const load = async () => {
      const storedPrayers = await storage.load<DailyPrayers[]>(ISLAMIC_STORAGE_KEY) || [];
      const storedQuran = await storage.load<QuranProgress>(QURAN_STORAGE_KEY) || DEFAULT_QURAN;
      const storedAdhkar = await storage.load<AdhkarProgress[]>(ADHKAR_STORAGE_KEY) || [];
      const storedSettings = await storage.load<IslamicSettings>(ISLAMIC_SETTINGS_KEY);
      
      setPrayers(storedPrayers);
      setQuran(storedQuran);
      setAdhkar(storedAdhkar);
      if (storedSettings) setSettings(storedSettings);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { if (!loading) storage.save(ISLAMIC_STORAGE_KEY, prayers); }, [prayers, loading]);
  useEffect(() => { if (!loading) storage.save(QURAN_STORAGE_KEY, quran); }, [quran, loading]);
  useEffect(() => { if (!loading) storage.save(ADHKAR_STORAGE_KEY, adhkar); }, [adhkar, loading]);
  useEffect(() => { if (!loading) storage.save(ISLAMIC_SETTINGS_KEY, settings); }, [settings, loading]);

  useEffect(() => {
    const today = new Date();
    const times = getPrayerTimes(today, settings.location.lat, settings.location.lng);
    setPrayerTimes(times);
    const hijri = getHijriDate(today, settings.hijriAdjustment);
    setHijriDate(hijri);
    setCurrentHijriKey(getHijriKey(today, settings.hijriAdjustment));
    setQiblaDirection(getQiblaDirection(settings.location.lat, settings.location.lng));
  }, [settings.location, settings.hijriAdjustment]);

  const getPrayersForDate = (dateKey: string): DailyPrayers => {
    const found = prayers.find(p => p.date === dateKey);
    if (found) return found;
    return {
      date: dateKey,
      fajr: 'none', dhuhr: 'none', asr: 'none', maghrib: 'none', isha: 'none',
      sunnahs: DEFAULT_SUNNAHS.map(s => ({ ...s, status: 'none' }))
    };
  };

  const getAdhkarForDate = (dateKey: string): AdhkarProgress => {
    const found = adhkar.find(a => a.date === dateKey);
    if (found) return found;
    return {
      date: dateKey,
      morningStatus: 'none', eveningStatus: 'none', nightStatus: 'none',
      morningCount: 0, eveningCount: 0, nightCount: 0
    };
  };

  const todayPrayers = getPrayersForDate(currentHijriKey);
  const todayAdhkar = getAdhkarForDate(currentHijriKey);

  const updatePrayerStatus = (prayer: keyof Omit<DailyPrayers, 'date' | 'sunnahs'>, status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    setPrayers(prev => {
      const existing = prev.find(p => p.date === targetKey);
      if (existing) {
        return prev.map(p => p.date === targetKey ? { ...p, [prayer]: status } : p);
      } else {
        const defaults = getPrayersForDate(targetKey);
        return [...prev, { ...defaults, [prayer]: status }];
      }
    });
  };

  const updateSunnahStatus = (sunnahId: string, status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    setPrayers(prev => {
      const existing = prev.find(p => p.date === targetKey);
      if (existing) {
        return prev.map(p => p.date === targetKey ? { 
          ...p, 
          sunnahs: p.sunnahs.map(s => s.id === sunnahId ? { ...s, status } : s) 
        } : p);
      } else {
        const defaults = getPrayersForDate(targetKey);
        return [...prev, { 
          ...defaults, 
          sunnahs: defaults.sunnahs.map(s => s.id === sunnahId ? { ...s, status } : s) 
        }];
      }
    });
  };

  const addSunnah = (title: string, rakats: string | number, time: string, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const newSunnah: SunnahEntry = { id: Date.now().toString(), title, rakats, time, status: 'none' };
    setPrayers(prev => {
      const existing = prev.find(p => p.date === targetKey);
      if (existing) {
        return prev.map(p => p.date === targetKey ? { ...p, sunnahs: [...p.sunnahs, newSunnah] } : p);
      } else {
        const defaults = getPrayersForDate(targetKey);
        return [...prev, { ...defaults, sunnahs: [...defaults.sunnahs, newSunnah] }];
      }
    });
  };

  const removeSunnah = (sunnahId: string, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    setPrayers(prev => prev.map(p => p.date === targetKey ? { ...p, sunnahs: p.sunnahs.filter(s => s.id !== sunnahId) } : p));
  };

  const updateAdhkarStatus = (type: 'morning' | 'evening' | 'night', status: DeenStatus, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    const key = `${type}Status` as keyof AdhkarProgress;
    setAdhkar(prev => {
      const existing = prev.find(a => a.date === targetKey);
      if (existing) {
        return prev.map(a => a.date === targetKey ? { ...a, [key]: status } : a);
      } else {
        const defaults = getAdhkarForDate(targetKey);
        return [...prev, { ...defaults, [key]: status }];
      }
    });
  };

  const updateAdhkarProgress = (updates: Partial<AdhkarProgress>, dateKey?: string) => {
    const targetKey = dateKey || currentHijriKey;
    setAdhkar(prev => {
      const existing = prev.find(a => a.date === targetKey);
      if (existing) return prev.map(a => a.date === targetKey ? { ...a, ...updates } : a);
      const defaults = getAdhkarForDate(targetKey);
      return [...prev, { ...defaults, ...updates }];
    });
  };

  const updateQuranProgress = (updates: Partial<QuranProgress>) => {
    setQuran(prev => ({ ...prev, ...updates, lastReadDate: new Date().toISOString() }));
  };

  const resetQuranProgress = () => {
    setQuran({ completedRubus: [], lastReadDate: new Date().toISOString(), khatamCount: quran.khatamCount + 1 });
  };

  const updateSettings = (updates: Partial<IslamicSettings>) => setSettings(prev => ({ ...prev, ...updates }));

  return (
    <IslamicContext.Provider value={{
      settings, prayers, quran, adhkar, todayPrayers, todayAdhkar, loading, prayerTimes, hijriDate, qiblaDirection,
      getPrayersForDate, getAdhkarForDate, updatePrayerStatus, updateSunnahStatus, addSunnah, removeSunnah,
      updateAdhkarStatus, updateAdhkarProgress, updateQuranProgress, updateSettings, resetQuranProgress
    }}>
      {children}
    </IslamicContext.Provider>
  );
};

export const useIslamic = () => {
  const context = useContext(IslamicContext);
  if (context === undefined) throw new Error('useIslamic must be used within a IslamicProvider');
  return context;
};