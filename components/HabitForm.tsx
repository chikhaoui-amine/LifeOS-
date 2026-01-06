
import React, { useState } from 'react';
import { X, Calendar, Tag, Sun, Moon, Sunrise, Clock, ChevronDown, ChevronUp, Plus, ArrowLeft, Check, Hash, CheckSquare, Repeat, Zap } from 'lucide-react';
import { Habit, FrequencyType, HabitType } from '../types';
import { useHabits } from '../context/HabitContext';

interface HabitFormProps {
  initialData?: Partial<Habit>;
  onSave: (habit: any) => void;
  onClose: () => void;
}

const ICON_GROUPS = {
  'Popular': ['🧘', '💧', '🏃', '📚', '💤', '💊', '🥗', '💻', '🗓️', '🧹', '🚶', '💰'],
  'Fitness': ['🏋️', '🏃', '🚴', '🏊', '🧘', '🤸', '🥊', '⚽', '🏀', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '⛳', '🧗', '🏄', '🛹'],
  'Nutrition': ['🍎', '🥦', '🥗', '🍗', '🍳', '🥛', '☕', '🥤', '🍵', '🍺', '🍷', '🥡', '🍇', '🍉', '🍊', '🍌', '🍍', '🥕', '🌽', '🍫'],
  'Productivity': ['💻', '📝', '📅', '📊', '📞', '📧', '⏰', '⏱️', '🎯', '⚡', '🔋', '🚀', '💡', '🔍', '📌', '📎', '📁', '🖨️', '📱', '📡'],
  'Mindfulness': ['🧘', '🌬️', '📿', '🕯️', '📓', '🛀', '🧠', '🔇', '🌿', '🌅', '🌙', '⭐', '🔥', '🌊', '☁️', '🙏', '🤲', '🛐', '🕊️', '😌'],
  'Finance': ['💰', '💳', '💵', '💸', '🏦', '📉', '📈', '🧾', '🛍️', '💎', '🐷', '🪙', '💴', '💶', '💷', '🏧', '💲', '🏷️', '💼', '📊'],
  'Home & Chores': ['🏠', '🧹', '🧺', '🛏️', '🛋️', '🪴', '🔨', '🔧', '🚿', '🧼', '🧽', '🚽', '🚪', '🔑', '📦', '🛒', '🍴', '🔪', '🗑️', '🌡️'],
  'Learning': ['📚', '🎓', '📖', '🔬', '🔭', '💡', '🧠', '🌎', '🗣️', '✍️', '🧩', '🎨', '🎼', '🎻', '🎹', '🎺', '🖍️', '🎒', '🏫', '📝'],
  'Social': ['👨‍👩‍👧‍👦', '👯', '🤝', '🗣️', '💌', '📱', '🥂', '🎁', '🎈', '🫂', '💞', '💍', '👶', '👴', '👵', '🐶', '🐱', '🐾', '🎮', '🎲'],
  'Travel & Outdoors': ['✈️', '🚗', '🚂', '🚲', '🛴', '🗺️', '🏝️', '⛺', '🎣', '🌲', '🍂', '⛰️', '🌋', '🏖️', '🏜️', '🚜', '⚓', '🚦', '⛽', '🏰'],
  'Medical': ['💊', '💉', '🩹', '🩺', '🦷', '🦴', '🩸', '🦠', '🧼', '🏥', '🚑', '🧴', '🧻', '🌡️', '🧬', '🚭', '🚰', '🥗', '🍎', '😴']
};

const COLORS = [
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Sky', value: 'sky', class: 'bg-sky-500' },
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Lime', value: 'lime', class: 'bg-lime-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Fuchsia', value: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
];

