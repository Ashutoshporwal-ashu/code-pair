// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAf8EJlzjr5zzEZY0BpfcJ2sBU4afGLOzY",
  authDomain: "code-sync-15c65.firebaseapp.com",
  projectId: "code-sync-15c65",
  storageBucket: "code-sync-15c65.firebasestorage.app",
  messagingSenderId: "881283922284",
  appId: "1:881283922284:web:5752fa88186ff56bc49b49",
  measurementId: "G-KFQ6LCQLGC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();