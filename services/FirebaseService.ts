import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  enableIndexedDbPersistence
} from "firebase/firestore";
import { BackupData } from '../types';

const getFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lifeos_firebase_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored firebase config", e);
      }
    }
  }
  
  return {
    apiKey: "AIzaSyBVij7Op3syRyNkf74dywyepxnQ1Y94ers",
    authDomain: "lifeos-c12c6.firebaseapp.com",
    projectId: "lifeos-c12c6",
    storageBucket: "lifeos-c12c6.firebasestorage.app",
    messagingSenderId: "930274272186",
    appId: "1:930274272186:web:d45482df340e67bf8fb383",
    measurementId: "G-VQ3KXPQPT2"
  };
};

const firebaseConfig = getFirebaseConfig();

let app: any;
let auth: any;
let db: any;
let provider: any;

const initializeFirebase = () => {
  if (!firebaseConfig || !firebaseConfig.apiKey) return;

  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase init failed:", e);
    }
  }

  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      // Set persistence to Local
      setPersistence(auth, browserLocalPersistence).catch(console.error);

      // Enable offline persistence for Firestore
      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firestore Persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            console.warn('Firestore Persistence failed: Browser not supported');
          }
        });
      }
    } catch(e) {
      console.error("Firebase services init failed:", e);
    }
  }
};

initializeFirebase();

export const FirebaseService = {
  get auth() { return auth; },
  get db() { return db; },
  currentUser: null as User | null,

  isConfigured: (): boolean => !!auth,

  init: (onUserChange: (user: User | null) => void) => {
    if (!auth) {
      // Re-try initialization once if called and auth is missing
      initializeFirebase();
      if (!auth) return () => {};
    }
    
    // Process redirect results immediately on load
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("LifeOS Auth: Redirect sign-in successful.");
        }
      })
      .catch((error) => {
        console.error("Firebase Redirect Result Error:", error);
      });

    return onAuthStateChanged(auth, (user: User | null) => {
      FirebaseService.currentUser = user;
      onUserChange(user);
    });
  },

  signIn: async (): Promise<User | void> => {
    if (!auth) {
      initializeFirebase();
      if (!auth) throw new Error("Firebase not configured properly.");
    }
    
    // Check if we are in a native app context or a restricted browser
    const isNative = typeof window !== 'undefined' && 
      (window.location.protocol === 'file:' || (window as any).Capacitor);
    
    try {
      if (isNative) {
        // Native apps usually block popups
        await signInWithRedirect(auth, provider);
        return; 
      } else {
        // Web browsers prefer popups for better SPA experience
        try {
          const result = await signInWithPopup(auth, provider);
          return result.user;
        } catch (popupError: any) {
          // Fallback to redirect if popup is blocked or fails
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error) {
      console.error("Firebase Sign In Error:", error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      FirebaseService.currentUser = null;
    } catch (error) {
      console.error("Firebase Sign Out Error:", error);
      throw error;
    }
  },

  saveConfiguration: (config: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_firebase_config', JSON.stringify(config));
      window.location.reload(); 
    }
  },

  saveUserData: async (data: BackupData): Promise<void> => {
    if (!auth?.currentUser || !db) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { 
        backupData: data, 
        lastUpdated: new Date().toISOString(),
        metadata: {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          version: data.appVersion
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firebase Cloud Save Error:", error);
      throw error;
    }
  },

  subscribeToUserData: (onDataReceived: (data: BackupData) => void) => {
    if (!auth?.currentUser || !db) return () => {};

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.metadata.hasPendingWrites) return;

      if (docSnap.exists()) {
        const content = docSnap.data();
        if (content?.backupData) {
          onDataReceived(content.backupData as BackupData);
        }
      }
    });
  }
};

export type { User };