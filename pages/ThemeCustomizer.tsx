import React, { useState } from 'react';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
import { Theme, ThemeMode } from '../types';

export const ThemeCustomizer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveCustomTheme } = useTheme();
  
  // Initialize from existing theme if editing, or defaults
  const initialTheme = (location.state as any)?.theme || {
    id: `custom-${Date.now()}`,
    name: 'My Theme',
    type: 'light',
    colors: {
      primary: '#6366f1',
      background: '#ffffff',
      surface: '#f3f4f6',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    radius: 'lg',
    font: 'Inter'
  };

  const [theme, setTheme] = useState<Theme>(initialTheme);

  const updateColor = (key: keyof Theme['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const handleSave = () => {
    if (!theme.name.trim()) return;
    saveCustomTheme({ ...theme, id: theme.id || `custom-${Date.now()}`, isCustom: true });
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 animate-in fade-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
           <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-white">Theme Creator</h1>
        <button onClick={handleSave} className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full">
           <Save size={24} />
        </button>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* Preview Section (Sticky) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</h2>
           <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg" style={{ backgroundColor: theme.colors.background }}>
              <div className="p-4 border-b" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme.colors.primary }}>L</div>
              </div>
              <div className="p-4 space-y-3">
                 <h1 className="text-xl font-bold" style={{ color: theme.colors.text }}>Hello World</h1>
                 <p style={{ color: theme.colors.textSecondary }}>This is how your theme looks.</p>
                 <div className="flex gap-2">
                   <button className="px-4 py-2 rounded-lg text-white font-medium flex-1" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius === 'full' ? '99px' : undefined }}>
                      Action
                   </button>
                   <button className="px-4 py-2 rounded-lg text-white font-medium flex-1" style={{ backgroundColor: theme.colors.success, borderRadius: theme.radius === 'full' ? '99px' : undefined }}>
                      Done
                   </button>
                 </div>
                 <div className="flex gap-2 mt-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: theme.colors.error}}></span>
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: theme.colors.warning}}></span>
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: theme.colors.info}}></span>
                 </div>
              </div>
           </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme Name</label>
           <input 
             type="text" 
             value={theme.name}
             onChange={e => setTheme({...theme, name: e.target.value})}
             className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
           />
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Base Colors</h3>
          <ColorPicker label="Primary Brand" color={theme.colors.primary} onChange={(c) => updateColor('primary', c)} />
          <ColorPicker label="Background" color={theme.colors.background} onChange={(c) => updateColor('background', c)} />
          <ColorPicker label="Card Surface" color={theme.colors.surface} onChange={(c) => updateColor('surface', c)} />
          <ColorPicker label="Primary Text" color={theme.colors.text} onChange={(c) => updateColor('text', c)} />
          <ColorPicker label="Secondary Text" color={theme.colors.textSecondary} onChange={(c) => updateColor('textSecondary', c)} />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Semantic Colors</h3>
          <ColorPicker label="Success (Green)" color={theme.colors.success} onChange={(c) => updateColor('success', c)} />
          <ColorPicker label="Error (Red)" color={theme.colors.error} onChange={(c) => updateColor('error', c)} />
          <ColorPicker label="Warning (Orange)" color={theme.colors.warning} onChange={(c) => updateColor('warning', c)} />
          <ColorPicker label="Info (Blue)" color={theme.colors.info} onChange={(c) => updateColor('info', c)} />
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Appearance</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Mode</label>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
               <button onClick={() => setTheme({...theme, type: 'light'})} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${theme.type === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Light</button>
               <button onClick={() => setTheme({...theme, type: 'dark'})} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${theme.type === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500'}`}>Dark</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Corner Radius</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {['none', 'sm', 'md', 'lg', 'xl', 'full'].map((r) => (
                 <button 
                   key={r} 
                   onClick={() => setTheme({...theme, radius: r as any})}
                   className={`px-3 py-1.5 rounded-lg border text-sm capitalize whitespace-nowrap ${theme.radius === r ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                 >
                   {r}
                 </button>
               ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {['Inter', 'Roboto', 'Poppins', 'Serif', 'Mono'].map((f) => (
                 <button 
                   key={f} 
                   onClick={() => setTheme({...theme, font: f as any})}
                   className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${theme.font === f ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};