
import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Clock, Flame, Users, ChefHat, Sparkles, Image as ImageIcon, AlignLeft, List, CheckSquare, ArrowRight, Upload } from 'lucide-react';
import { Recipe, Ingredient, Difficulty } from '../../types';
import { AIChefModal } from './AIChefModal';

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
  onClose: () => void;
}

const FOOD_ICONS = [
  '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🫘', '🍄', '🥜', '🌰',
  '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🦪', '🥡',
  '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯',
  '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊',
  '🥢', '🍽️', '🍴', '🥣', '🥡', '🍳'
];

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'steps'>('details');
  const [showAIChef, setShowAIChef] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [icon, setIcon] = useState(initialData?.icon || '🥘');
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || 15);
  const [cookTime, setCookTime] = useState(initialData?.cookTime || 15);
  const [servings, setServings] = useState(initialData?.servings || 2);
  const [calories, setCalories] = useState(initialData?.calories || 400);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || 'medium');
  const [cuisine, setCuisine] = useState(initialData?.cuisine || 'General');
  
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData?.ingredients || []);
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('pc');

  // Instructions
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || []);
  const [newInstruction, setNewInstruction] = useState('');

  // AI Handler
  const handleAIGenerated = (data: Partial<Recipe>) => {
    if (data.title) setTitle(data.title);
    if (data.description) setDescription(data.description);
    if (data.prepTime) setPrepTime(data.prepTime);
    if (data.cookTime) setCookTime(data.cookTime);
    if (data.servings) setServings(data.servings);
    if (data.calories) setCalories(data.calories);
    if (data.difficulty) setDifficulty(data.difficulty);
    if (data.cuisine) setCuisine(data.cuisine);
    if (data.ingredients) setIngredients(data.ingredients);
    if (data.instructions) setInstructions(data.instructions);
  };

  // Image Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setIcon(''); // Clear icon if image is set
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Item Logic
  const handleAddIngredient = () => {
    if (newIngName && newIngAmount) {
      setIngredients([
        ...ingredients, 
        { 
          id: Date.now().toString(), 
          name: newIngName, 
          amount: parseFloat(newIngAmount), 
          unit: newIngUnit, 
          category: 'Other' 
        }
      ]);
      setNewIngName('');
      setNewIngAmount('');
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      title, description, image, icon, prepTime: Number(prepTime), cookTime: Number(cookTime),
      servings: Number(servings), calories: Number(calories), difficulty, cuisine,
      tags: [], ingredients, instructions, rating: 0, isFavorite: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full md:w-full max-w-4xl shadow-2xl border-0 md:border border-gray-200 dark:border-gray-700 flex flex-col h-full md:h-[85vh] overflow-hidden rounded-none md:rounded-[2.5rem]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
            {initialData?.title ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           
           {/* Sidebar Tabs - Horizontal on Mobile */}
           <div className="md:w-64 bg-gray-50 dark:bg-gray-900/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 shrink-0 flex md:flex-col overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 md:flex-none p-3 md:p-5 text-left flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 ${activeTab === 'details' ? 'border-orange-500 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                 <AlignLeft size={18} />
                 <span className="text-xs md:text-sm uppercase tracking-widest font-black">Details</span>
              </button>
              <button 
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 md:flex-none p-3 md:p-5 text-left flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 ${activeTab === 'ingredients' ? 'border-orange-500 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                 <List size={18} />
                 <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-sm uppercase tracking-widest font-black">Ingredients</span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-[10px] px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400 font-black">{ingredients.length}</span>
                 </div>
              </button>
              <button 
                onClick={() => setActiveTab('steps')}
                className={`flex-1 md:flex-none p-3 md:p-5 text-left flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 ${activeTab === 'steps' ? 'border-orange-500 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                 <CheckSquare size={18} />
                 <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-sm uppercase tracking-widest font-black">Steps</span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-[10px] px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400 font-black">{instructions.length}</span>
                 </div>
              </button>
           </div>

           {/* Form Area */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-gray-800">
              
              {activeTab === 'details' && (
                 <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    
                    {!initialData?.id && (
                       <button 
                         onClick={() => setShowAIChef(true)}
                         className="w-full mb-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-0.5 rounded-3xl shadow-lg group hover:shadow-xl transition-all"
                       >
                          <div className="bg-white dark:bg-gray-800 rounded-[1.4rem] p-4 md:p-5 flex items-center gap-4 md:gap-5 relative overflow-hidden group-hover:bg-opacity-95 transition-all">
                             <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:rotate-12 transition-transform">
                                <Sparkles size={24} md-size={28} />
                             </div>
                             <div className="text-left flex-1 relative z-10">
                                <h3 className="font-black text-base md:text-lg text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">AI Chef Intelligence</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Let Gemini design the perfect recipe for you.</p>
                             </div>
                             <div className="h-8 w-8 md:h-10 md:w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <ArrowRight size={16} md-size={18} />
                             </div>
                          </div>
                       </button>
                    )}

                    <div className="space-y-6">
                       <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto items-center sm:items-start">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 self-start">Recipe Visual</label>
                             <button 
                               type="button"
                               onClick={() => setShowIconPicker(!showIconPicker)}
                               className="w-full sm:w-24 h-32 sm:h-24 rounded-3xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-5xl border-2 border-transparent hover:border-orange-500/50 transition-all shadow-inner relative overflow-hidden group/picker"
                             >
                                {image ? <img src={image} className="w-full h-full object-cover" /> : <span className="drop-shadow-sm">{icon || '🥘'}</span>}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/picker:opacity-100 transition-opacity">
                                   <Plus size={24} />
                                </div>
                             </button>
                             {showIconPicker && (
                                <div className="absolute z-[90] mt-28 left-0 sm:left-8 w-72 md:w-80 p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
                                   <div className="flex justify-between items-center mb-4">
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Library</span>
                                      <button onClick={() => setShowIconPicker(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                   </div>
                                   <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto custom-scrollbar mb-4 pr-1">
                                      {FOOD_ICONS.map((i, index) => (
                                         <button
                                           key={index}
                                           type="button"
                                           onClick={() => { setIcon(i); setImage(''); setShowIconPicker(false); }}
                                           className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-200`}
                                         >
                                            {i}
                                         </button>
                                      ))}
                                   </div>
                                   <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />
                                   <button 
                                     type="button" 
                                     onClick={() => fileInputRef.current?.click()}
                                     className="w-full py-3 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all"
                                   >
                                      <Upload size={14} strokeWidth={3} /> Upload Photo
                                   </button>
                                   <input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      onChange={handleImageUpload} 
                                      className="hidden" 
                                      accept="image/*" 
                                   />
                                </div>
                             )}
                          </div>
                          <div className="flex-1 w-full space-y-4">
                             <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Recipe Title</label>
                                <input 
                                  type="text" 
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  placeholder="e.g. Italian Homemade Pizza" 
                                  className="w-full px-5 py-3 md:py-4 rounded-2xl border-none bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 text-lg md:text-xl font-black uppercase tracking-tighter"
                                />
                             </div>
                             <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Cuisine</label>
                                   <input 
                                     type="text" 
                                     value={cuisine}
                                     onChange={(e) => setCuisine(e.target.value)}
                                     placeholder="e.g. Italian" 
                                     className="w-full px-4 py-3 rounded-xl border-none bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                                   />
                                </div>
                                <div className="flex-1">
                                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Difficulty</label>
                                   <div className="grid grid-cols-3 gap-2">
                                      {(['easy', 'medium', 'hard'] as const).map(d => (
                                         <button
                                           key={d}
                                           type="button"
                                           onClick={() => setDifficulty(d)}
                                           className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${difficulty === d ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-orange-200'}`}
                                         >
                                            {d}
                                         </button>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Short Story / Description</label>
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What makes this dish special?" 
                            rows={3}
                            className="w-full px-5 py-4 rounded-3xl border-none bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 resize-none font-medium italic"
                          />
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                             <label className="text-[8px] font-black text-gray-400 uppercase block mb-1.5 tracking-[0.2em]">Prep Time</label>
                             <div className="flex items-center gap-2">
                                <Clock size={16} className="text-orange-500" />
                                <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} className="w-full bg-transparent font-black text-gray-900 dark:text-white outline-none" />
                                <span className="text-[10px] font-bold text-gray-400">MIN</span>
                             </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                             <label className="text-[8px] font-black text-gray-400 uppercase block mb-1.5 tracking-[0.2em]">Cook Time</label>
                             <div className="flex items-center gap-2">
                                <ChefHat size={16} className="text-orange-500" />
                                <input type="number" value={cookTime} onChange={e => setCookTime(Number(e.target.value))} className="w-full bg-transparent font-black text-gray-900 dark:text-white outline-none" />
                                <span className="text-[10px] font-bold text-gray-400">MIN</span>
                             </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                             <label className="text-[8px] font-black text-gray-400 uppercase block mb-1.5 tracking-[0.2em]">Servings</label>
                             <div className="flex items-center gap-2">
                                <Users size={16} className="text-blue-500" />
                                <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full bg-transparent font-black text-gray-900 dark:text-white outline-none" />
                             </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                             <label className="text-[8px] font-black text-gray-400 uppercase block mb-1.5 tracking-[0.2em]">Calories</label>
                             <div className="flex items-center gap-2">
                                <Flame size={16} className="text-red-500" />
                                <input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full bg-transparent font-black text-gray-900 dark:text-white outline-none" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'ingredients' && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-900/40 p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <input 
                          placeholder="Item (e.g. Flour)" 
                          value={newIngName}
                          onChange={e => setNewIngName(e.target.value)}
                          className="flex-[2] px-4 py-3 rounded-xl border-none bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                          onKeyDown={e => e.key === 'Enter' && handleAddIngredient()}
                        />
                        <div className="flex gap-2 flex-1">
                           <input 
                             type="number" 
                             placeholder="Qty" 
                             value={newIngAmount}
                             onChange={e => setNewIngAmount(e.target.value)}
                             className="flex-1 px-4 py-3 rounded-xl border-none bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                             onKeyDown={e => e.key === 'Enter' && handleAddIngredient()}
                           />
                           <input 
                             placeholder="Unit" 
                             value={newIngUnit}
                             onChange={e => setNewIngUnit(e.target.value)}
                             className="flex-1 px-4 py-3 rounded-xl border-none bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                             onKeyDown={e => e.key === 'Enter' && handleAddIngredient()}
                           />
                        </div>
                        <button onClick={handleAddIngredient} className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                           <Plus size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {ingredients.length === 0 && (
                           <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2.5rem] bg-gray-50/30">
                              <ChefHat size={40} className="mx-auto mb-4 opacity-20" />
                              <p className="text-xs font-black uppercase tracking-[0.2em]">Add your ingredients list</p>
                           </div>
                        )}
                        {ingredients.map(ing => (
                           <div key={ing.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm group hover:border-orange-200 transition-all">
                              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-xs shadow-inner shrink-0">
                                 {ing.amount}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">{ing.name}</p>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ing.unit}</p>
                              </div>
                              <button onClick={() => removeIngredient(ing.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        ))}
                    </div>
                 </div>
              )}

              {activeTab === 'steps' && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex gap-3 bg-gray-50 dark:bg-gray-900/40 p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <textarea 
                          placeholder="What's the next step in the process?" 
                          value={newInstruction}
                          onChange={e => setNewInstruction(e.target.value)}
                          className="flex-1 px-5 py-4 rounded-2xl border-none bg-white dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm resize-none"
                          rows={2}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddInstruction())}
                        />
                        <button onClick={handleAddInstruction} className="p-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 shadow-lg h-fit active:scale-95 transition-all">
                           <Plus size={28} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {instructions.length === 0 && (
                           <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2.5rem] bg-gray-50/30">
                              <CheckSquare size={40} className="mx-auto mb-4 opacity-20" />
                              <p className="text-xs font-black uppercase tracking-[0.2em]">Break it down step-by-step</p>
                           </div>
                        )}
                        {instructions.map((inst, i) => (
                           <div key={i} className="flex gap-5 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm group hover:shadow-md transition-all">
                              <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white dark:bg-gray-700 text-xs font-black flex items-center justify-center shrink-0 shadow-lg">
                                 {i + 1}
                              </div>
                              <p className="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed font-medium pt-1">{inst}</p>
                              <button onClick={() => removeInstruction(i)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all self-start">
                                 <X size={20} strokeWidth={3} />
                              </button>
                           </div>
                        ))}
                    </div>
                 </div>
              )}

           </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 bg-white dark:bg-gray-800 shrink-0 pb-safe">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!title} 
            className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            Save Recipe
          </button>
        </div>
      </div>

      {showAIChef && (
        <AIChefModal 
          onClose={() => setShowAIChef(false)}
          onRecipeGenerated={handleAIGenerated}
        />
      )}
    </div>
  );
};
