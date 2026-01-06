
// Improved Utilities for Islamic Calculations (Tabular Calendar Algorithm)

export const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", 
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Ad-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duhaa", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
  "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// --- HIJRI ENGINE (Tabular) ---

const ISLAMIC_EPOCH = 1948439.5;

// Julian day from Gregorian
const g2jd = (year: number, month: number, day: number) => {
  if (month <= 2) { year -= 1; month += 12; }
  let a = Math.floor(year / 100);
  let b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
};

// Julian day to Gregorian
const jd2g = (jd: number) => {
  jd += 0.5;
  let z = Math.floor(jd);
  let f = jd - z;
  let a = z;
  if (z >= 2299161) {
    let alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);
  let day = b - d - Math.floor(30.6001 * e) + f;
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;
  return new Date(year, month - 1, Math.floor(day));
};

// Julian day from Hijri
export const h2jd = (year: number, month: number, day: number) => {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((11 * year + 3) / 30) + ISLAMIC_EPOCH - 1;
};

// Julian day to Hijri
const jd2h = (jd: number) => {
  jd = Math.floor(jd) + 0.5;
  let year = Math.floor(((jd - ISLAMIC_EPOCH) * 30 + 10646) / 10631);
  let month = Math.min(12, Math.floor(((jd - (h2jd(year, 1, 1))) / 29.5) + 1));
  let day = (jd - h2jd(year, month, 1)) + 1;
  return { day: Math.floor(day), month, year };
};

export const getHijriDate = (date: Date, adjustment = 0) => {
  const jd = g2jd(date.getFullYear(), date.getMonth() + 1, date.getDate()) + adjustment;
  const h = jd2h(jd);
  return {
    ...h,
    monthName: HIJRI_MONTHS[h.month - 1]
  };
};

export const getHijriKey = (date: Date, adjustment = 0): string => {
  const h = getHijriDate(date, adjustment);
  return `H-${h.year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
};

export const hijriToGregorian = (hYear: number, hMonth: number, hDay: number, adjustment = 0) => {
  const jd = h2jd(hYear, hMonth, hDay) - adjustment;
  return jd2g(jd);
};

export const getDaysInHijriMonth = (m: number, y: number) => {
  // Simple rule: odd months are 30, even are 29, 12th is 30 on leap years
  if (m === 12) {
    const isLeap = ((11 * y + 14) % 30) < 11;
    return isLeap ? 30 : 29;
  }
  return m % 2 === 0 ? 29 : 30;
};

export const getDaysUntilHijriEvent = (hMonth: number, hDay: number, currentHijri: { day: number, month: number, year: number }, adjustment = 0) => {
  let targetYear = currentHijri.year;
  if (currentHijri.month > hMonth || (currentHijri.month === hMonth && currentHijri.day > hDay)) {
    targetYear++;
  }
  
  const currentJD = g2jd(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const targetJD = h2jd(targetYear, hMonth, hDay) - adjustment;
  
  return Math.max(0, Math.round(targetJD - currentJD));
};

export interface IslamicHoliday {
  name: string;
  type: 'eid' | 'holy' | 'event';
}

export const getIslamicHoliday = (hDay: number, hMonth: number): IslamicHoliday | null => {
  if (hMonth === 1 && hDay === 1) return { name: "Islamic New Year", type: 'event' };
  if (hMonth === 1 && hDay === 10) return { name: "Ashura", type: 'event' };
  if (hMonth === 3 && hDay === 12) return { name: "Mawlid", type: 'event' };
  if (hMonth === 7 && hDay === 27) return { name: "Isra & Mi'raj", type: 'event' };
  if (hMonth === 8 && hDay === 15) return { name: "Mid-Sha'ban", type: 'event' };
  
  // Ramadan (Month 9)
  if (hMonth === 9) {
    if (hDay === 1) return { name: "1st Ramadan", type: 'holy' };
    if (hDay >= 21 && hDay % 2 !== 0) return { name: "Laylat al-Qadr", type: 'holy' }; // Potential
    return { name: "Ramadan", type: 'holy' };
  }

  if (hMonth === 10 && hDay === 1) return { name: "Eid al-Fitr", type: 'eid' };
  if (hMonth === 10 && hDay === 2) return { name: "Eid al-Fitr (Day 2)", type: 'eid' };
  if (hMonth === 10 && hDay === 3) return { name: "Eid al-Fitr (Day 3)", type: 'eid' };

  if (hMonth === 12 && hDay === 9) return { name: "Arafah", type: 'holy' };
  if (hMonth === 12 && hDay === 10) return { name: "Eid al-Adha", type: 'eid' };
  if (hMonth === 12 && (hDay >= 11 && hDay <= 13)) return { name: "Tashreeq", type: 'event' };

  return null;
};

// --- QIBLA DIRECTION ---

export const getQiblaDirection = (lat: number, lng: number) => {
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  const y = Math.sin(KAABA_LNG * Math.PI / 180 - lng * Math.PI / 180);
  const x = Math.cos(lat * Math.PI / 180) * Math.tan(KAABA_LAT * Math.PI / 180) - 
            Math.sin(lat * Math.PI / 180) * Math.cos(KAABA_LNG * Math.PI / 180 - lng * Math.PI / 180);
  let qibla = Math.atan2(y, x) * 180 / Math.PI;
  return (qibla + 360) % 360;
};

// --- PRAYER TIMES ---

const d2r = (d: number) => d * Math.PI / 180;
const r2d = (r: number) => r * 180 / Math.PI;

const calculateTime = (deg: number, lat: number, dec: number, isAfternoon = false) => {
  const cosH = (Math.sin(d2r(deg)) - Math.sin(d2r(lat)) * Math.sin(d2r(dec))) / (Math.cos(d2r(lat)) * Math.cos(d2r(dec)));
  if (cosH > 1 || cosH < -1) return null; 
  const H = r2d(Math.acos(cosH)) / 15;
  return isAfternoon ? H : -H;
};

export const getPrayerTimes = (date: Date, lat: number, lng: number, timezone = new Date().getTimezoneOffset() / -60) => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const declination = 23.45 * Math.sin(d2r(360 / 365 * (dayOfYear - 81)));
  const equationOfTime = 9.87 * Math.sin(d2r(2 * 360 / 365 * (dayOfYear - 81))) - 7.53 * Math.cos(d2r(360 / 365 * (dayOfYear - 81))) - 1.5 * Math.sin(d2r(360 / 365 * (dayOfYear - 81)));

  const noon = 12 + timezone - lng / 15 - equationOfTime / 60;
  
  const fajrOffset = calculateTime(-18, lat, declination);
  const sunriseOffset = calculateTime(-0.833, lat, declination);
  const asrAngle = -r2d(Math.atan(1 / (1 + Math.tan(d2r(Math.abs(lat - declination)))))); 
  const asrOffset = calculateTime(asrAngle, lat, declination, true);
  const sunsetOffset = calculateTime(-0.833, lat, declination, true);
  const ishaOffset = calculateTime(-18, lat, declination, true);

  const format = (t: number | null) => {
    if (t === null) return '--:--';
    let val = noon + t;
    if (val < 0) val += 24;
    if (val >= 24) val -= 24;
    const h = Math.floor(val);
    const m = Math.floor((val - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return {
    Fajr: format(fajrOffset),
    Sunrise: format(sunriseOffset),
    Dhuhr: format(0), 
    Asr: format(asrOffset),
    Maghrib: format(sunsetOffset),
    Isha: format(ishaOffset)
  };
};
