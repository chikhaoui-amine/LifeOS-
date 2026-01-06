import React, { useState } from 'react';
import { X, Plus, ShoppingCart } from 'lucide-react';
import { ShoppingListItem } from '../../types';

interface ShoppingItemModalProps {
  onSave: (item: Partial<ShoppingListItem>) => void;
  onClose: () => void;
}

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Pantry', 'Frozen', 'Other'];

export const ShoppingItemModal: React.FC<ShoppingItemModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('pc');
  const [category, setCategory] = useState('Produce');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      amount: parseFloat(amount) || 1,
      unit,
      category,
      checked: false,
      isCustom: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-500" />
              Add Item
           </h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Item Name</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Milk"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none outline-none text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
           </div>

           <div className="flex gap-3">
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount</label>
                 <input 
                   type="number"
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none outline-none text-gray-900 dark:text-white font-medium"
                 />
              </div>
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unit</label>
                 <input 
                   value={unit}
                   onChange={e => setUnit(e.target.value)}
                   placeholder="pc"
                   className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none outline-none text-gray-900 dark:text-white font-medium"
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
              <div className="flex flex-wrap gap-2">
                 {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === cat ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-emerald-300'}`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>

           <button 
             type="submit" 
             disabled={!name}
             className="w-full py-3 mt-2 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
           >
              Add to List
           </button>
        </form>

      </div>
    </div>
  );
};