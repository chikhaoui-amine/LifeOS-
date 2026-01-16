
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
  enableIndexedDbPersistence,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { BackupData } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBVij7Op3syRyNkf74dywyepxnQ1Y94ers",
  authDomain: "lifeos-c12c6.firebaseapp.com",
  projectId: "lifeos-c12c6",
  storageBucket: "lifeos-c12c6.firebasestorage.app",
  messagingSenderId: "930274272186",
  appId: "1:930274272186:web:d45482df340e67bf8fb383",
  measurementId: "G-VQ3KXPQPT2"
};

let app: any;
let auth: any;
let db: any;
let provider: any;

const initializeFirebase = () => {
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    try {
      // Fix: Check for custom configuration override in localStorage before initialization
      let config = firebaseConfig;
      const override = localStorage.getItem('lifeos_firebase_config_override');
      if (override) {
        try {
          config = JSON.parse(override);
          console.log("LifeOS Cloud: Using custom Firebase configuration.");
        } catch (e) {
          console.error("LifeOS Cloud: Failed to parse config override.");
        }
      }
      app = initializeApp(config);
    } catch (e) {
      console.error("LifeOS Cloud: Initialization failed:", e);
    }
  }

  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') console.warn('Cloud Persistence restricted: Multiple tabs.');
      });
    }
  }
};

initializeFirebase();

export const FirebaseService = {
  get auth() { return auth; },
  get db() { return db; },
  currentUser: null as User | null,

  init: (onUserChange: (user: User | null) => void) => {
    if (!auth) initializeFirebase();
    return onAuthStateChanged(auth, (user) => {
      console.log(`LifeOS Auth: State change -> ${user ? user.email : 'No User'}`);
      FirebaseService.currentUser = user;
      onUserChange(user);
    });
  },

  signIn: async () => {
    console.log("LifeOS Auth: Initiating Google Gateway...");
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') return await signInWithRedirect(auth, provider);
      throw error;
    }
  },

  signOut: async () => {
    console.log("LifeOS Auth: Closing Cloud Channel...");
    await firebaseSignOut(auth);
  },

  // Fix: Added saveConfiguration method to allow custom Firebase setup
  saveConfiguration: (config: any) => {
    localStorage.setItem('lifeos_firebase_config_override', JSON.stringify(config));
    window.location.reload();
  },

  saveUserData: async (data: BackupData) => {
    if (!auth?.currentUser || !db) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    
    const timestamp = new Date().toISOString();
    console.log(`LifeOS Sync: Pushing local state to cloud [${timestamp}]...`);

    try {
      await setDoc(userRef, {
        ...data,
        exportDate: timestamp,
        updatedAt: serverTimestamp(), // Use Firestore server time for reliable ordering
        metadata: {
          platform: navigator.platform,
          v: "2.0"
        }
      }, { merge: true }); // Crucial: use merge to prevent wiping out unexpected fields
      console.log("LifeOS Sync: Cloud push successful.");
    } catch (error) {
      console.error("LifeOS Sync: Cloud push failed:", error);
      throw error;
    }
  },

  fetchCloudData: async () => {
    if (!auth?.currentUser || !db) return null;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() as BackupData : null;
  }
};

export type { User };
