
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTodayKey } from '../utils/dateUtils';

interface SystemDateContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isToday: boolean;
  selectedDateObject: Date;
}

const SystemDateContext = createContext<SystemDateContextType | undefined>(undefined);

export const SystemDateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  
  const isToday = selectedDate === getTodayKey();
  const selectedDateObject = new Date(selectedDate + 'T12:00:00'); 

  return (
    <SystemDateContext.Provider value={{ selectedDate, setSelectedDate, isToday, selectedDateObject }}>
      {children}
    </SystemDateContext.Provider>
  );
};

export const useSystemDate = () => {
  const context = useContext(SystemDateContext);
  if (context === undefined) throw new Error('useSystemDate must be used within a SystemDateProvider');
  return context;
};
