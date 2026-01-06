
import React, { useState } from 'react';
import { X, Apple, Check, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Food } from '../../types';

interface FoodFormProps {
  initialData?: Partial<Food>;
  onSave: (food: Omit<Food, 'id'>) => void;
  onClose: () => void;
}

const CATEGORIES = ['Produce', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Pantry', 'Protein', 'Other'];

const FOOD_ICONS = [
  // Fruits & Veggies
  '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🫘', '🍄', '🥜', '🌰',
  // Prepared Foods & Meats
  '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🦪', '🥡',
  // Sweets & Treats
  '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯',
  // Drinks
  '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊',
  // Misc
  '🥢', '🍽️', '🍴', '🥣', '🥡', '🍳'
];

export const FoodForm: React.FC<FoodFormProps> = ({ initialData, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || '🍎');
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '0');
  const [protein, setProtein] = useState(initialData?.protein?.toString() || '0');
  const [carbs, setCarbs] = useState(initialData?.carbs?.toString() || '0');
  const [fat, setFat] = useState(initialData?.fat?.toString() || '0');
  const [servingSize, setServingSize] = useState(initialData?.servingSize || '1 portion');
  const [category, setCategory] = useState(initialData?.category || 'Snacks');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      servingSize: servingSize || '1 portion',
      category,
      isFavorite: initialData?.isFavorite || false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              {initialData?.name ? 'Edit Food Item' : 'New Food Item'}
           </h3>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Icon</label>
                 <div className="flex flex-col gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-3xl border-2 border-transparent hover:border-blue-500/50 transition-all shadow-inner"
                    >
                       {icon}
                    </button>
                    {showIconPicker && (
                       <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-64 custom-scrollbar">
                          {FOOD_ICONS.map((i, index) => (
                             <button
                               key={`${i}-${index}`}
                               type="button"
                               onClick={() => { setIcon(i); setShowIconPicker(false); }}
                               className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all ${icon === i ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'}`}
                             >
                                {i}
                             </button>
                          ))}
                       </div>
                    )}
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Food Name</label>
                 <input 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   placeholder="e.g. Greek Yogurt"
                   className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-none text-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                   autoFocus
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Calories (kcal)</label>
                    <div className="relative">
                       <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                       <input 
                         type="number"
                         value={calories}
                         onChange={e => setCalories(e.target.value)}
                         className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-900 dark:text-white font-bold outline-none"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Serving Size</label>
                    <div className="relative">
                       <Info size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         value={servingSize}
                         onChange={e => setServingSize(e.target.value)}
                         placeholder="1 cup"
                         className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-900 dark:text-white font-bold outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Protein</label>
                    <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-900 dark:text-white font-bold text-center outline-none" />
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Carbs</label>
                    <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-900 dark:text-white font-bold text-center outline-none" />
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Fat</label>
                    <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-gray-900 dark:text-white font-bold text-center outline-none" />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Category</label>
                 <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                       <button
                         key={cat}
                         type="button"
                         onClick={() => setCategory(cat)}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${category === cat ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           <button 
             type="submit" 
             disabled={!name}
             className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0"
           >
              <Check size={18} strokeWidth={3} /> {initialData?.name ? 'Update Food' : 'Save Food'}
           </button>
        </form>

      </div>
    </div>
  );
};
