
import React from 'react';
import { Clock, Users, Heart, ChefHat, Trash2, Gauge } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, onFavorite, onDelete, compact = false }) => {
  const difficultyColor = {
     easy: 'text-green-600 bg-green-50 dark:bg-green-900/20',
     medium: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
     hard: 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }[recipe.difficulty] || 'text-gray-600 bg-gray-50';

  return (
    <div 
      onClick={onClick}
      className="group bg-surface rounded-3xl sm:rounded-[2rem] border border-[var(--color-border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full relative"
    >
      <div className={`relative ${compact ? 'h-32' : 'h-40 sm:h-52'} overflow-hidden`}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-300 text-5xl sm:text-6xl">
            {recipe.icon || <ChefHat size={40} />}
          </div>
        )}
        
        {/* Top Actions */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 z-10">
           <button 
             onClick={(e) => { e.stopPropagation(); onFavorite(); }}
             className={`p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-colors ${recipe.isFavorite ? 'bg-red-500 text-white' : 'bg-black/20 hover:bg-black/40 text-white'}`}
             title="Favorite"
           >
             <Heart size={16} sm-size={18} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
           </button>
        </div>

        {/* Delete Action */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-red-500 text-white backdrop-blur-md transition-colors"
             title="Delete Recipe"
           >
             <Trash2 size={16} sm-size={18} />
           </button>
        </div>

        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1.5 z-10">
           {recipe.tags.slice(0, 2).map(tag => (
             <span key={tag} className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-black/50 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
               {tag}
             </span>
           ))}
        </div>
      </div>

      <div className="p-3 sm:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
           <h3 className="font-bold text-foreground text-sm sm:text-lg line-clamp-1 leading-tight flex-1 pr-2">{recipe.title}</h3>
           <div className={`shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${difficultyColor}`}>
              <Gauge size={10} strokeWidth={3} /> {recipe.difficulty}
           </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted line-clamp-2 mb-3 sm:mb-6 flex-1 italic leading-snug">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted mt-auto pt-3 sm:pt-4 border-t border-[var(--color-border)]">
           <div className="flex items-center gap-1.5 group-hover:text-orange-500 transition-colors">
             <Clock size={12} sm-size={14} strokeWidth={2.5} />
             <span>{recipe.prepTime + recipe.cookTime} min</span>
           </div>
           {!compact && (
             <div className="flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
               <Users size={12} sm-size={14} strokeWidth={2.5} />
               <span>{recipe.servings} Serves</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
