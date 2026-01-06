import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- ROBUST ENVIRONMENT VARIABLE INJECTION ---

// 1. Initialize process.env polyfill immediately
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || {};
  (window as any).process.env = (window as any).process.env || {};
}

// 2. Extract Key using direct access pattern for Vite replacement
// We intentionally avoid complex 'if' guards here so Vite's static analysis 
// sees "import.meta.env.VITE_API_KEY" clearly and replaces it at build time.
let extractedKey = '';

try {
  // @ts-ignore
  extractedKey = import.meta.env.VITE_API_KEY;
} catch (e) {
  // Ignore if import.meta is not available
}

// 3. Fallback to standard process.env (for non-Vite builds)
if (!extractedKey && process && process.env && process.env.VITE_API_KEY) {
  extractedKey = process.env.VITE_API_KEY;
}

// 4. Inject into the location expected by the App (process.env.API_KEY)
if (extractedKey) {
  (window as any).process.env.API_KEY = extractedKey;
  console.log('LifeOS System: API Key injected successfully.');
} else {
  console.warn('LifeOS System: VITE_API_KEY not found. Please set it in Vercel Environment Variables and REDEPLOY.');
}

// Register Service Worker for PWA/Capacitor
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful');
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);