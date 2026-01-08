import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Recipe, Food, MealPlanDay, ShoppingListItem, MealType } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SYNC_RELOAD_EVENT } from '../services/BackupService';

interface MealContextType {
  recipes: Recipe[];
  foods: Food[];
  mealPlans: MealPlanDay[];
  shoppingList: ShoppingListItem[];
  loading: boolean;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<string>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavoriteRecipe: (id: string) => Promise<void>;
  addFood: (food: Omit<Food, 'id'>) => Promise<string>;
  updateFood: (id: string, updates: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  toggleFavoriteFood: (id: string) => Promise<void>;
  assignMeal: (date: string, type: MealType, id: string | null, itemType?: 'recipe' | 'food') => Promise<void>;
  getMealPlanForDate: (date: string) => MealPlanDay;
  trackWater: (date: string, amount: number) => Promise<void>;
  addToShoppingList: (items: ShoppingListItem[]) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  clearAllShoppingItems: () => Promise<void>;
  generateListFromPlan: (startDate: string, days: number) => Promise<void>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanDay[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const r = await storage.load<Recipe[]>(STORAGE_KEYS.MEAL_RECIPES);
    const f = await storage.load<Food[]>(STORAGE_KEYS.MEAL_FOODS);
    const p = await storage.load<MealPlanDay[]>(STORAGE_KEYS.MEAL_PLANS);
    const s = await storage.load<ShoppingListItem[]>(STORAGE_KEYS.MEAL_SHOPPING);
    setRecipes(r || []);
    setFoods(f || []);
    setMealPlans(p || []);
    setShoppingList(s || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener(SYNC_RELOAD_EVENT, loadData);
    return () => window.removeEventListener(SYNC_RELOAD_EVENT, loadData);
  }, [loadData]);

  const addRecipe = async (data: Omit<Recipe, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const updated = [...recipes, { ...data, id }];
    setRecipes(updated);
    await storage.save(STORAGE_KEYS.MEAL_RECIPES, updated);
    return id;
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const updated = recipes.map(r => r.id === id ? { ...r, ...updates } : r);
    setRecipes(updated);
    await storage.save(STORAGE_KEYS.MEAL_RECIPES, updated);
  };

  const deleteRecipe = async (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    await storage.save(STORAGE_KEYS.MEAL_RECIPES, updated);
  };

  const toggleFavoriteRecipe = async (id: string) => {
    const updated = recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
    setRecipes(updated);
    await storage.save(STORAGE_KEYS.MEAL_RECIPES, updated);
  };

  const addFood = async (data: Omit<Food, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const updated = [...foods, { ...data, id }];
    setFoods(updated);
    await storage.save(STORAGE_KEYS.MEAL_FOODS, updated);
    return id;
  };

  const updateFood = async (id: string, updates: Partial<Food>) => {
    const updated = foods.map(f => f.id === id ? { ...f, ...updates } : f);
    setFoods(updated);
    await storage.save(STORAGE_KEYS.MEAL_FOODS, updated);
  };

  const deleteFood = async (id: string) => {
    const updated = foods.filter(f => f.id !== id);
    setFoods(updated);
    await storage.save(STORAGE_KEYS.MEAL_FOODS, updated);
  };

  const toggleFavoriteFood = async (id: string) => {
    const updated = foods.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f);
    setFoods(updated);
    await storage.save(STORAGE_KEYS.MEAL_FOODS, updated);
  };

  const assignMeal = async (date: string, type: MealType, id: string | null, itemType: 'recipe' | 'food' = 'recipe') => {
    const prefixedId = id ? `${itemType}:${id}` : null;
    let updated = [...mealPlans];
    const idx = updated.findIndex(p => p.date === date);
    if (idx !== -1) {
      updated[idx] = { ...updated[idx], [type]: prefixedId === null ? undefined : prefixedId };
    } else {
      const newDay: MealPlanDay = { date, waterIntake: 0 };
      if (prefixedId) newDay[type] = prefixedId;
      updated.push(newDay);
    }
    setMealPlans(updated);
    await storage.save(STORAGE_KEYS.MEAL_PLANS, updated);
  };

  const getMealPlanForDate = (date: string) => mealPlans.find(p => p.date === date) || { date, waterIntake: 0 };

  const trackWater = async (date: string, amount: number) => {
    let updated = [...mealPlans];
    const idx = updated.findIndex(p => p.date === date);
    if (idx !== -1) {
      updated[idx] = { ...updated[idx], waterIntake: Math.max(0, updated[idx].waterIntake + amount) };
    } else {
      updated.push({ date, waterIntake: Math.max(0, amount) });
    }
    setMealPlans(updated);
    await storage.save(STORAGE_KEYS.MEAL_PLANS, updated);
  };

  const addToShoppingList = async (items: ShoppingListItem[]) => {
    const updated = [...shoppingList, ...items];
    setShoppingList(updated);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, updated);
  };

  const toggleShoppingItem = async (id: string) => {
    const updated = shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setShoppingList(updated);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, updated);
  };

  const deleteShoppingItem = async (id: string) => {
    const updated = shoppingList.filter(i => i.id !== id);
    setShoppingList(updated);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, updated);
  };

  const clearCheckedItems = async () => {
    const updated = shoppingList.filter(i => !i.checked);
    setShoppingList(updated);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, updated);
  };

  const clearAllShoppingItems = async () => {
    setShoppingList([]);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, []);
  };

  const generateListFromPlan = async (startDate: string, days: number) => {
    const start = new Date(startDate);
    const dateKeys = Array.from({ length: days }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    const plans = mealPlans.filter(p => dateKeys.includes(p.date));
    const newItems: ShoppingListItem[] = [];
    plans.forEach(plan => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(type => {
        const prefixedId = plan[type as MealType];
        if(prefixedId) {
          const [itemType, id] = prefixedId.split(':');
          if (itemType === 'recipe') {
            const recipe = recipes.find(r => r.id === id);
            if(recipe) recipe.ingredients.forEach(ing => newItems.push({ ...ing, id: Date.now() + Math.random().toString(), recipeId: recipe.id, checked: false }));
          } else if (itemType === 'food') {
            const food = foods.find(f => f.id === id);
            if (food) newItems.push({ id: Date.now() + Math.random().toString(), name: food.name, amount: 1, unit: food.servingSize, category: food.category || 'Other', checked: false, isCustom: true });
          }
        }
      });
    });
    const updated = [...shoppingList, ...newItems];
    setShoppingList(updated);
    await storage.save(STORAGE_KEYS.MEAL_SHOPPING, updated);
  };

  return (
    <MealContext.Provider value={{ recipes, foods, mealPlans, shoppingList, loading, addRecipe, updateRecipe, deleteRecipe, toggleFavoriteRecipe, addFood, updateFood, deleteFood, toggleFavoriteFood, assignMeal, getMealPlanForDate, trackWater, addToShoppingList, toggleShoppingItem, deleteShoppingItem, clearCheckedItems, clearAllShoppingItems, generateListFromPlan }}>
      {children}
    </MealContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealContext);
  if (context === undefined) throw new Error('useMeals must be used within a MealProvider');
  return context;
};