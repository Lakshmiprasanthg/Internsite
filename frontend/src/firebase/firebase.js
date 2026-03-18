// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const missingFirebaseVars = [
  !firebaseApiKey && "NEXT_PUBLIC_FIREBASE_API_KEY",
  !firebaseAuthDomain && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  !firebaseProjectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  !firebaseStorageBucket && "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  !firebaseMessagingSenderId && "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  !firebaseAppId && "NEXT_PUBLIC_FIREBASE_APP_ID",
].filter(Boolean);

if (missingFirebaseVars.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingFirebaseVars.join(", ")}`
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