export const HabitForm: React.FC<HabitFormProps> = ({ initialData, onSave, onClose }) => {
  const { categories, addCategory } = useHabits();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || ICON_GROUPS['Popular'][0]);
  const [color, setColor] = useState(initialData?.color || 'indigo');
  
  const [category, setCategory] = useState(initialData?.category || categories[0] || 'Health');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const [habitType, setHabitType] = useState<HabitType>(initialData?.type || 'boolean');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initialData?.frequency?.type || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.frequency?.days || [0, 1, 2, 3, 4, 5, 6]);
  const [timeOfDay, setTimeOfDay] = useState<'morning'|'afternoon'|'evening'|'anytime'>(initialData?.timeOfDay || 'anytime');
  const [goal, setGoal] = useState(initialData?.goal || 1);
  const [unit, setUnit] = useState(initialData?.unit || (habitType === 'counter' ? 'items' : 'times'));
  
  const [showAllIcons, setShowAllIcons] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    let finalCategory = category.trim() || 'General';
    if (isCustomCategory && finalCategory) addCategory(finalCategory);

    onSave({
      ...initialData,
      name,
      description,
      icon,
      color,
      category: finalCategory,
      goal: Number(goal),
      unit,
      timeOfDay,
      type: habitType,
      frequency: {
        type: frequencyType,
        days: frequencyType === 'once' ? [new Date().getDay()] : selectedDays
      },
      reminders: initialData?.reminders || [],
    });
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) setSelectedDays(prev => prev.filter(d => d !== dayIndex));
    } else {
      setSelectedDays(prev => [...prev, dayIndex].sort());
    }
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
            {initialData?.id ? 'Adjust Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Goal Type & Frequency - New Feature Selection */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Behavior Type</label>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                   <button 
                     type="button"
                     onClick={() => setHabitType('boolean')}
                     className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${habitType === 'boolean' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                   >
                      <CheckSquare size={12} /> Binary
                   </button>
                   <button 
                     type="button"
                     onClick={() => { setHabitType('counter'); setGoal(goal === 1 ? 5 : goal); }}
                     className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${habitType === 'counter' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                   >
                      <Hash size={12} /> Counter
                   </button>
                </div>
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Persistence</label>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                   <button 
                     type="button"
                     onClick={() => setFrequencyType('daily')}
                     className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${frequencyType !== 'once' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                   >
                      <Repeat size={12} /> Recurring
                   </button>
                   <button 
                     type="button"
                     onClick={() => setFrequencyType('once')}
                     className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${frequencyType === 'once' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                   >
                      <Zap size={12} /> One-time
                   </button>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Habit Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meditate for 10m" 
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none transition-all font-bold"
                autoFocus
              />
            </div>
            
            {habitType === 'counter' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Goal</label>
                    <input type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-bold" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unit</label>
                    <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="glasses, mins..." className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-bold" />
                 </div>
              </div>
            )}
          </div>

          {/* Icon & Color */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon</label>
                 <button onClick={() => setShowAllIcons(!showAllIcons)} className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                   {showAllIcons ? 'Show Less' : 'Full Library'}
                 </button>
              </div>
              <div className={`grid grid-cols-6 gap-2 ${showAllIcons ? 'max-h-48 overflow-y-auto pr-1' : ''}`}>
                 {(showAllIcons ? Object.values(ICON_GROUPS).flat() : ICON_GROUPS['Popular']).map(e => (
                    <button key={e} type="button" onClick={() => setIcon(e)} className={`h-11 rounded-xl flex items-center justify-center text-2xl transition-all ${icon === e ? 'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100'}`}>{e}</button>
                 ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Color</label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setColor(c.value)} className={`w-8 h-8 rounded-full transition-all ${c.class} ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-700 scale-110 shadow-lg' : 'opacity-60'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Timing & Frequency */}
          <div className="space-y-5">
             {frequencyType !== 'once' && (
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <Calendar size={14} /> <span>Recurring Days</span>
                   </div>
                   <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                      {weekDays.map((d, i) => (
                        <button key={i} type="button" onClick={() => toggleDay(i)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${selectedDays.includes(i) ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-md ring-1 ring-gray-100 dark:ring-gray-600' : 'text-gray-400 hover:bg-gray-100'}`}>{d}</button>
                      ))}
                   </div>
                </div>
             )}

             <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Anchor Time</label>
                <div className="grid grid-cols-4 gap-2">
                   {[
                     { id: 'morning', icon: Sunrise, label: 'Morning' },
                     { id: 'afternoon', icon: Sun, label: 'Afternoon' },
                     { id: 'evening', icon: Moon, label: 'Evening' },
                     { id: 'anytime', icon: Clock, label: 'Anytime' }
                   ].map(t => (
                      <button key={t.id} type="button" onClick={() => setTimeOfDay(t.id as any)} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${timeOfDay === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-100 dark:border-gray-700 text-gray-400'}`}>
                         <t.icon size={18} />
                         <span className="text-[9px] font-black uppercase tracking-tight">{t.label}</span>
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
              <button type="button" onClick={() => setShowAllCategories(!showAllCategories)} className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{showAllCategories ? 'Less' : 'All'}</button>
            </div>
            {!isCustomCategory ? (
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === cat ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}>{cat}</button>
                ))}
                <button onClick={() => { setCategory(''); setIsCustomCategory(true); }} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-300 text-gray-400 flex items-center gap-1"><Plus size={12} /> New</button>
              </div>
            ) : (
              <div className="flex gap-2 items-center animate-in slide-in-from-right-2">
                 <button type="button" onClick={() => setIsCustomCategory(false)} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400"><ArrowLeft size={18} /></button>
                 <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category Name" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary-500/20" />
                 <button type="button" onClick={() => setIsCustomCategory(false)} className="p-3 bg-primary-600 text-white rounded-xl"><Check size={18} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 bg-white dark:bg-gray-800 rounded-b-[2.5rem]">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!name} className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 disabled:opacity-50 transition-all">Save Habit</button>
        </div>
      </div>
    </div>
  );
};
