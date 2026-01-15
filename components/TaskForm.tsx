import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, Flag, Clock, CheckCircle2, ListTodo, Trash2, ArrowRight, LayoutGrid, CalendarRange, Wand2, Loader2 } from 'lucide-react';
import { Task, Subtask } from '../types';
import { getTodayKey, getWeekKey, getMonthKey } from '../utils/dateUtils';
import { useSettings } from '../context/SettingsContext';
import { ConfirmationModal } from './ConfirmationModal';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../context/ToastContext';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSave: (task: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES = ['Work', 'Personal', 'Health', 'Shopping', 'Learning', 'Finance', 'Home'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSave, onClose, onDelete }) => {
  const { settings } = useSettings();
  const { showToast } = useToast();
  
  // Determine initial timeframe
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>(() => {
    if (initialData?.dueMonth) return 'month';
    if (initialData?.dueWeek) return 'week';
    return 'day';
  });

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium');
  
  const [dueDate, setDueDate] = useState(initialData?.dueDate || getTodayKey());
  const [dueTime, setDueTime] = useState(initialData?.dueTime || '');
  const [dueWeek, setDueWeek] = useState(initialData?.dueWeek || getWeekKey(new Date(), settings.preferences.startOfWeek));
  const [dueMonth, setDueMonth] = useState(initialData?.dueMonth || getMonthKey(new Date()));
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Tags
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState('');

  const handleEnhance = async () => {
    if (!title.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    showToast("Architecting SMART task...", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite this task into a high-performance SMART task: "${title}". Current description: "${description || 'None'}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedSubtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "suggestedSubtasks"]
          },
          systemInstruction: "You are the LifeOS Performance Architect. Convert simple tasks into Specific, Measurable, Achievable, Relevant, and Time-bound objectives. Return JSON format."
        }
      });

      const data = JSON.parse(response.text || '{}');
      setTitle(data.title);
      setDescription(data.description);
      
      const newSubtasks = data.suggestedSubtasks.map((s: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: s,
        completed: false
      }));
      setSubtasks([...subtasks, ...newSubtasks]);

      showToast("Task enhanced", "success");
    } catch (error) {
      console.error("Enhancement Error:", error);
      showToast("Strategic engine busy", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      ...initialData,
      title,
      description,
      category,
      priority,
      tags,
      subtasks,
      // Clear other period fields based on selected timeframe
      dueDate: timeframe === 'day' ? dueDate : undefined,
      dueTime: timeframe === 'day' ? dueTime : undefined,
      dueWeek: timeframe === 'week' ? dueWeek : undefined,
      dueMonth: timeframe === 'month' ? dueMonth : undefined,
    };

    onSave(payload);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (initialData?.id && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: subtaskInput.trim(),
        completed: false
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskInput('');
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
            {initialData?.id ? 'Edit Task' : 'New Task'}
          </h2>
          <div className="flex items-center gap-2">
            {initialData?.id && onDelete && (
              <button 
                type="button"
                onClick={handleDeleteClick}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Timeframe Selection */}
          <div className="space-y-2">
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeframe</label>
             <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                {[
                  { id: 'day', label: 'Specific Day', icon: Calendar },
                  { id: 'week', label: 'Whole Week', icon: LayoutGrid },
                  { id: 'month', label: 'Whole Month', icon: CalendarRange }
                ].map(t => (
                  <button 
                    key={t.id}
                    type="button"
                    onClick={() => setTimeframe(t.id as any)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${timeframe === t.id ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    <t.icon size={14} /> {t.label.split(' ')[1]}
                  </button>
                ))}
             </div>
          </div>

          {/* Title & Desc */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?" 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={handleEnhance}
                  disabled={!title.trim() || isEnhancing}
                  className={`px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${isEnhancing ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 border-primary-100' : 'bg-white dark:bg-gray-700 text-amber-500 border-gray-200 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50'}`}
                  title="SMART Enhance with AI"
                >
                  {isEnhancing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details, notes, or links..." 
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Conditional Date Selection */}
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {timeframe === 'day' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input 
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (Optional)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input 
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {timeframe === 'week' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Week</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date"
                    value={dueWeek}
                    onChange={(e) => setDueWeek(getWeekKey(new Date(e.target.value), settings.preferences.startOfWeek))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Sets objective for the whole week starting {dueWeek}</p>
              </div>
            )}

            {timeframe === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Month</label>
                <div className="relative">
                  <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="month"
                    value={dueMonth}
                    onChange={(e) => setDueMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <div className="flex gap-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value as any)}
                      className={`
                        flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border
                        ${priority === p.value 
                          ? `${p.color} border-transparent ring-2 ring-offset-1 ring-gray-200 dark:ring-gray-700` 
                          : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'}
                      `}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
               <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks</label>
            <div className="space-y-2 mb-3">
              {subtasks.map((st, i) => (
                <div key={st.id} className="flex items-center gap-2 group">
                   <CheckCircle2 size={16} className="text-gray-300" />
                   <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{st.title}</span>
                   <button onClick={() => removeSubtask(st.id)} className="text-gray-400 hover:text-red-500 p-1">
                     <X size={14} />
                   </button>
                </div>
              ))}
            </div>
            <div className="relative flex items-center gap-2">
               <div className="relative flex-1">
                  <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <input 
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={handleSubtaskKeyDown}
                    placeholder="Add subtask..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                  />
               </div>
               <button 
                 type="button" 
                 onClick={addSubtask}
                 disabled={!subtaskInput.trim()}
                 className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
               >
                 <Plus size={20} />
               </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="relative flex items-center gap-2">
               <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
                  />
               </div>
               <button 
                 type="button" 
                 onClick={addTag}
                 disabled={!tagInput.trim()}
                 className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
               >
                 <Plus size={20} />
               </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!title}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            Save Task
          </button>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
};