import React from 'react';
import { Check, Trash2, Edit } from 'lucide-react';
import { Theme } from '../types';

interface ThemePreviewProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, isActive, onClick, onEdit, onDelete }) => {
  const { colors } = theme;

  return (
    <button 
      onClick={onClick}
      className={`
        relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 group text-left
        ${isActive ? 'border-primary-600 ring-4 ring-primary-600/20 scale-[1.02]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'}
      `}
    >
      {/* Mock UI Preview */}
      <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <div className="h-1/4 p-3 flex items-center gap-2" style={{ backgroundColor: colors.surface }}>
           <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colors.primary }}>
             L
           </div>
           <div className="h-2 w-20 rounded-full opacity-50" style={{ backgroundColor: colors.text }}></div>
        </div>
        {/* Body */}
        <div className="p-3 gap-2 grid grid-cols-2">
           <div className="h-20 rounded-xl shadow-sm" style={{ backgroundColor: colors.surface, borderRadius: theme.radius === 'full' ? '1rem' : undefined }}></div>
           <div className="h-20 rounded-xl shadow-sm" style={{ backgroundColor: colors.surface, borderRadius: theme.radius === 'full' ? '1rem' : undefined }}></div>
           <div className="col-span-2 h-8 rounded-lg opacity-20" style={{ backgroundColor: colors.primary }}></div>
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
        <span className="text-white font-medium text-sm drop-shadow-md">{theme.name}</span>
        {isActive && (
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-md">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Actions for Custom Themes */}
      {theme.isCustom && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {onEdit && (
             <div onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-gray-700 shadow-sm cursor-pointer">
                <Edit size={14} />
             </div>
           )}
           {onDelete && (
             <div onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-red-50 text-red-500 shadow-sm cursor-pointer">
                <Trash2 size={14} />
             </div>
           )}
        </div>
      )}
    </button>
  );
};