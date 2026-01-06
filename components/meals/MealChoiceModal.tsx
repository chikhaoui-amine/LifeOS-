
import React from 'react';
import { X, ChefHat, Apple, ArrowRight } from 'lucide-react';

interface MealChoiceModalProps {
  onChoose: (choice: 'recipe' | 'food') => void;
  onClose: () => void;
  mealType: string;
  date: string;
}

export const MealChoiceModal: React.FC<MealChoiceModalProps> = ({ onChoose, onClose, mealType, date }) => {
  const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
           <div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Add {mealType}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formattedDate}</p>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-3">
           <button 
             onClick={() => onChoose('recipe')}
             className="w-full group flex items-center gap-4 p-5 bg-orange-50 dark:bg-orange-900/10 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800 rounded-3xl transition-all text-left"
           >
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                 <ChefHat size={28} />
              </div>
              <div className="flex-1">
                 <h4 className="font-black text-orange-900 dark:text-orange-100 uppercase tracking-tighter leading-tight">From Recipes</h4>
                 <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-bold uppercase tracking-widest">Your cooked meals</p>
              </div>
              <ArrowRight size={18} className="text-orange-300" />
           </button>

           <button 
             onClick={() => onChoose('food')}
             className="w-full group flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-3xl transition-all text-left"
           >
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                 <Apple size={28} />
              </div>
              <div className="flex-1">
                 <h4 className="font-black text-blue-900 dark:text-blue-100 uppercase tracking-tighter leading-tight">From Foods</h4>
                 <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-bold uppercase tracking-widest">Ingredients & snacks</p>
              </div>
              <ArrowRight size={18} className="text-blue-300" />
           </button>
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 text-center">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select your source to continue</p>
        </div>
      </div>
    </div>
  );
};
