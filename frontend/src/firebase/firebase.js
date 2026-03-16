// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOq-G8Q857i04mAtpRG4Ik26Id8H2ZCHY",
  authDomain: "internsite-b1582.firebaseapp.com",
  projectId: "internsite-b1582",
  storageBucket: "internsite-b1582.firebasestorage.app",
  messagingSenderId: "932632903308",
  appId: "1:932632903308:web:750768d8e47ae93c14c5a9"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
