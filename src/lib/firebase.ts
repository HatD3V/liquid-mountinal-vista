import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiefjFAFg5HEVEr5US3g06uz0fcSUV2Tc",
  authDomain: "mountinalcorp.firebaseapp.com",
  projectId: "mountinalcorp",
  storageBucket: "mountinalcorp.firebasestorage.app",
  messagingSenderId: "23550323958",
  appId: "1:23550323958:web:4b55e34acd59630dc250d7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
