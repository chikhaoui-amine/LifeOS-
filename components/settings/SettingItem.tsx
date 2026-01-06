import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface SettingItemProps {
  icon?: LucideIcon;
  label: string;
  subLabel?: string;
  type?: 'toggle' | 'select' | 'button' | 'link' | 'danger';
  value?: boolean | string;
  onChange?: (val: any) => void;
  onClick?: () => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  label,
  subLabel,
  type = 'button',
  value,
  onChange,
  onClick,
  options,
  disabled = false
}) => {
  
  const baseClasses = `
    w-full px-5 py-4 flex items-center justify-between text-left transition-colors
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
    ${type === 'danger' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-900 dark:text-gray-100'}
  `;

  const renderControl = () => {
    if (type === 'toggle') {
      return (
        <button 
          className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
          onClick={() => !disabled && onChange && onChange(!value)}
        >
          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      );
    }
    
    if (type === 'select' && options) {
      return (
        <select 
          value={value as string}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          className="bg-transparent text-right text-gray-500 dark:text-gray-400 text-sm focus:outline-none cursor-pointer"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === 'link') {
      return <ChevronRight size={18} className="text-gray-400" />;
    }

    return null;
  };

  return (
    <div className={baseClasses} onClick={type !== 'toggle' && type !== 'select' ? onClick : undefined}>
      <div className="flex items-center gap-3.5">
        {Icon && (
           <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
             <Icon size={18} />
           </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium text-sm sm:text-base">{label}</span>
          {subLabel && <span className="text-xs text-gray-400 mt-0.5">{subLabel}</span>}
        </div>
      </div>
      <div>
        {renderControl()}
      </div>
    </div>
  );
};