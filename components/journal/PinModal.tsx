
import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, Delete } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
  isSettingMode?: boolean; // True if we are creating a pin
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onVerify, isSettingMode = false, title }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        setTimeout(() => {
           onVerify(newPin);
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 flex-none border-b border-gray-100 dark:border-gray-700">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${error ? 'bg-red-100 text-red-500' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
              {isSettingMode ? <Lock size={20} /> : <Unlock size={20} />}
           </div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">
             {title || (isSettingMode ? 'Set PIN Code' : 'Enter PIN')}
           </h3>
           <p className="text-xs text-gray-500 mt-1">
             {isSettingMode ? 'Create a 4-digit code to lock this entry' : 'This entry is protected'}
           </p>
        </div>

        <div className="p-6 pb-8">
           {/* Dots */}
           <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-primary-600 scale-110' : 'bg-gray-200 dark:bg-gray-700'} ${error ? 'bg-red-500 animate-shake' : ''}`} 
                />
              ))}
           </div>

           {/* Keypad */}
           <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumClick(num.toString())}
                  className="h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-bold text-gray-700 dark:text-gray-200 transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div className="h-14" /> {/* Spacer */}
              <button
                  onClick={() => handleNumClick('0')}
                  className="h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-bold text-gray-700 dark:text-gray-200 transition-colors active:scale-95"
                >
                  0
              </button>
              <button
                  onClick={handleDelete}
                  className="h-14 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors active:scale-95"
                >
                  <Delete size={24} />
              </button>
           </div>
           
           <button onClick={onClose} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-4">
             Cancel
           </button>
        </div>

      </div>
    </div>
  );
};
