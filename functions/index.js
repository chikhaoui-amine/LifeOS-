
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();

/**
 * Secure AI Proxy Endpoint
 * Validates Firebase Auth Token and returns Gemini response.
 */
exports.ai = functions.https.onRequest(async (req, res) => {
  // 1. Enable CORS for mobile/APK origin
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // 2. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: "Unauthorized: Missing Token" });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);

    // 3. Initialize Gemini with secure server-side API Key
    // Note: The key should be set in Firebase via: firebase functions:secrets:set API_KEY
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      res.status(500).json({ message: "Server configuration error: Missing API Key" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, contents, config, model } = req.body;

    // 4. Generate Content following SDK rules
    const response = await ai.models.generateContent({
      model: model || 'gemini-3-flash-preview',
      contents: contents || prompt,
      config: config || {}
    });

    // 5. Return payload
    res.json({
      text: response.text,
      functionCalls: response.functionCalls || null
    });

  } catch (error) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ message: error.message });
  }
});
