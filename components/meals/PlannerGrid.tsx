
import React from 'react';
import { Plus, Coffee, Sun, Moon, Cookie, X, Utensils, Apple } from 'lucide-react';
import { useMeals } from '../../context/MealContext';
import { MealType } from '../../types';
import { getTodayKey } from '../../utils/dateUtils';

interface PlannerGridProps {
  onAddMeal: (date: string, type: MealType) => void;
  onRemoveMeal: (date: string, type: MealType) => void;
  onViewRecipe: (recipeId: string) => void;
  activeDate: string;
  onDateSelect: (date: string) => void;
}

export const PlannerGrid: React.FC<PlannerGridProps> = ({ 
  onAddMeal, 
  onRemoveMeal, 
  onViewRecipe,
  activeDate,
  onDateSelect
}) => {
  const { mealPlans, recipes, foods } = useMeals();
  const today = getTodayKey();
  
  // Generate Next 7 Days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    return {
      date: d,
      dateKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: dateKey === today,
      isActive: dateKey === activeDate
    };
  });

  const getPlannedItem = (prefixedId?: string) => {
    if (!prefixedId) return null;
    const [type, id] = prefixedId.split(':');
    if (type === 'recipe') return { item: recipes.find(r => r.id === id), type: 'recipe' };
    if (type === 'food') return { item: foods.find(f => f.id === id), type: 'food' };
    // Legacy support
    return { item: recipes.find(r => r.id === prefixedId), type: 'recipe' };
  };

  const MealSlot = ({ date, type, icon: Icon, color, bg }: { date: string, type: MealType, icon: any, color: string, bg: string }) => {
    const plan = mealPlans.find(p => p.date === date);
    const result = getPlannedItem(plan?.[type]);
    const item = result?.item;
    const itemType = result?.type;

    return (
      <div className="flex-1 min-h-[90px] sm:min-h-[120px] p-1 sm:p-3 relative flex flex-col group/slot">
         {/* Slot Header */}
         <div className={`flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 sm:mb-2 opacity-60 ${color} group-hover/slot:opacity-100 transition-opacity`}>
            <Icon size={10} sm-size={12} strokeWidth={3} /> {type}
         </div>
         
         {item ? (
           <div 
             onClick={() => itemType === 'recipe' && onViewRecipe(item.id)}
             className={`group/card relative flex-1 bg-surface rounded-xl sm:rounded-[1.25rem] border border-[var(--color-border)] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden flex flex-col ${itemType === 'food' ? 'cursor-default' : ''}`}
           >
              {/* Visual Container */}
              <div className={`h-16 sm:h-20 w-full relative shrink-0 flex items-center justify-center overflow-hidden ${!((item as any).image) ? bg : ''}`}>
                 {(item as any).image ? (
                   <img src={(item as any).image} className="w-full h-full object-cover" alt={(item as any).title || (item as any).name} />
                 ) : (item as any).icon ? (
                   <span className="text-3xl sm:text-4xl drop-shadow-sm">{(item as any).icon}</span>
                 ) : (
                   <Icon size={24} sm-size={28} className="text-gray-300 dark:text-gray-600" />
                 )}
                 
                 {/* Image Overlay */}
                 {(item as any).image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                 )}
              </div>
              
              <div className="p-2 sm:p-3 flex-1 flex flex-col justify-center">
                 <p className="text-[10px] sm:text-[11px] font-black text-foreground line-clamp-2 uppercase tracking-tighter leading-tight">{(item as any).title || (item as any).name}</p>
                 {itemType === 'food' && (
                    <span className="text-[8px] font-black text-gray-400 mt-0.5 sm:mt-1">{(item as any).calories} KCAL</span>
                 )}
              </div>

              {/* Remove Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveMeal(date, type); }}
                className="absolute top-1 right-1 p-1 sm:p-1.5 bg-black/40 hover:bg-red-500 text-white rounded-lg sm:rounded-xl opacity-0 group-hover/card:opacity-100 transition-all backdrop-blur-md z-10"
                title="Remove meal"
              >
                 <X size={10} sm-size={12} strokeWidth={3} />
              </button>
           </div>
         ) : (
           <button 
             onClick={() => onAddMeal(date, type)}
             className="flex-1 w-full rounded-xl sm:rounded-[1.25rem] border-2 border-dashed border-[var(--color-border)] hover:border-primary-500 dark:hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center justify-center text-muted hover:text-primary-600 transition-all gap-1 group/btn"
           >
              <Plus size={16} sm-size={20} strokeWidth={2.5} className="group-hover/btn:scale-125 transition-transform" />
           </button>
         )}
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
       {/* Header Row */}
       <div className="hidden sm:flex border-b border-[var(--color-border)] bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-24 shrink-0 p-5 border-r border-[var(--color-border)] flex items-center justify-center">
             <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Schedule</span>
          </div>
          <div className="flex-1 grid grid-cols-4">
             <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] border-r border-[var(--color-border)] last:border-0"><Coffee size={12} /> Breakfast</div>
             <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] border-r border-[var(--color-border)] last:border-0"><Sun size={12} /> Lunch</div>
             <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] border-r border-[var(--color-border)] last:border-0"><Moon size={12} /> Dinner</div>
             <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-muted uppercase tracking-[0.2em] last:border-0"><Cookie size={12} /> Snack</div>
          </div>
       </div>

       {/* Days Rows */}
       <div className="divide-y divide-[var(--color-border)]">
          {days.map((day, i) => (
             <div key={day.dateKey} className={`flex flex-col sm:flex-row ${day.isActive ? 'ring-2 ring-primary-500 z-10' : day.isToday ? 'bg-primary-50/20 dark:bg-primary-950/10' : (i % 2 === 0 ? 'bg-surface' : 'bg-gray-50/30 dark:bg-gray-900/10')}`}>
                {/* Date Column */}
                <button 
                  onClick={() => onDateSelect(day.dateKey)}
                  className={`w-full sm:w-24 shrink-0 border-r-0 sm:border-r border-[var(--color-border)] flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-2 text-center relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${day.isActive ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                >
                   {(day.isActive || day.isToday) && <div className="absolute top-0 left-0 w-1 sm:w-full sm:h-1 bg-primary-500" />}
                   
                   <span className={`text-[10px] font-black uppercase tracking-widest sm:mb-1 ${day.isActive ? 'text-primary-600' : 'text-gray-400'}`}>{day.dayName}</span>
                   <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black ${day.isActive ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 rotate-3' : day.isToday ? 'bg-primary-500 text-white shadow-lg' : 'text-foreground bg-gray-100 dark:bg-gray-700'}`}>
                      {day.dayNum}
                   </div>
                   {day.isActive && <span className="sm:hidden text-[10px] font-black text-primary-500 uppercase tracking-widest">Active</span>}
                </button>
                
                {/* Meal Slots */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--color-border)]">
                   <MealSlot date={day.dateKey} type="breakfast" icon={Coffee} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/10" />
                   <MealSlot date={day.dateKey} type="lunch" icon={Sun} color="text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-900/10" />
                   <MealSlot date={day.dateKey} type="dinner" icon={Moon} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-900/10" />
                   <MealSlot date={day.dateKey} type="snack" icon={Cookie} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/10" />
                </div>
             </div>
          ))}
       </div>

       {/* Grid Footer Summary */}
       <div className="p-4 sm:p-6 bg-gray-50/80 dark:bg-gray-900/80 border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                <Utensils size={16} sm-size={20} />
             </div>
             <div>
                <p className="text-xs font-bold text-foreground">Culinary Roadmap</p>
                <p className="text-[9px] sm:text-[10px] text-muted font-medium uppercase tracking-widest">Select a day to track hydration</p>
             </div>
          </div>
       </div>
    </div>
  );
};
