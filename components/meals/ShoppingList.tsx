
import React, { useState } from 'react';
import { Check, Trash2, Plus, ShoppingCart, MoreVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMeals } from '../../context/MealContext';
import { ShoppingItemModal } from './ShoppingItemModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { ShoppingListItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ShoppingList: React.FC = () => {
  const { 
    shoppingList, 
    toggleShoppingItem, 
    deleteShoppingItem, 
    clearCheckedItems, 
    clearAllShoppingItems, 
    addToShoppingList 
  } = useMeals();
  const { showToast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [showClearOptions, setShowClearOptions] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  
  const categories = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Pantry', 'Frozen', 'Other'];
  
  const groupedItems = categories.reduce((acc, cat) => {
     acc[cat] = shoppingList.filter(i => i.category === cat);
     return acc;
  }, {} as Record<string, typeof shoppingList>);

  const handleAddItem = (item: Partial<ShoppingListItem>) => {
     addToShoppingList([{
         id: Date.now().toString(),
         name: item.name || 'Item',
         amount: item.amount || 1,
         unit: item.unit || 'pc',
         category: item.category || 'Other',
         isCustom: true,
         checked: false
     }]);
     showToast('Item added to list', 'success');
  };

  const handleClearCompleted = () => {
    const count = shoppingList.filter(i => i.checked).length;
    if (count === 0) {
      showToast('No completed items to clear', 'info');
      setShowClearOptions(false);
      return;
    }
    clearCheckedItems();
    showToast(`Cleared ${count} completed items`, 'success');
    setShowClearOptions(false);
  };

  const handleClearAll = () => {
    clearAllShoppingItems();
    setIsClearAllConfirmOpen(false);
    setShowClearOptions(false);
    showToast('Shopping list cleared', 'info');
  };

  const totalItems = shoppingList.length;
  const checkedItems = shoppingList.filter(i => i.checked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       
       <div className="flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping List</h2>
             <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-500" 
                     style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }} 
                   />
                </div>
                <p className="text-xs text-gray-500 font-medium">{checkedItems} of {totalItems} items completed</p>
             </div>
          </div>
          <div className="flex gap-2 relative">
             {/* Bulk Action Toggle Button */}
             <button 
               onClick={() => setShowClearOptions(!showClearOptions)} 
               className={`p-2.5 rounded-xl transition-all ${showClearOptions ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'}`}
               title="Clear Options"
             >
                <Trash2 size={20} />
             </button>

             {/* Dropdown Menu */}
             {showClearOptions && (
               <>
                 <div className="fixed inset-0 z-20" onClick={() => setShowClearOptions(false)} />
                 <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 py-2 animate-in fade-in zoom-in-95">
                    <button 
                      onClick={handleClearCompleted}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                       <CheckCircle2 size={18} className="text-emerald-500" />
                       Clear Completed
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2 my-1" />
                    <button 
                      onClick={() => setIsClearAllConfirmOpen(true)}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                    >
                       <AlertTriangle size={18} className="text-red-500" />
                       Delete All Items
                    </button>
                 </div>
               </>
             )}

             <button 
               onClick={() => setIsAdding(true)} 
               className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95"
             >
                <Plus size={20} strokeWidth={3} /> <span className="hidden sm:inline">Add Item</span>
             </button>
          </div>
       </div>

       {totalItems === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700 shadow-inner">
             <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <ShoppingCart size={40} strokeWidth={1.5} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your list is empty</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xs mx-auto">Add items manually or use the "Auto-Generate" tool in the Plan tab.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {categories.map(cat => {
                const items = groupedItems[cat];
                if (items.length === 0) return null;

                return (
                   <div key={cat} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-fit">
                      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                         <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em]">{cat}</h3>
                         <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 font-bold border border-gray-100 dark:border-gray-700">{items.length}</span>
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                         {items.map(item => (
                            <div 
                              key={item.id}
                              className="group flex items-center p-4 gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors relative"
                            >
                               <button 
                                 onClick={() => toggleShoppingItem(item.id)}
                                 className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-gray-200 dark:border-gray-600 text-transparent group-hover:border-emerald-400'}`}
                               >
                                  <Check size={16} strokeWidth={3.5} />
                               </button>

                               <div className="flex-1 flex flex-col min-w-0" onClick={() => toggleShoppingItem(item.id)}>
                                  <div className="flex items-center gap-2">
                                     <span className={`font-bold text-sm truncate ${item.checked ? 'text-gray-400 line-through decoration-emerald-500/50' : 'text-gray-900 dark:text-white'}`}>
                                        {item.name}
                                     </span>
                                     {item.recipeId && !item.isCustom && (
                                        <span className="shrink-0 text-[9px] font-black uppercase text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">Recipe</span>
                                     )}
                                  </div>
                               </div>

                               <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                     {item.amount} {item.unit}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      deleteShoppingItem(item.id);
                                      showToast('Item removed', 'info');
                                    }}
                                    className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    title="Remove item"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                );
             })}
          </div>
       )}

       {/* Modals */}
       {isAdding && (
          <ShoppingItemModal 
             onSave={handleAddItem}
             onClose={() => setIsAdding(false)}
          />
       )}

       <ConfirmationModal 
          isOpen={isClearAllConfirmOpen}
          onClose={() => setIsClearAllConfirmOpen(false)}
          onConfirm={handleClearAll}
          title="Clear Shopping List"
          message="Are you sure you want to delete all items from your shopping list? This cannot be undone."
          type="danger"
          confirmText="Clear Everything"
       />
    </div>
  );
};
