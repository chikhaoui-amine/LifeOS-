
import { Theme } from '../types';

export const DEFAULT_DARK_THEME: Theme = {
  id: 'midnight-dark',
  name: 'Midnight Pro',
  type: 'dark',
  colors: {
    primary: '#E11D48', // Rose 600 (rgb(225, 29, 72))
    background: '#020617', // Deepest Slate 950
    surface: '#0f172a', // Slate 900
    text: '#f8fafc', // Slate 50
    textSecondary: '#94a3b8', // Slate 400
    border: '#1e293b', // Slate 800
    success: '#34d399', // Emerald 400
    error: '#f87171', // Red 400
    warning: '#fbbf24', // Amber 400
    info: '#38bdf8', // Sky 400
  },
  radius: 'xl',
  font: 'Inter',
};

export const PREBUILT_THEMES: Theme[] = [
  DEFAULT_DARK_THEME,
  // --- Light Themes ---
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    type: 'light',
    colors: {
      primary: '#ec4899', // Pink
      background: '#fdf2f8', // Pink 50
      surface: '#ffffff',
      text: '#831843', // Pink 900
      textSecondary: '#be185d',
      border: '#fbcfe8',
      success: '#4ade80',
      error: '#fb7185',
      warning: '#fcd34d',
      info: '#67e8f9',
    },
    radius: 'xl',
    font: 'Poppins',
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    type: 'light',
    colors: {
      primary: '#059669', // Emerald
      background: '#ecfdf5', // Emerald 50
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#047857',
      border: '#a7f3d0',
      success: '#059669',
      error: '#ef4444',
      warning: '#d97706',
      info: '#0ea5e9',
    },
    radius: 'lg',
    font: 'Inter',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    type: 'light',
    colors: {
      primary: '#0284c7', // Sky 700
      background: '#f0f9ff', // Sky 50
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#10b981',
      error: '#f43f5e',
      warning: '#f59e0b',
      info: '#0ea5e9',
    },
    radius: 'xl',
    font: 'Inter',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    type: 'light',
    colors: {
      primary: '#ea580c', // Orange
      background: '#fff7ed', // Orange 50
      surface: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#c2410c',
      border: '#fed7aa',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#ea580c',
      info: '#3b82f6',
    },
    radius: 'md',
    font: 'Inter',
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    type: 'light',
    colors: {
      primary: '#e11d48', // Rose
      background: '#fff1f2', // Rose 50
      surface: '#ffffff',
      text: '#881337',
      textSecondary: '#be123c',
      border: '#fecdd3',
      success: '#10b981',
      error: '#e11d48',
      warning: '#f59e0b',
      info: '#ec4899',
    },
    radius: 'xl',
    font: 'Serif',
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    type: 'light',
    colors: {
      primary: '#525252', // Neutral
      background: '#fafafa', // Neutral 50
      surface: '#ffffff',
      text: '#171717',
      textSecondary: '#737373',
      border: '#e5e5e5',
      success: '#404040',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#737373',
    },
    radius: 'none',
    font: 'Mono',
  },

  // --- Dark Themes ---
  {
    id: 'amoled-black',
    name: 'AMOLED Black',
    type: 'dark',
    colors: {
      primary: '#3b82f6', // Blue 500
      background: '#000000', // Pure Black
      surface: '#000000', // Pure Black for cards
      text: '#ffffff', // Pure White
      textSecondary: '#a3a3a3', // Neutral 400
      border: '#262626', // Neutral 800 - Subtle
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
      info: '#3b82f6',
    },
    radius: 'md',
    font: 'Inter',
  },
  {
    id: 'dark-purple',
    name: 'Deep Purple',
    type: 'dark',
    colors: {
      primary: '#d8b4fe', // Purple 300
      background: '#2e1065', // Purple 950
      surface: '#4c1d95', // Purple 900
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      border: '#6b21a8',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#a78bfa',
    },
    radius: 'xl',
    font: 'Poppins',
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    type: 'dark',
    colors: {
      primary: '#4ade80', // Green 400
      background: '#022c22', // Green 950
      surface: '#064e3b', // Green 900
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#065f46',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#34d399',
    },
    radius: 'lg',
    font: 'Inter',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    type: 'dark',
    colors: {
      primary: '#f472b6', // Pink Neon
      background: '#09090b', // Zinc 950
      surface: '#18181b', // Zinc 900
      text: '#22d3ee', // Cyan Text
      textSecondary: '#e879f9', // Purple
      border: '#334155',
      success: '#4ade80', // Neon Green
      error: '#f43f5e', // Neon Red
      warning: '#facc15', // Neon Yellow
      info: '#22d3ee', // Neon Cyan
    },
    radius: 'none',
    font: 'Mono',
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    type: 'dark',
    colors: {
      primary: '#fb923c', // Orange
      background: '#451a03', // Amber 950
      surface: '#78350f', // Amber 900
      text: '#fff7ed',
      textSecondary: '#fdba74',
      border: '#92400e',
      success: '#84cc16',
      error: '#ef4444',
      warning: '#fb923c',
      info: '#60a5fa',
    },
    radius: 'xl',
    font: 'Serif',
  },
  {
    id: 'nord-dark',
    name: 'Nord Dark',
    type: 'dark',
    colors: {
      primary: '#88c0d0', // Nord Blue
      background: '#242933', // Custom Nord Black
      surface: '#2e3440', // Nord Surface
      text: '#eceff4',
      textSecondary: '#d8dee9',
      border: '#4c566a',
      success: '#a3be8c', // Nord Green
      error: '#bf616a', // Nord Red
      warning: '#ebcb8b', // Nord Yellow
      info: '#88c0d0', // Nord Blue
    },
    radius: 'md',
    font: 'Inter',
  },

  // --- Special Themes ---
  {
    id: 'islamic-green',
    name: 'Islamic Green',
    type: 'light',
    colors: {
      primary: '#d97706', // Gold
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d', // Dark Green
      textSecondary: '#15803d',
      border: '#bbf7d0',
      success: '#15803d',
      error: '#b91c1c',
      warning: '#d97706',
      info: '#0369a1',
    },
    radius: 'xl',
    font: 'Serif',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    type: 'light',
    colors: {
      primary: '#000000',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#000000',
      border: '#000000',
      success: '#008000', // Std Green
      error: '#ff0000', // Std Red
      warning: '#ffa500',
      info: '#0000ff',
    },
    radius: 'none',
    font: 'Inter',
  }
];
