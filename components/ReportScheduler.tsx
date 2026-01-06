
import React, { useEffect, useRef } from 'react';
import { useReports } from '../context/ReportContext';
import { getTodayKey } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

export const ReportScheduler: React.FC = () => {
  const { reports, generateReport } = useReports();
  const { showToast } = useToast();
  const checkedRef = useRef<string>('');

  useEffect(() => {
    const checkSchedule = async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Only check between 9 PM and 11:59 PM
      if (hour < 21) return;

      const todayKey = getTodayKey();
      
      // Prevent multiple checks in same session/hour if already done
      const checkKey = `${todayKey}-${hour}`;
      if (checkedRef.current === checkKey) return;
      checkedRef.current = checkKey;

      // 1. Daily Report Check
      const hasDaily = reports.some(r => r.period === 'daily' && r.dateRange === todayKey);
      if (!hasDaily) {
         console.log("Generating Auto Daily Report...");
         await generateReport('daily');
         showToast("Daily Report Ready", "success");
      }

      // 2. Weekly Report Check (Saturday)
      if (now.getDay() === 6) { // 6 = Saturday
         // Check if we have a weekly report created TODAY
         const hasWeekly = reports.some(r => r.period === 'weekly' && r.createdAt.startsWith(todayKey));
         if (!hasWeekly) {
            console.log("Generating Auto Weekly Report...");
            await generateReport('weekly');
            showToast("Weekly Report Ready", "success");
         }
      }

      // 3. Monthly Report Check (Last day of month)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (tomorrow.getDate() === 1) { // If tomorrow is 1st, today is last day
         const hasMonthly = reports.some(r => r.period === 'monthly' && r.createdAt.startsWith(todayKey));
         if (!hasMonthly) {
            console.log("Generating Auto Monthly Report...");
            await generateReport('monthly');
            showToast("Monthly Report Ready", "success");
         }
      }
    };

    const interval = setInterval(checkSchedule, 60000 * 30); // Check every 30 mins
    
    // Initial check after mount (delay slightly to ensure contexts loaded)
    const timeout = setTimeout(checkSchedule, 5000);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, [reports, generateReport, showToast]);

  return null;
};
