
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Bot, ShieldAlert, Sparkles, MessageCircle, Lightbulb, Loader2, ChevronRight } from 'lucide-react';
import { AIService } from '../services/AIService';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useGoals } from '../context/GoalContext';
import { useJournal } from '../context/JournalContext';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import { useSleep } from '../context/SleepContext';
import { useDigitalWellness } from '../context/DigitalWellnessContext';
import { getTodayKey, formatDateKey } from '../utils/dateUtils';
import { storage } from '../utils/storage';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  isError?: boolean;
  type?: 'text' | 'action' | 'memory'; 
}

interface StrategistMemory {
  bestWorkingHours: string[];
  commonExcuses: string[];
  failurePoints: string[];
  disciplineThreshold: string;
  stressSignals: string[];
  recoverySpeed: string;
  significantWins: string[];
  lastAnalysisLesson: string;
  feedbackPreference: string;
  motivationalDrivers: string[];
}

const MEMORY_STORAGE_KEY = 'lifeos_strategist_memory_v1';
const INITIAL_MEMORY: StrategistMemory = {
  bestWorkingHours: [],
  commonExcuses: [],
  failurePoints: [],
  disciplineThreshold: 'Unknown',
  stressSignals: [],
  recoverySpeed: 'Normal',
  significantWins: [],
  lastAnalysisLesson: 'Initial session pending.',
  feedbackPreference: 'Gentle but honest',
  motivationalDrivers: []
};

const SUGGESTED_PROMPTS = [
  { label: "Focus Session", text: "I'm distracted. Start a 30-min strict focus session and add 'Deep Work' to my tasks." },
  { label: "Energy Audit", text: "Look at my sleep and mood from this week. Why am I feeling tired?" },
  { label: "Goal Sync", text: "Remind me why I'm working on my biggest goal and suggest one small step for today." },
  { label: "Reset Day", text: "My morning was chaotic. Help me rebuild my schedule for the rest of the day." }
];

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hey! I'm your LifeOS Coach. How can I help you today?", type: 'text' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [memory, setMemory] = useState<StrategistMemory>(INITIAL_MEMORY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { tasks, addTask } = useTasks();
  const { habits } = useHabits();
  const { entries: journal } = useJournal();
  const { transactions } = useFinance();
  const { logs: sleepLogs } = useSleep();
  const { enableStrictMode, settings: dwSettings } = useDigitalWellness();

  useEffect(() => {
    const loadMemory = async () => {
      const stored = await storage.load<StrategistMemory>(MEMORY_STORAGE_KEY);
      if (stored) setMemory(stored);
    };
    loadMemory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const getContextSnapshot = useCallback((days: number = 1) => {
    const today = new Date();
    const result: any = {
      meta: { time: new Date().toLocaleString(), todayKey: getTodayKey(), daysAnalyzed: days },
      longTermMemory: memory,
      days: []
    };

    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = formatDateKey(d);
        result.days.push({
            date: key,
            tasks: tasks?.filter(t => t.dueDate === key).map(t => ({ title: t.title, priority: t.priority, done: t.completed })) || [],
            habits: habits?.filter(h => h.frequency.days.includes(d.getDay()) || h.completedDates.includes(key)).map(h => ({ name: h.name, done: h.completedDates.includes(key) })) || [],
            sleep: sleepLogs?.find(l => l.date === key),
            journal: journal?.find(j => j.date.startsWith(key))?.mood || 'none',
            spending: transactions?.filter(t => t.date === key && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0,
        });
    }
    return JSON.stringify(result);
  }, [tasks, habits, sleepLogs, journal, transactions, memory]);

  const handleSend = async (forcedInput?: string) => {
    const userMsg = forcedInput || input;
    if (!userMsg.trim()) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const contextData = getContextSnapshot(1);
      const systemPrompt = `IDENTITY: You are LifeOS Coach — a strategist. STYLE: Warm. USER DATA: ${contextData}`;

      const response = await AIService.generateResponse({
        model: 'gemini-3-pro-preview',
        contents: [
          ...messages.slice(-6).map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: { 
          systemInstruction: systemPrompt 
        }
      });

      if (response.text?.trim()) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }

    } catch (e: any) {
      console.error("AI Error:", e);
      setMessages(prev => [...prev, { role: 'model', text: "AI Service temporarily unavailable. Check your connection or deployment.", isError: true }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none p-4 md:p-6 flex flex-col items-center">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-full max-w-lg h-12 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl flex items-center justify-between px-5 group transition-all hover:scale-[1.02] active:scale-95 animate-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-lg">
              <MessageCircle size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-gray-500">Need strategic advice?</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Open Coach</span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#09090b] rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-[0_30px_100px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-500 h-[450px]">
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white"><Bot size={18} /></div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-[10px] tracking-[0.2em] uppercase">LifeOS Coach</h3>
                <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /><span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Secure Gateway</span></div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 text-xs sm:text-sm leading-relaxed backdrop-blur-md border shadow-sm rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none border-transparent' : 'bg-white dark:bg-[#121214] text-gray-900 dark:text-gray-100 rounded-tl-none border-gray-100 dark:border-white/5'}`}>
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 px-1 animate-pulse">
                 <Sparkles size={10} className="text-primary-500" />
                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/10 shrink-0">
             <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
                {SUGGESTED_PROMPTS.map((p, i) => (
                   <button key={i} onClick={() => handleSend(p.text)} className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-bold text-gray-500 whitespace-nowrap flex items-center gap-1 shrink-0"><Lightbulb size={10} /> {p.label}</button>
                ))}
             </div>
             <div className="relative flex items-center bg-white dark:bg-black/60 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Chat with your coach..." className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 outline-none" />
                <button onClick={() => handleSend()} disabled={!input.trim() || isThinking} className="mr-2 p-2 bg-primary-600 text-white rounded-xl disabled:opacity-30"><ChevronRight size={18} /></button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
