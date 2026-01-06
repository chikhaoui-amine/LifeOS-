import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white dark:bg-gray-800 border-green-500/20',
    error: 'bg-white dark:bg-gray-800 border-red-500/20',
    info: 'bg-white dark:bg-gray-800 border-blue-500/20'
  };

  return (
    <div 
      className={`
        pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border
        transform transition-all duration-300 ease-out
        ${bgColors[type]}
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
      `}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
      <button 
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};