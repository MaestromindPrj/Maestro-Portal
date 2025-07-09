// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
/* import { getAnalytics } from "firebase/analytics"; */
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDttf-yLIrHFUqjCUClFk0jwLEkPnLqKg",
  authDomain: "coursepage-94c66.firebaseapp.com",
  projectId: "coursepage-94c66",
  storageBucket: "coursepage-94c66.firebasestorage.app",
  messagingSenderId: "783558679793",
  appId: "1:783558679793:web:806e05bc97244bb2051d50",
  measurementId: "G-5Y969DQ7JP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
/* const analytics = getAnalytics(app); */

export default app;