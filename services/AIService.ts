
import { FirebaseService } from './FirebaseService';

/**
 * Replace this URL with your actual Firebase Cloud Function URL 
 * after you deploy the backend code in functions/index.js
 */
const PROD_URL = 'https://us-central1-lifeos-c12c6.cloudfunctions.net/api/ai';
const DEV_URL = 'http://localhost:5001/lifeos-c12c6/us-central1/api/ai';

const BACKEND_URL = window.location.hostname === 'localhost' ? DEV_URL : PROD_URL;

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
    const user = FirebaseService.auth?.currentUser;
    if (!user) throw new Error("Authentication required for AI features.");

    // 1. Get the Firebase ID Token to prove identity to the backend
    const idToken = await user.getIdToken();

    // 2. Call the absolute backend URL (Required for APK compatibility)
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
      throw new Error(errorData.message || `AI Proxy Error: ${response.status}`);
    }

    return await response.json();
  }
};
