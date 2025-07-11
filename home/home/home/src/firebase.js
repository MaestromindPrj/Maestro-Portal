// ✅ Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBeRO8OYOdTPDUrZb8yDt8jOGDofaVr0aU",
    authDomain: "circletab-7c669.firebaseapp.com",
    projectId: "circletab-7c669",
    storageBucket: "circletab-7c669.firebasestorage.app",
    messagingSenderId: "312329825506",
    appId: "1:312329825506:web:27cf25aa737fe36bb5c2bb",
    measurementId: "G-WWGP8D3NSK"
};

const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
export const auth = getAuth(app);
// ✅ Export services and firestore functions you need
export { db, storage, collection, addDoc, serverTimestamp, getDocs };
