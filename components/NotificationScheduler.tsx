import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useHabits } from '../context/HabitContext';
import { useTasks } from '../context/TaskContext';
import { NotificationService } from '../services/NotificationService';
import { getTodayKey } from '../utils/dateUtils';

/**
 * This component acts as a "Background Service" for the web app.
 * It checks every minute if any notifications need to be fired.
 */
export const NotificationScheduler: React.FC = () => {
  const { settings } = useSettings();
  const { habits } = useHabits();
  const { tasks } = useTasks();
  
  // Track the last minute checked to prevent double firing in the same minute
  const lastCheckedMinute = useRef<string>('');

  useEffect(() => {
    // Request permission on mount if enabled
    if (settings.notifications.enabled) {
      NotificationService.requestPermission();
    }
  }, [settings.notifications.enabled]);

  useEffect(() => {
    if (!settings.notifications.enabled) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const dayIndex = now.getDay();
      const todayKey = getTodayKey();

      // Prevent multiple checks in the same minute
      if (lastCheckedMinute.current === currentTime) return;
      lastCheckedMinute.current = currentTime;

      console.log('Checking notifications for:', currentTime);

      // --- 1. Daily Summary (Morning) ---
      if (settings.notifications.dailySummary && currentTime === settings.notifications.morningTime) {
        const todaysHabits = habits.filter(h => !h.archived && h.frequency.days.includes(dayIndex));
        const todaysTasks = tasks.filter(t => t.dueDate === todayKey && !t.completed);
        
        NotificationService.send(
          '🌞 Good Morning!', 
          `You have ${todaysHabits.length} habits and ${todaysTasks.length} tasks scheduled for today. Let's crush it!`, 
          'summary'
        );
      }

      // --- 2. Daily Summary (Evening / Streak Check) ---
      if (settings.notifications.dailySummary && currentTime === settings.notifications.eveningTime) {
        const pendingHabits = habits.filter(h => 
          !h.archived && 
          h.frequency.days.includes(dayIndex) && 
          !h.completedDates.includes(todayKey)
        );

        if (pendingHabits.length > 0) {
          // Streak Alert Logic
          const atRiskHabit = pendingHabits.find(h => h.completedDates.length > 0); // Find one with some history
          
          if (atRiskHabit) {
             // Simple logic: if it has history, assume a streak is active for motivation
             NotificationService.sendStreakAlert(atRiskHabit.name, atRiskHabit.completedDates.length); // Simplified streak calc
          } else {
             NotificationService.send(
              '🌙 Evening Reminder', 
              `You still have ${pendingHabits.length} habits to complete today. Keep your momentum going!`, 
              'summary'
             );
          }
        }
      }

      // --- 3. Habit Reminders ---
      if (settings.notifications.habits) {
        habits.forEach(habit => {
          if (
            !habit.archived && 
            habit.frequency.days.includes(dayIndex) && 
            !habit.completedDates.includes(todayKey)
          ) {
            if (habit.reminders.includes(currentTime)) {
              NotificationService.send(
                `${habit.icon} Time for ${habit.name}`, 
                habit.description || 'Stay consistent!', 
                'habit'
              );
            }
          }
        });
      }

      // --- 4. Task Reminders ---
      if (settings.notifications.tasks) {
        tasks.forEach(task => {
          if (!task.completed && task.dueDate === todayKey && task.dueTime === currentTime) {
            const priorityIcon = task.priority === 'high' ? '🔴' : '🔵';
            NotificationService.send(
              `${priorityIcon} Task Due: ${task.title}`, 
              'This task is due now.', 
              'task'
            );
          }
        });
      }
    };

    // Run check every 30 seconds to ensure we hit the minute
    const intervalId = setInterval(checkNotifications, 30000);
    
    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, [habits, tasks, settings]);

  return null; // This component renders nothing
};