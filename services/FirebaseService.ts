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
        console.error("Failed to parse custom firebase config", e);
      }
    }
  }
  
  // Default Project Credentials
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
      console.error("Firebase Core Initialization failed:", e);
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

      setPersistence(auth, browserLocalPersistence).catch(e => console.warn("Persistence set error", e));

      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firestore Persistence restricted (Multiple tabs open)');
          } else if (err.code === 'unimplemented') {
            console.warn('Firestore Persistence unsupported by browser');
          }
        });
      }
    } catch(e) {
      console.error("Firebase Service Initialization failed:", e);
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
      initializeFirebase();
      if (!auth) return () => {};
    }
    
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) console.log("LifeOS Auth: Verified redirect session.");
      })
      .catch((error) => {
        console.error("Firebase Redirect Resolution Error:", error);
      });

    return onAuthStateChanged(auth, (user: User | null) => {
      FirebaseService.currentUser = user;
      onUserChange(user);
    });
  },

  signIn: async (): Promise<User | void> => {
    if (!auth) {
      initializeFirebase();
      if (!auth) throw new Error("Cloud subsystem not configured.");
    }
    
    const isRestrictedEnv = typeof window !== 'undefined' && 
      (window.location.protocol === 'file:' || (window as any).Capacitor || navigator.userAgent.includes('wv'));
    
    try {
      if (isRestrictedEnv) {
        await signInWithRedirect(auth, provider);
        return; 
      } else {
        try {
          const result = await signInWithPopup(auth, provider);
          return result.user;
        } catch (popupError: any) {
          if (['auth/popup-blocked', 'auth/cancelled-popup-request', 'auth/popup-closed-by-user'].includes(popupError.code)) {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error("Sign-In Gateway Error:", error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      FirebaseService.currentUser = null;
    } catch (error) {
      console.error("Sign-Out Gateway Error:", error);
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
        lastUpdated: data.exportDate, // Use the actual export timestamp
        serverTimestamp: new Date().toISOString(),
        metadata: {
          platform: navigator.platform,
          version: data.appVersion
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firestore Upload Failed:", error);
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
    }, (error) => {
      console.warn("Firestore Snapshot Subscription error:", error);
    });
  }
};

export type { User };