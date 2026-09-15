import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from "firebase/auth";

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
let googleProvider: GoogleAuthProvider | null = null;

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
}

export { app, auth, googleProvider };

/** Opens the Google sign-in popup. The signed-in user arrives through onAuthStateChanged. */
export async function signInWithGoogle(): Promise<void> {
  const { auth: clientAuth, googleProvider: provider } = getClientAuth();
  if (!clientAuth || !provider) {
    throw new Error("Google sign-in is not available on this site yet.");
  }
  await signInWithPopup(clientAuth, provider);
}

/** ID token for the signed-in Firebase user, or null. API routes verify it server-side. */
export async function getIdToken(): Promise<string | null> {
  const { auth: clientAuth } = getClientAuth();
  if (!clientAuth) return null;
  await clientAuth.authStateReady();
  return (await clientAuth.currentUser?.getIdToken()) ?? null;
}

export async function signOutFirebase(): Promise<void> {
  const { auth: clientAuth } = getClientAuth();
  if (clientAuth) await signOut(clientAuth);
}
