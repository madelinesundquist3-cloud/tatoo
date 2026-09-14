import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 5
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function getClientDb(): Firestore | null {
  if (typeof window !== "undefined" && isFirebaseConfigured) {
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }
    if (!db && app) {
      try {
        db = getFirestore(app);
      } catch (e) {
        console.warn("Firestore not yet initialized in console:", e);
      }
    }
  }
  return db;
}

export function getClientAuth(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
} {
  if (typeof window !== "undefined" && isFirebaseConfigured) {
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }
    if (!auth && app) {
      auth = getAuth(app);
    }
    if (!googleProvider) {
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
    }
  }
  return { app, auth, googleProvider };
}

// Pre-initialize on browser load if possible
if (typeof window !== "undefined") {
  getClientAuth();
  getClientDb();
}

export { app, auth, db, googleProvider };

export interface NormalizedGoogleUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
}

/**
 * Sign in with Google using Firebase Authentication.
 * If Firebase keys are configured, opens the official Google popup.
 * If keys are pending in .env.local, provides a simulated Google test account.
 */
export async function loginWithFirebaseGoogle(): Promise<NormalizedGoogleUser> {
  const { auth: clientAuth, googleProvider: clientProvider } = getClientAuth();

  if (isFirebaseConfigured && clientAuth && clientProvider) {
    try {
      const result = await signInWithPopup(clientAuth, clientProvider);
      const fbUser: FirebaseUser = result.user;

      const email = fbUser.email || "collector@gmail.com";
      const cleanUsername =
        fbUser.displayName
          ? fbUser.displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")
          : email.split("@")[0];

      return {
        id: fbUser.uid,
        name: fbUser.displayName || "Google User",
        username: cleanUsername || `user_${fbUser.uid.slice(0, 6)}`,
        email: email,
        avatarUrl:
          fbUser.photoURL ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      };
    } catch (error: unknown) {
      console.error("Firebase Google Auth Error:", error);
      throw error;
    }
  } else {
    // Fallback demo simulation when Firebase environment keys are not yet pasted
    console.warn(
      "Firebase environment keys not detected in .env.local. Running demo Google sign-in simulation."
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      id: "google-demo-" + Date.now(),
      name: "Alex Rivera",
      username: "alex_rivera",
      email: "alex.rivera@gmail.com",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    };
  }
}
