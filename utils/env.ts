
/**
 * reliably retrieves the Google API Key from various environment configurations.
 * This handles differences between local Vite dev, Vercel deployments, and runtime injections.
 */
export const getApiKey = (): string => {
  let key = '';

  // Priority 1: Vite Environment Variable (Build time replacement)
  // This is the standard way for Vercel + Vite
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // Priority 2: Global Process Env (injected by index.tsx or Webpack)
  if (!key && typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) key = process.env.API_KEY;
    if (process.env.VITE_API_KEY) key = process.env.VITE_API_KEY;
  }

  // Priority 3: Window Object Polyfill (Runtime injection fallback)
  if (!key && typeof window !== 'undefined') {
    const win = window as any;
    if (win.process?.env?.API_KEY) key = win.process.env.API_KEY;
    if (win.process?.env?.VITE_API_KEY) key = win.process.env.VITE_API_KEY;
  }

  return key || '';
};
