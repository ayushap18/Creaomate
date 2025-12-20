import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGOocTVAtv7S1H0_MkzBIdRUNAK90Mhsk",
  authDomain: "artisianx.firebaseapp.com",
  projectId: "artisianx",
  storageBucket: "artisianx.firebasestorage.app",
  messagingSenderId: "680254729194",
  appId: "1:680254729194:web:b01af3b69221bbd5596093",
  measurementId: "G-HD4MLMP8VS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, db, analytics };