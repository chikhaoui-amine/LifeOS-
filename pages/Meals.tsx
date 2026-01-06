
import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, ChefHat, ShoppingBasket, Plus, Sparkles, 
  UtensilsCrossed, Apple, Search
} from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { useSettings } from '../context/SettingsContext';
import { getTranslation } from '../utils/translations';
import { PlannerGrid } from '../components/meals/PlannerGrid';
import { RecipeCard } from '../components/meals/RecipeCard';
import { FoodCard } from '../components/meals/FoodCard';
import { ShoppingList } from '../components/meals/ShoppingList';
import { RecipeDetail } from '../components/meals/RecipeDetail';
import { RecipeForm } from '../components/meals/RecipeForm';
import { FoodForm } from '../components/meals/FoodForm';
import { AIChefModal } from '../components/meals/AIChefModal';
import { MealChoiceModal } from '../components/meals/MealChoiceModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Recipe, Food, MealType, LanguageCode } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getTodayKey } from '../utils/dateUtils';

const Meals: React.FC = () => {
  const { 
    recipes, 
    foods,
    loading, 
    toggleFavoriteRecipe, 
    toggleFavoriteFood,
    assignMeal, 
    generateListFromPlan, 
    deleteRecipe, 
    deleteFood,
    addRecipe,
    addFood,
    updateFood,
  } = useMeals();
  
  const { settings } = useSettings();
  const t = useMemo(() => getTranslation((settings?.preferences?.language || 'en') as LanguageCode), [settings?.preferences?.language]);
  
  const [viewMode, setViewMode] = useState<'plan' | 'recipes' | 'foods' | 'shop'>('plan');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [activeDate, setActiveDate] = useState(getTodayKey());
  
  // Modal States
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState<{ date: string, type: MealType } | null>(null);
  const [aiGeneratedData, setAiGeneratedData] = useState<Partial<Recipe> | null>(null);
  const [isSelectingForPlan, setIsSelectingForPlan] = useState<{ date: string, type: MealType } | null>(null);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const filteredRecipes = useMemo(() => 
    recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())), 
  [recipes, searchQuery]);

  const filteredFoods = useMemo(() => 
    foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())), 
  [foods, searchQuery]);

  if (loading) return <LoadingSkeleton count={3} />;

  const handleRecipeClick = (recipe: Recipe) => {
    if (isSelectingForPlan) {
       assignMeal(isSelectingForPlan.date, isSelectingForPlan.type, recipe.id, 'recipe');
       setIsSelectingForPlan(null);
       setViewMode('plan');
    } else {
       setSelectedRecipe(recipe);
    }
  };

  const handleFoodClick = (food: Food) => {
    if (isSelectingForPlan) {
       assignMeal(isSelectingForPlan.date, isSelectingForPlan.type, food.id, 'food');
       setIsSelectingForPlan(null);
       setViewMode('plan');
    } else {
       setEditingFood(food);
       setIsFoodFormOpen(true);
    }
  };

  const handleSaveRecipe = async (data: Omit<Recipe, 'id'>) => {
    await addRecipe(data);
    setIsRecipeFormOpen(false);
    setAiGeneratedData(null);
  };

  const handleSaveFood = async (data: Omit<Food, 'id'>) => {
    if (editingFood) {
      await updateFood(editingFood.id, data);
    } else {
      await addFood(data);
    }
    setIsFoodFormOpen(false);
    setEditingFood(null);
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setConfirmConfig({
      isOpen: true,
      title: t.common.delete,
      message: `Are you sure you want to delete ${recipe.title}?`,
      onConfirm: async () => {
        await deleteRecipe(recipe.id);
        if (selectedRecipe?.id === recipe.id) setSelectedRecipe(null);
      }
    });
  };

  const handleDeleteFood = (food: Food) => {
    setConfirmConfig({
      isOpen: true,
      title: t.common.delete,
      message: `Are you sure you want to delete ${food.name}?`,
      onConfirm: async () => {
        await deleteFood(food.id);
        setIsFoodFormOpen(false);
        setEditingFood(null);
      }
    });
  };

  const handleGenerateList = () => {
     const today = new Date().toISOString().split('T')[0];
     generateListFromPlan(today, 7);
     setViewMode('shop');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Premium Header */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 rotate-3">
              <UtensilsCrossed size={24} sm-size={28} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                {isSelectingForPlan ? `Select ${isSelectingForPlan.type}` : t.meals.title}
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest mt-1">
                {t.meals.subtitle}
              </p>
           </div>
        </div>
        
        {/* Modern Segmented Nav */}
        <div className="flex p-1.5 bg-gray-200/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 relative overflow-x-auto no-scrollbar max-w-full self-start md:self-auto">
           <button 
             onClick={() => { setViewMode('plan'); setIsSelectingForPlan(null); }} 
             className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === 'plan' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
           >
              <CalendarDays size={14} strokeWidth={3} /> {t.meals.plan}
           </button>
           <button 
             onClick={() => setViewMode('recipes')} 
             className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === 'recipes' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
           >
              <ChefHat size={14} strokeWidth={3} /> {t.meals.recipes}
           </button>
           <button 
             onClick={() => setViewMode('foods')} 
             className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === 'foods' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
           >
              <Apple size={14} strokeWidth={3} /> Foods
           </button>
           <button 
             onClick={() => { setViewMode('shop'); setIsSelectingForPlan(null); }} 
             className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === 'shop' ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
           >
              <ShoppingBasket size={14} strokeWidth={3} /> {t.meals.groceries}
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        
        {viewMode === 'plan' && (
           <div className="space-y-6">
              <div className="flex justify-end px-1">
                 <button 
                    onClick={handleGenerateList}
                    className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                 >
                    <ShoppingBasket size={14} /> Sync Plan to Groceries
                 </button>
              </div>

              <PlannerGrid 
                 onAddMeal={(date, type) => { setIsChoiceModalOpen({ date, type }); }} 
                 onRemoveMeal={(date, type) => assignMeal(date, type, null)}
                 onViewRecipe={(id) => { const r = recipes.find(x=>x.id===id); if(r) setSelectedRecipe(r); }}
                 activeDate={activeDate}
                 onDateSelect={setActiveDate}
              />
           </div>
        )}

        {(viewMode === 'recipes' || viewMode === 'foods') && (
           <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 py-2 bg-background/95 backdrop-blur-sm">
                 <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder={`Search ${viewMode === 'recipes' ? 'recipes' : 'foods'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 font-medium transition-all text-foreground"
                    />
                 </div>
                 
                 {/* Action Buttons specific to view */}
                 <div className="flex gap-2 w-full md:w-auto">
                    {/* Only show Add buttons if not selecting for plan, or if selecting, maybe show add too? */}
                    {!isSelectingForPlan && (
                        viewMode === 'recipes' ? (
                            <>
                                <button 
                                onClick={() => setIsAIChefOpen(true)}
                                className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                <Sparkles size={16} /> AI Chef
                                </button>
                                <button 
                                onClick={() => { setAiGeneratedData(null); setIsRecipeFormOpen(true); }}
                                className="flex-1 md:flex-none px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                <Plus size={16} strokeWidth={3} /> Custom
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => { setEditingFood(null); setIsFoodFormOpen(true); }}
                                className="flex-1 md:flex-none px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                <Plus size={16} strokeWidth={3} /> Add Food
                            </button>
                        )
                    )}
                 </div>
              </div>

              {/* Grid Content */}
              {viewMode === 'recipes' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredRecipes.map(recipe => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onClick={() => handleRecipeClick(recipe)}
                        onFavorite={() => toggleFavoriteRecipe(recipe.id)}
                        onDelete={() => handleDeleteRecipe(recipe)}
                      />
                   ))}
                   {filteredRecipes.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-400">
                         <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="font-bold text-lg">No recipes found.</p>
                         <p className="text-sm">Create one or use the AI Chef!</p>
                      </div>
                   )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredFoods.map(food => (
                      <FoodCard 
                        key={food.id} 
                        food={food} 
                        onClick={() => handleFoodClick(food)}
                        onFavorite={() => toggleFavoriteFood(food.id)}
                        onDelete={() => handleDeleteFood(food)}
                      />
                   ))}
                   {filteredFoods.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-400">
                         <Apple size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="font-bold text-lg">No foods found.</p>
                         <p className="text-sm">Add common items to track effortlessly.</p>
                      </div>
                   )}
                </div>
              )}
           </div>
        )}

        {viewMode === 'shop' && (
           <div className="p-0 sm:p-0">
              <ShoppingList />
           </div>
        )}

      </div>

      {selectedRecipe && (
         <RecipeDetail 
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onEdit={() => { setIsRecipeFormOpen(true); }}
            onDelete={() => handleDeleteRecipe(selectedRecipe)}
         />
      )}

      {isRecipeFormOpen && (
         <RecipeForm 
            initialData={selectedRecipe || aiGeneratedData || {}}
            onSave={handleSaveRecipe}
            onClose={() => { setIsRecipeFormOpen(false); setSelectedRecipe(null); setAiGeneratedData(null); }}
         />
      )}

      {isFoodFormOpen && (
         <FoodForm 
            initialData={editingFood || {}}
            onSave={handleSaveFood}
            onClose={() => { setIsFoodFormOpen(false); setEditingFood(null); }}
         />
      )}

      {isAIChefOpen && (
        <AIChefModal 
          onRecipeGenerated={(data) => { setAiGeneratedData(data); setIsAIChefOpen(false); setIsRecipeFormOpen(true); }}
          onClose={() => setIsAIChefOpen(false)}
        />
      )}

      {isChoiceModalOpen && (
        <MealChoiceModal 
          mealType={isChoiceModalOpen.type}
          date={isChoiceModalOpen.date}
          onChoose={(choice) => {
             setIsSelectingForPlan(isChoiceModalOpen);
             setViewMode(choice === 'recipe' ? 'recipes' : 'foods');
             setIsChoiceModalOpen(null);
          }}
          onClose={() => setIsChoiceModalOpen(null)}
        />
      )}

      <ConfirmationModal 
         isOpen={confirmConfig.isOpen}
         onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
         onConfirm={confirmConfig.onConfirm}
         title={confirmConfig.title}
         message={confirmConfig.message}
         type="danger"
         confirmText={t.common.delete}
      />
    </div>
  );
};

export default Meals;
