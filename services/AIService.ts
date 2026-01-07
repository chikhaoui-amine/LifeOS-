import { FirebaseService } from './FirebaseService';

/**
 * Replace this URL with your actual Firebase Cloud Function URL 
 * after you deploy the backend code in functions/index.js
 */
const PROD_URL = 'https://us-central1-lifeos-c12c6.cloudfunctions.net/api/ai';
const DEV_URL = 'http://localhost:5001/lifeos-c12c6/us-central1/api/ai';

const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? DEV_URL : PROD_URL;

export const AIService = {
  /**
   * Proxies generateContent requests to the secure backend.
   */
  generateResponse: async (params: { 
    prompt?: string; 
    contents?: any; 
    config?: any; 
    model?: string; 
  }) => {
    const auth = FirebaseService.auth;
    const user = auth?.currentUser;
    
    if (!user) {
      throw new Error("Authentication required for AI features. Please connect your Google Account in Settings.");
    }

    try {
      // 1. Get the Firebase ID Token to prove identity to the backend
      const idToken = await user.getIdToken(true);

      // 2. Call the absolute backend URL
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Strategic Engine error: ${response.status}`);
      }

      return await response.json();
    } catch (e: any) {
      console.error("AI Service Error:", e);
      throw new Error(e.message || "Failed to communicate with AI Strategist.");
    }
  }
};