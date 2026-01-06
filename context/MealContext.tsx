
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recipe, Food, MealPlanDay, ShoppingListItem, MealType } from '../types';
import { storage } from '../utils/storage';
import { getTodayKey } from '../utils/dateUtils';

interface MealContextType {
  recipes: Recipe[];
  foods: Food[];
  mealPlans: MealPlanDay[];
  shoppingList: ShoppingListItem[];
  loading: boolean;
  
  // Recipe Actions
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<string>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavoriteRecipe: (id: string) => Promise<void>;

  // Food Actions
  addFood: (food: Omit<Food, 'id'>) => Promise<string>;
  updateFood: (id: string, updates: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  toggleFavoriteFood: (id: string) => Promise<void>;
  
  // Plan Actions
  assignMeal: (date: string, type: MealType, id: string | null, itemType?: 'recipe' | 'food') => Promise<void>;
  getMealPlanForDate: (date: string) => MealPlanDay;
  trackWater: (date: string, amount: number) => Promise<void>;
  
  // Shopping List Actions
  addToShoppingList: (items: ShoppingListItem[]) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  clearAllShoppingItems: () => Promise<void>;
  generateListFromPlan: (startDate: string, days: number) => Promise<void>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const RECIPES_KEY = 'lifeos_recipes_v1';
const FOODS_KEY = 'lifeos_foods_v1';
const PLANS_KEY = 'lifeos_meal_plans_v1';
const SHOPPING_KEY = 'lifeos_shopping_list_v1';

export const MealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanDay[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const storedRecipes = await storage.load<Recipe[]>(RECIPES_KEY);
      const storedFoods = await storage.load<Food[]>(FOODS_KEY);
      const storedPlans = await storage.load<MealPlanDay[]>(PLANS_KEY);
      const storedShopping = await storage.load<ShoppingListItem[]>(SHOPPING_KEY);

      setRecipes(storedRecipes || []);
      setFoods(storedFoods || []);
      setMealPlans(storedPlans || []);
      setShoppingList(storedShopping || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Persist Data
  useEffect(() => { if(!loading) storage.save(RECIPES_KEY, recipes); }, [recipes, loading]);
  useEffect(() => { if(!loading) storage.save(FOODS_KEY, foods); }, [foods, loading]);
  useEffect(() => { if(!loading) storage.save(PLANS_KEY, mealPlans); }, [mealPlans, loading]);
  useEffect(() => { if(!loading) storage.save(SHOPPING_KEY, shoppingList); }, [shoppingList, loading]);

  // --- Recipe Actions ---
  const addRecipe = async (data: Omit<Recipe, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newRecipe = { ...data, id };
    setRecipes(prev => [...prev, newRecipe]);
    return id;
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const toggleFavoriteRecipe = async (id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  // --- Food Actions ---
  const addFood = async (data: Omit<Food, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newFood = { ...data, id };
    setFoods(prev => [...prev, newFood]);
    return id;
  };

  const updateFood = async (id: string, updates: Partial<Food>) => {
    setFoods(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFood = async (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const toggleFavoriteFood = async (id: string) => {
    setFoods(prev => prev.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  // --- Plan Actions ---
  const assignMeal = async (date: string, type: MealType, id: string | null, itemType: 'recipe' | 'food' = 'recipe') => {
    const prefixedId = id ? `${itemType}:${id}` : null;
    setMealPlans(prev => {
      const existing = prev.find(p => p.date === date);
      if (existing) {
        return prev.map(p => p.date === date ? { ...p, [type]: prefixedId === null ? undefined : prefixedId } : p);
      } else {
        const newDay: MealPlanDay = { date, waterIntake: 0 };
        if (prefixedId) newDay[type] = prefixedId;
        return [...prev, newDay];
      }
    });
  };

  const getMealPlanForDate = (date: string) => {
    return mealPlans.find(p => p.date === date) || { date, waterIntake: 0 };
  };

  const trackWater = async (date: string, amount: number) => {
    setMealPlans(prev => {
      const existing = prev.find(p => p.date === date);
      if (existing) {
        return prev.map(p => p.date === date ? { ...p, waterIntake: Math.max(0, p.waterIntake + amount) } : p);
      }
      return [...prev, { date, waterIntake: Math.max(0, amount) }];
    });
  };

  // --- Shopping List Actions ---
  const addToShoppingList = async (items: ShoppingListItem[]) => {
    setShoppingList(prev => [...prev, ...items]);
  };

  const toggleShoppingItem = async (id: string) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const deleteShoppingItem = async (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const clearCheckedItems = async () => {
    setShoppingList(prev => prev.filter(i => !i.checked));
  };

  const clearAllShoppingItems = async () => {
    setShoppingList([]);
  };

  const generateListFromPlan = async (startDate: string, days: number) => {
    const start = new Date(startDate);
    const dateKeys: string[] = [];
    for(let i=0; i<days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dateKeys.push(d.toISOString().split('T')[0]);
    }

    const plans = mealPlans.filter(p => dateKeys.includes(p.date));
    const newItems: ShoppingListItem[] = [];

    plans.forEach(plan => {
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach(type => {
            const prefixedId = plan[type as MealType];
            if(prefixedId) {
                const [itemType, id] = prefixedId.split(':');
                if (itemType === 'recipe') {
                    const recipe = recipes.find(r => r.id === id);
                    if(recipe) {
                        recipe.ingredients.forEach(ing => {
                            newItems.push({
                                ...ing,
                                id: Date.now() + Math.random().toString(),
                                recipeId: recipe.id,
                                checked: false
                            });
                        });
                    }
                } else if (itemType === 'food') {
                    const food = foods.find(f => f.id === id);
                    if (food) {
                        newItems.push({
                            id: Date.now() + Math.random().toString(),
                            name: food.name,
                            amount: 1,
                            unit: food.servingSize,
                            category: food.category || 'Other',
                            checked: false,
                            isCustom: true
                        });
                    }
                }
            }
        });
    });

    setShoppingList(prev => [...prev, ...newItems]);
  };

  return (
    <MealContext.Provider value={{
      recipes, foods, mealPlans, shoppingList, loading,
      addRecipe, updateRecipe, deleteRecipe, toggleFavoriteRecipe,
      addFood, updateFood, deleteFood, toggleFavoriteFood,
      assignMeal, getMealPlanForDate, trackWater,
      addToShoppingList, toggleShoppingItem, deleteShoppingItem, clearCheckedItems, clearAllShoppingItems, generateListFromPlan
    }}>
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (context === undefined) throw new Error('useMeals must be used within a MealProvider');
  return context;
};
