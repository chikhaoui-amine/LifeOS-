
import React from 'react';
import { Heart, Trash2, Zap } from 'lucide-react';
import { Food } from '../../types';

interface FoodCardProps {
  food: Food;
  onClick: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  isSelecting?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onClick, onFavorite, onDelete, isSelecting }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-surface rounded-3xl border border-[var(--color-border)] p-3 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 text-xl sm:text-2xl">
            {food.icon || '🍎'}
         </div>
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-md transition-colors ${food.isFavorite ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}
            >
              <Heart size={14} sm-size={16} fill={food.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
            >
              <Trash2 size={14} sm-size={16} />
            </button>
         </div>
      </div>

      <div className="flex-1">
         <h3 className="font-bold text-foreground text-sm sm:text-lg line-clamp-1 leading-tight mb-0.5 sm:mb-1">{food.name}</h3>
         <p className="text-[10px] sm:text-xs text-muted font-medium uppercase tracking-widest">{food.servingSize} • {food.category}</p>
      </div>

      <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
         <div className="flex items-center gap-1 sm:gap-1.5 text-orange-500">
            <Zap size={12} sm-size={14} className="fill-current" />
            <span className="text-xs sm:text-sm font-black tracking-tight">{food.calories} <span className="text-[8px] sm:text-[10px] uppercase opacity-60">kcal</span></span>
         </div>
         <div className="flex gap-1.5 sm:gap-2">
            {food.protein !== undefined && (
               <div className="text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-tighter">P</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-foreground">{food.protein}g</p>
               </div>
            )}
            {food.carbs !== undefined && (
               <div className="text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-tighter">C</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-foreground">{food.carbs}g</p>
               </div>
            )}
            {food.fat !== undefined && (
               <div className="text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-tighter">F</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-foreground">{food.fat}g</p>
               </div>
            )}
         </div>
      </div>

      {isSelecting && (
         <div className="absolute inset-0 bg-primary-500/5 pointer-events-none border-2 border-primary-500 rounded-3xl" />
      )}
    </div>
  );
};
