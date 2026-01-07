
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HabitProvider } from './context/HabitContext';
import { TaskProvider } from './context/TaskContext';
import { GoalProvider } from './context/GoalContext';
import { JournalProvider } from './context/JournalContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { IslamicProvider } from './context/IslamicContext';
import { MealProvider } from './context/MealContext';
import { SleepProvider } from './context/SleepContext';
import { TimeBlockProvider } from './context/TimeBlockContext';
import { VisionBoardProvider } from './context/VisionBoardContext';
import { ReportProvider } from './context/ReportContext';
import { SyncProvider } from './context/SyncContext';
import { SystemDateProvider } from './context/SystemDateContext';
import { DigitalWellnessProvider } from './context/DigitalWellnessContext';
import { NotificationScheduler } from './components/NotificationScheduler';
import { ReportScheduler } from './components/ReportScheduler';
import { ErrorBoundary } from './components/ErrorBoundary';
import Today from './pages/Today';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Journal from './pages/Journal';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Islamic from './pages/Deen';
import Meals from './pages/Meals';
import Sleep from './pages/Sleep';
import VisionBoard from './pages/VisionBoard';
import Reports from './pages/Reports';
import DigitalWellness from './pages/DigitalWellness';
import { ThemeCustomizer } from './pages/ThemeCustomizer';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <SystemDateProvider>
              <HabitProvider>
                <TaskProvider>
                  <GoalProvider>
                    <JournalProvider>
                      <FinanceProvider>
                        <IslamicProvider>
                          <MealProvider>
                            <SleepProvider>
                              <TimeBlockProvider>
                                <VisionBoardProvider>
                                  <DigitalWellnessProvider>
                                    <ReportProvider>
                                      <SyncProvider>
                                        <NotificationScheduler />
                                        <ReportScheduler />
                                        
                                        <HashRouter>
                                          <Routes>
                                            <Route path="/" element={<Layout />}>
                                              <Route index element={<Today />} />
                                              <Route path="vision" element={<VisionBoard />} />
                                              <Route path="habits" element={<Habits />} />
                                              <Route path="tasks" element={<Tasks />} />
                                              <Route path="goals" element={<Goals />} />
                                              <Route path="journal" element={<Journal />} />
                                              <Route path="finance" element={<Finance />} />
                                              <Route path="deen" element={<Islamic />} />
                                              <Route path="meals" element={<Meals />} />
                                              <Route path="sleep" element={<Sleep />} />
                                              <Route path="wellness" element={<DigitalWellness />} />
                                              <Route path="calendar" element={<Calendar />} />
                                              <Route path="statistics" element={<Statistics />} />
                                              <Route path="reports" element={<Reports />} />
                                              <Route path="settings" element={<Settings />} />
                                              <Route path="settings/theme-creator" element={<ThemeCustomizer />} />
                                              <Route path="*" element={<Navigate to="/" replace />} />
                                            </Route>
                                          </Routes>
                                        </HashRouter>
                                      </SyncProvider>
                                    </ReportProvider>
                                  </DigitalWellnessProvider>
                                </VisionBoardProvider>
                              </TimeBlockProvider>
                            </SleepProvider>
                          </MealProvider>
                        </IslamicProvider>
                      </FinanceProvider>
                    </JournalProvider>
                  </GoalProvider>
                </TaskProvider>
              </HabitProvider>
            </SystemDateProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
