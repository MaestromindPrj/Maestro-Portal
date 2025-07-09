
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQ1yumkXXBRKPSePPhSb3WpqTp2VtMdHM",
  authDomain: "maestrominds-59d43.firebaseapp.com",
  projectId: "maestrominds-59d43",
  storageBucket: "maestrominds-59d43.firebasestorage.app",
  messagingSenderId: "415810131047",
  appId: "1:415810131047:web:b0f970c8653d1f47c5b0c2",
  measurementId: "G-XMRT218VNL"
};


const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);