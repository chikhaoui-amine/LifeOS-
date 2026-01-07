import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
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
  if (!firebaseConfig) return;

  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase init failed", e);
    }
  }

  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // Enable offline persistence for seamless multi-device flow
      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
          } else if (err.code == 'unimplemented') {
            console.warn('Persistence failed: Browser not supported');
          }
        });
      }
    } catch(e) {
      console.warn("Firebase services init failed", e);
    }
  }
};

initializeFirebase();

export const FirebaseService = {
  auth,
  db,
  currentUser: null as User | null,

  isConfigured: (): boolean => !!auth,

  init: (onUserChange: (user: User | null) => void) => {
    if (!auth) return () => {};
    
    getRedirectResult(auth).catch((error) => {
      console.error("Firebase Redirect Result Error:", error);
    });

    return onAuthStateChanged(auth, (user: User | null) => {
      FirebaseService.currentUser = user;
      onUserChange(user);
    });
  },

  signIn: async (): Promise<User | void> => {
    if (!auth) throw new Error("Firebase not configured");
    
    const isNative = typeof window !== 'undefined' && 
      (window.location.protocol === 'file:' || 
       (window as any).Capacitor || 
       /Android|iPhone|iPad/i.test(navigator.userAgent));
    
    try {
      if (isNative) {
        await signInWithRedirect(auth, provider);
        return; 
      } else {
        const result = await signInWithPopup(auth, provider);
        return result.user;
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
    } catch (error) {
      console.error("Firebase Sign Out Error:", error);
      throw error;
    }
  },

  // Add missing saveConfiguration method to fix property error in FirebaseConfigModal
  saveConfiguration: (config: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_firebase_config', JSON.stringify(config));
      // Reload to re-initialize Firebase with the user's provided settings
      window.location.reload(); 
    }
  },

  /**
   * Saves the entire state snapshot to the user's cloud profile.
   */
  saveUserData: async (data: BackupData): Promise<void> => {
    if (!auth || !auth.currentUser) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { 
        backupData: data, 
        lastUpdated: new Date().toISOString(),
        metadata: {
          platform: navigator.platform,
          userAgent: navigator.userAgent
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firebase Cloud Save Error:", error);
      throw error;
    }
  },

  /**
   * Listens for changes from other devices.
   */
  subscribeToUserData: (onDataReceived: (data: BackupData) => void) => {
    if (!auth || !auth.currentUser) return () => {};

    const userRef = doc(db, "users", auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      // Don't trigger a sync for writes that happened locally
      if (docSnap.metadata.hasPendingWrites) return;

      if (docSnap.exists()) {
        const content = docSnap.data();
        if (content && content.backupData) {
          onDataReceived(content.backupData as BackupData);
        }
      }
    });

    return unsubscribe;
  }
};

export type { User };