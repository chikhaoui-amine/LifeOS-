import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-400 uppercase">{color}</span>
        <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm ring-2 ring-white dark:ring-gray-600">
          <input 
            type="color" 
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
          />
        </div>
      </div>
    </div>
  );
};