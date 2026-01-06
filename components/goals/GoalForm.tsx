
import React, { useState } from 'react';
import { X, Calendar, Target, Flag, Layers, Hash, ListChecks, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Goal, GoalTimeFrame, GoalType } from '../../types';
import { useHabits } from '../../context/HabitContext';
import { useGoals } from '../../context/GoalContext';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSave: (goal: any) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Career & Business', 'Financial & Wealth', 'Health & Fitness', 
  'Relationships & Family', 'Personal Development', 'Education & Learning', 
  'Spiritual & Faith', 'Adventure & Travel', 'Creativity & Hobbies', 'Contribution & Legacy'
];

const COLORS = [
  { name: 'Indigo', value: 'indigo' },
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Amber', value: 'amber' },
  { name: 'Red', value: 'red' },
  { name: 'Purple', value: 'purple' },
  { name: 'Pink', value: 'pink' },
];

export const GoalForm: React.FC<GoalFormProps> = ({ initialData, onSave, onClose }) => {
  const [step, setStep] = useState(1);
  const { habits } = useHabits();
  const { deleteGoal } = useGoals();

  // Basic Info
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [color, setColor] = useState(initialData?.color || 'indigo');
  
  // Timing
  const [timeFrame, setTimeFrame] = useState<GoalTimeFrame>(initialData?.timeFrame || 'quarterly');
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');

  // Targets
  const [type, setType] = useState<GoalType>(initialData?.type || 'numeric');
  const [targetValue, setTargetValue] = useState(initialData?.targetValue?.toString() || '100');
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() || '0');
  const [unit, setUnit] = useState(initialData?.unit || '');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>(initialData?.priority || 'medium');

  // Extras
  const [motivation, setMotivation] = useState(initialData?.motivation || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialData?.linkedHabitIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      ...initialData,
      title: title.trim(),
      description,
      category,
      color,
      timeFrame,
      startDate,
      targetDate: targetDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      type,
      targetValue: parseFloat(targetValue) || 1,
      currentValue: parseFloat(currentValue) || 0,
      unit,
      priority,
      status: initialData?.status || 'not-started',
      motivation,
      coverImage,
      linkedHabitIds,
      milestones: initialData?.milestones || [],
      tags: [],
    });
  };

  const handleDelete = () => {
    if (initialData?.id && window.confirm('Delete this goal permanently?')) {
      deleteGoal(initialData.id);
      onClose();
    }
  };

  const toggleHabit = (id: string) => {
    setLinkedHabitIds(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData?.id ? 'Edit Goal' : 'Set New Goal'}
            </h2>
            <div className="flex gap-1 mt-1">
               <span className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
               <span className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
               <span className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {initialData?.id && (
               <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Delete Goal">
                 <Trash2 size={20} />
               </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Save $10,000 for Down Payment" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  autoFocus
                />
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                 <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                 >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Details about your goal..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full transition-all bg-${c.value}-500 ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time Frame</label>
                    <select 
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value as GoalTimeFrame)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly (90 Day)</option>
                        <option value="short-term">Short Term (6m)</option>
                        <option value="mid-term">Mid Term (1y)</option>
                        <option value="long-term">Long Term (1y+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                    <input 
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Goal Type</label>
                  <div className="grid grid-cols-3 gap-2">
                     <button type="button" onClick={() => setType('numeric')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${type === 'numeric' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'}`}>
                        <Hash size={18} className="mx-auto mb-1" />
                        Numeric
                     </button>
                     <button type="button" onClick={() => setType('milestone')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${type === 'milestone' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'}`}>
                        <ListChecks size={18} className="mx-auto mb-1" />
                        Milestones
                     </button>
                     <button type="button" onClick={() => setType('habit')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${type === 'habit' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'}`}>
                        <Layers size={18} className="mx-auto mb-1" />
                        Habit Based
                     </button>
                  </div>
               </div>

               {type === 'numeric' && (
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Start</label>
                       <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Target</label>
                       <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                       <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="$ or kg" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none" />
                    </div>
                 </div>
               )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Motivation (Your "Why")</label>
                 <textarea 
                   value={motivation}
                   onChange={(e) => setMotivation(e.target.value)}
                   rows={3}
                   placeholder="Why is this goal important to you?"
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none resize-none"
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cover Image URL (Optional)</label>
                 <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                    />
                 </div>
               </div>

               {habits.length > 0 && (
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Habits</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                       {habits.map(h => (
                         <button
                           key={h.id}
                           type="button"
                           onClick={() => toggleHabit(h.id)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${linkedHabitIds.includes(h.id) ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}
                         >
                           {h.icon} {h.name}
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 bg-white dark:bg-gray-800 rounded-b-2xl">
          {step > 1 ? (
             <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Back</button>
          ) : (
             <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          )}
          
          {step < 3 ? (
             <button type="button" onClick={() => setStep(step + 1)} disabled={!title} className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all">Next</button>
          ) : (
             <button type="button" onClick={handleSubmit} className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all">{initialData?.id ? 'Update Goal' : 'Create Goal'}</button>
          )}
        </div>
      </div>
    </div>
  );
};
