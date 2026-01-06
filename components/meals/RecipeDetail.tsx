import React, { useState } from 'react';
import { X, Clock, Users, Flame, ChefHat, Play, ArrowLeft, ArrowRight, Minus, Plus, Trash2, Edit } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose, onEdit, onDelete }) => {
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  // Cooking Mode View
  if (isCookingMode) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
         {/* Cooking Header */}
         <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setIsCookingMode(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 font-medium">
               <X size={20} /> Exit Cooking Mode
            </button>
            <div className="flex items-center gap-2">
               <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full dark:bg-orange-900/20 dark:text-orange-400">
                 Step {currentStep + 1} of {recipe.instructions.length}
               </span>
            </div>
         </div>

         {/* Active Step */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
               {recipe.instructions[currentStep]}
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl w-full text-left mb-4">
               <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Ingredients Checklist</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipe.ingredients.map(ing => (
                     <label key={ing.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">
                           {ing.amount * servingsMultiplier} {ing.unit} {ing.name}
                        </span>
                     </label>
                  ))}
               </div>
            </div>
         </div>

         {/* Cooking Footer Controls */}
         <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="p-4 rounded-full bg-white dark:bg-gray-700 shadow-sm disabled:opacity-30 hover:scale-105 transition-all"
            >
               <ArrowLeft size={24} />
            </button>
            
            <div className="h-1 flex-1 mx-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }} />
            </div>

            <button 
              onClick={() => {
                 if (currentStep < recipe.instructions.length - 1) {
                    setCurrentStep(prev => prev + 1);
                 } else {
                    setIsCookingMode(false); // Finish
                 }
              }}
              className="px-8 py-4 rounded-full bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
               {currentStep === recipe.instructions.length - 1 ? 'Finish!' : <>Next <ArrowRight size={20} /></>}
            </button>
         </div>
      </div>
    );
  }

  // Standard Detail View
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
        
        {/* Hero Image */}
        <div className="h-64 relative shrink-0">
           {recipe.image ? (
             <img src={recipe.image} className="w-full h-full object-cover" alt={recipe.title} />
           ) : (
             <div className="w-full h-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center">
                <ChefHat size={64} className="text-orange-300" />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 backdrop-blur-md transition-colors z-10">
             <X size={20} />
           </button>
           
           <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex gap-2 mb-2">
                 {recipe.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-xs font-bold">{tag}</span>)}
              </div>
              <h1 className="text-3xl font-bold">{recipe.title}</h1>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex p-4 border-b border-gray-100 dark:border-gray-700 gap-3">
           <button 
             onClick={() => setIsCookingMode(true)}
             className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
           >
              <Play size={20} fill="currentColor" /> Start Cooking
           </button>
           
           <div className="flex items-center gap-2">
              <button onClick={onEdit} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                 <Edit size={20} />
              </button>
              <button onClick={onDelete} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
                 <Trash2 size={20} />
              </button>
           </div>
        </div>

        {/* Servings Adjuster */}
        <div className="px-6 pt-4 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Adjust Servings</span>
           <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-1">
              <button onClick={() => setServingsMultiplier(m => Math.max(0.5, m - 0.5))} className="p-1 hover:text-orange-500"><Minus size={16} /></button>
              <span className="text-sm font-bold w-8 text-center">{recipe.servings * servingsMultiplier}</span>
              <button onClick={() => setServingsMultiplier(m => m + 0.5)} className="p-1 hover:text-orange-500"><Plus size={16} /></button>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
           
           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl text-center border border-orange-100 dark:border-orange-800">
                 <Clock className="mx-auto text-orange-500 mb-1" size={20} />
                 <p className="text-xs text-gray-500 uppercase font-bold">Time</p>
                 <p className="font-bold text-gray-900 dark:text-white">{recipe.prepTime + recipe.cookTime}m</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-center border border-red-100 dark:border-red-800">
                 <Flame className="mx-auto text-red-500 mb-1" size={20} />
                 <p className="text-xs text-gray-500 uppercase font-bold">Cals</p>
                 <p className="font-bold text-gray-900 dark:text-white">{Math.round(recipe.calories * servingsMultiplier)}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-center border border-blue-100 dark:border-blue-800">
                 <Users className="mx-auto text-blue-500 mb-1" size={20} />
                 <p className="text-xs text-gray-500 uppercase font-bold">Difficulty</p>
                 <p className="font-bold text-gray-900 dark:text-white capitalize">{recipe.difficulty}</p>
              </div>
           </div>

           {/* Ingredients */}
           <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 Ingredients <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{recipe.ingredients.length} items</span>
              </h3>
              <div className="space-y-3">
                 {recipe.ingredients.map(ing => (
                    <div key={ing.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                       <span className="font-medium text-gray-700 dark:text-gray-300">{ing.name}</span>
                       <span className="text-sm font-bold text-gray-500">
                          {ing.amount * servingsMultiplier} {ing.unit}
                       </span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Instructions */}
           <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Instructions</h3>
              <div className="space-y-6">
                 {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                             {i + 1}
                          </div>
                          {i < recipe.instructions.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-2 group-hover:bg-orange-200 transition-colors" />}
                       </div>
                       <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-1 pb-4">
                          {step}
                       </p>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};