import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";

export const isFirebaseConfigured: boolean = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

if (!isFirebaseConfigured && process.env.NODE_ENV === "development") {
  console.warn(
    "[SARA] Firebase env vars not found in .env.local — " +
      "using dummy data fallback. Copy .env.local.example → .env.local and fill in credentials.",
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ── Lazy singletons (only initialise when configured) ─────────────────────────

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("[SARA] Firebase is not configured. Fill in .env.local.");
  }
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

/** Firestore instance — throws if Firebase is not configured */
export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

/** Auth instance — throws if Firebase is not configured */
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

/**
 * Ensures a user session exists (anonymous if not signed in).
 * This satisfies Firestore rules that require isSignedIn().
 * Replace with real Auth flow in Day 4.
 */
// Convenience re-exports for components that always run after config check
export { getApps };

// ── Export constants untuk kompatibilitas dengan file buatan Claude ──
// Karena kode baru langsung meng-import db dan auth (bukan via fungsi getDb),
// kita inisialisasi di sini jika env sudah terkonfigurasi.
export const app = isFirebaseConfigured ? getFirebaseApp() : (null as unknown as FirebaseApp);
export const db = isFirebaseConfigured ? getDb() : (null as unknown as Firestore);
export const auth = isFirebaseConfigured ? getFirebaseAuth() : (null as unknown as Auth);
