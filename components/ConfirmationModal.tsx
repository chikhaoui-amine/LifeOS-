
import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'simple' | 'danger' | 'nuclear';
  confirmText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'simple',
  confirmText = 'Confirm'
}) => {
  const [inputValue, setInputValue] = useState('');
  
  if (!isOpen) return null;

  const isNuclear = type === 'nuclear';
  const isValid = isNuclear ? inputValue === 'DELETE' : true;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        
        <div className="flex flex-col items-center text-center mb-4">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'simple' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
             {type === 'simple' ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
           </div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p>
        </div>

        {isNuclear && (
          <div className="mb-4">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type "DELETE" to confirm</label>
             <input 
               type="text" 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="w-full px-3 py-2 border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-600 focus:ring-2 focus:ring-red-500 outline-none"
             />
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!isValid}
            className={`
              flex-1 py-2.5 rounded-xl font-medium text-white transition-all shadow-lg
              ${type === 'simple' 
                 ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20' 
                 : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}
              ${!isValid ? 'opacity-50 cursor-not-allowed shadow-none' : ''}
            `}
          >
             {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
