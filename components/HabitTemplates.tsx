
import React from 'react';
import { X, Sparkles, Droplets, Zap, BookOpen, Moon, Sun, DollarSign, Dumbbell, Brain, Coffee, Heart, Smartphone, Timer, Smile, Wind, Apple, Utensils, Book, Plus } from 'lucide-react';
import { Habit } from '../types';

interface HabitTemplatesProps {
  onSelect: (template: Partial<Habit>) => void;
  onClose: () => void;
}

const HABIT_TEMPLATES = [
  {
    category: 'Health & Wellness',
    templates: [
      { name: 'Drink 2L Water', icon: '💧', color: 'blue', category: 'Health', goal: 8, unit: 'glasses', description: 'Stay hydrated for energy and focus.' },
      { name: 'No Sugar Day', icon: '🍎', color: 'red', category: 'Health', goal: 1, unit: 'day', description: 'Avoid processed sugars today.' },
      { name: 'Take Vitamins', icon: '💊', color: 'cyan', category: 'Health', goal: 1, unit: 'times', description: 'Support your immune system.' },
      { name: 'Cold Shower', icon: '🚿', color: 'blue', category: 'Health', goal: 1, unit: 'times', description: 'Boost circulation and alertness.' },
      { name: 'Intermittent Fast', icon: '⏱️', color: 'purple', category: 'Health', goal: 16, unit: 'hours', description: 'Time-restricted eating.' },
    ]
  },
  {
    category: 'Fitness & Motion',
    templates: [
      { name: 'Morning Run', icon: '🏃', color: 'orange', category: 'Fitness', goal: 20, unit: 'mins', timeOfDay: 'morning', description: 'Cardio boost to start the day.' },
      { name: '10,000 Steps', icon: '🚶', color: 'green', category: 'Fitness', goal: 10000, unit: 'steps', description: 'Stay active throughout the day.' },
      { name: 'Yoga Flow', icon: '🧘', color: 'purple', category: 'Fitness', goal: 15, unit: 'mins', description: 'Flexibility and mindfulness.' },
      { name: 'Plank Hold', icon: '🧱', color: 'amber', category: 'Fitness', goal: 2, unit: 'mins', description: 'Build core strength.' },
      { name: 'Gym Session', icon: '🏋️', color: 'red', category: 'Fitness', goal: 45, unit: 'mins', description: 'Strength training.' },
    ]
  },
  {
    category: 'Mind & Soul',
    templates: [
      { name: 'Deep Breath', icon: '🌬️', color: 'indigo', category: 'Mindfulness', goal: 5, unit: 'mins', description: 'Short breathing exercise.' },
      { name: 'Daily Journal', icon: '📓', color: 'amber', category: 'Mindfulness', goal: 1, unit: 'entry', timeOfDay: 'evening', description: 'Reflect on wins and hurdles.' },
      { name: 'Gratitude List', icon: '🙏', color: 'pink', category: 'Mindfulness', goal: 3, unit: 'items', description: 'Appreciate the small things.' },
      { name: 'Digital Detox', icon: '📵', color: 'gray', category: 'Mindfulness', goal: 1, unit: 'hour', description: 'No screens before sleep.' },
      { name: 'Nature Walk', icon: '🌲', color: 'green', category: 'Mindfulness', goal: 20, unit: 'mins', description: 'Reconnect with outdoors.' },
    ]
  },
  {
    category: 'Intellectual Growth',
    templates: [
      { name: 'Read 10 Pages', icon: '📚', color: 'blue', category: 'Learning', goal: 10, unit: 'pages', description: 'Slow and steady knowledge.' },
      { name: 'Learn Language', icon: '🗣️', color: 'violet', category: 'Learning', goal: 15, unit: 'mins', description: 'Consistent daily practice.' },
      { name: 'Write Code', icon: '💻', color: 'gray', category: 'Learning', goal: 1, unit: 'hour', description: 'Build your dream project.' },
      { name: 'Skillshare', icon: '🎨', color: 'indigo', category: 'Learning', goal: 30, unit: 'mins', description: 'Watch a masterclass.' },
      { name: 'Listen Podcast', icon: '🎧', color: 'pink', category: 'Learning', goal: 20, unit: 'mins', description: 'Learn while commuting.' },
    ]
  },
  {
    category: 'Productivity & Habits',
    templates: [
      { name: 'Deep Work', icon: '🧠', color: 'indigo', category: 'Productivity', goal: 90, unit: 'mins', description: 'Uninterrupted focus.' },
      { name: 'Inbox Zero', icon: '📧', color: 'blue', category: 'Productivity', goal: 1, unit: 'times', description: 'Manage your communications.' },
      { name: 'Plan Tomorrow', icon: '🗓️', color: 'amber', category: 'Productivity', goal: 1, unit: 'times', timeOfDay: 'evening', description: 'Prep for success.' },
      { name: 'Clean Desk', icon: '🧹', color: 'slate', category: 'Productivity', goal: 1, unit: 'times', description: 'Clear space, clear mind.' },
      { name: 'Early Wakeup', icon: '⏰', color: 'orange', category: 'Productivity', goal: 1, unit: 'times', timeOfDay: 'morning', description: 'Win the morning.' },
    ]
  }
];

export const HabitTemplates: React.FC<HabitTemplatesProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-5xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <div className="bg-primary-50 dark:bg-primary-900/30 p-1.5 rounded-lg">
                  <Sparkles className="text-primary-600 dark:text-primary-400" size={18} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Discover Habits</h2>
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Choose a blueprint to fast-track your personal growth.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto p-8 pt-4 space-y-10 custom-scrollbar">
           {HABIT_TEMPLATES.map((section, idx) => (
             <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                   <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                   <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{section.category}</h3>
                   <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                   {section.templates.map((t, i) => (
                     <button 
                       key={i}
                       onClick={() => onSelect(t as Partial<Habit>)}
                       className="group relative flex flex-col items-start p-3.5 text-left bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                     >
                        <div className="flex items-center gap-3 w-full mb-2.5">
                           <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                              {t.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate leading-tight">{t.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="text-[9px] font-black uppercase text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-1.5 rounded">
                                    {t.goal} {t.unit.slice(0, 5)}
                                 </span>
                                 {t.timeOfDay && (
                                   <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 rounded">
                                      {t.timeOfDay}
                                   </span>
                                 )}
                              </div>
                           </div>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                           {t.description}
                        </p>
                        
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                           <Plus size={14} className="text-primary-500" />
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
           <p className="text-xs text-gray-400 font-medium italic">"Small habits, big results."</p>
           <div className="flex gap-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                 {HABIT_TEMPLATES.reduce((acc, s) => acc + s.templates.length, 0)} Blueprints
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};
