
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeContextType } from '../types';
import { PREBUILT_THEMES, DEFAULT_DARK_THEME } from '../utils/themeLibrary';
import { storage } from '../utils/storage';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SAVED_THEMES_KEY = 'lifeos_custom_themes';
const CURRENT_THEME_OBJECT_KEY = 'lifeos_active_theme_object'; 

// Converts Hex to space-separated RGB (e.g. "255 0 0") for Tailwind opacity modifiers
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '0 0 0';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedThemes, setSavedThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(DEFAULT_DARK_THEME);

  useEffect(() => {
    const load = async () => {
      const custom = await storage.load<Theme[]>(SAVED_THEMES_KEY) || [];
      setSavedThemes(custom);
      const cachedTheme = await storage.load<Theme>(CURRENT_THEME_OBJECT_KEY);
      if (cachedTheme) {
        applyTheme(cachedTheme, false);
      } else {
        applyTheme(DEFAULT_DARK_THEME);
      }
    };
    load();
  }, []);

  const injectThemeVariables = (theme: Theme) => {
    const root = document.documentElement;
    const { colors } = theme;
    
    // Set Color Scheme for browser UI (scrollbars, inputs)
    root.style.colorScheme = theme.type;

    if (theme.type === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    // Calculate RGB values for Tailwind alpha modifiers
    const primaryRgb = hexToRgb(colors.primary);
    const bgRgb = hexToRgb(colors.background);
    const surfaceRgb = hexToRgb(colors.surface);
    const textRgb = hexToRgb(colors.text);
    const borderRgb = hexToRgb(colors.border);

    // Set CSS Variables consumed by tailwind.config
    root.style.setProperty('--color-primary-rgb', primaryRgb);
    root.style.setProperty('--color-bg-rgb', bgRgb);
    root.style.setProperty('--color-surface-rgb', surfaceRgb);
    root.style.setProperty('--color-text-rgb', textRgb);
    
    // Set Base Style Variables
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-text-muted', colors.textSecondary);

    const radiusMap = { none: '0px', sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' };
    root.style.setProperty('--radius-base', radiusMap[theme.radius]);

    const fontMap = {
      'Inter': "'Inter', sans-serif",
      'Roboto': "'Roboto', sans-serif",
      'Poppins': "'Poppins', sans-serif",
      'Serif': "'Merriweather', serif",
      'Mono': "'JetBrains Mono', monospace"
    };
    root.style.setProperty('--font-main', fontMap[theme.font]);

    // Remove legacy override script if present
    const oldStyle = document.getElementById('theme-overrides');
    if (oldStyle) oldStyle.remove();
  };

  const applyTheme = (theme: Theme, persist = true) => {
    setCurrentTheme(theme);
    injectThemeVariables(theme);
    if (persist) storage.save(CURRENT_THEME_OBJECT_KEY, theme);
  };

  const updateThemePrimaryColor = (color: string) => {
    const updatedTheme = { ...currentTheme, colors: { ...currentTheme.colors, primary: color } };
    applyTheme(updatedTheme);
  };

  const saveCustomTheme = async (theme: Theme) => {
    const newSaved = [...savedThemes.filter(t => t.id !== theme.id), theme];
    setSavedThemes(newSaved);
    await storage.save(SAVED_THEMES_KEY, newSaved);
    applyTheme(theme);
  };

  const deleteCustomTheme = async (id: string) => {
    const newSaved = savedThemes.filter(t => t.id !== id);
    setSavedThemes(newSaved);
    await storage.save(SAVED_THEMES_KEY, newSaved);
    if (currentTheme.id === id) applyTheme(DEFAULT_DARK_THEME);
  };

  const exportTheme = (theme: Theme): string => JSON.stringify(theme);

  const importTheme = (json: string): boolean => {
    try {
      const theme = JSON.parse(json) as Theme;
      if (!theme.colors || !theme.name) return false;
      theme.id = `imported-${Date.now()}`;
      theme.isCustom = true;
      saveCustomTheme(theme);
      return true;
    } catch (e) { return false; }
  };

  const resetToDefault = () => applyTheme(DEFAULT_DARK_THEME);

  return (
    <ThemeContext.Provider value={{
      currentTheme, savedThemes, applyTheme, updateThemePrimaryColor,
      saveCustomTheme, deleteCustomTheme, exportTheme, importTheme, resetToDefault
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
