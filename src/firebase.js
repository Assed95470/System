// filepath: c:\Users\Saizo\quest-app\src\firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- AJOUTER CETTE LIGNE

// La configuration Firebase de VOTRE application
const firebaseConfig = {
  apiKey: "AIzaSyDsGJLjMUGEB0KEbkmXwB2UGIsjXDKeDCw",
  authDomain: "system-27b00.firebaseapp.com",
  projectId: "system-27b00",
  storageBucket: "system-27b00.firebasestorage.app", // <-- CORRECTION
  messagingSenderId: "205718591075",
  appId: "1:205718591075:web:b5d2dd904cc6f175f9ca56"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter l'instance de la base de données Firestore pour l'utiliser dans l'application
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- AJOUTER CETTE LIGNE