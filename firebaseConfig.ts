import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBk_ZW9vQtS05PLBHzaY899hghZxY0Z_F0",
  authDomain: "artisan-ally-4a1b2.firebaseapp.com",
  projectId: "artisan-ally-4a1b2",
  storageBucket: "artisan-ally-4a1b2.appspot.com",
  messagingSenderId: "97173971420",
  appId: "1:97173971420:web:b51fe16b00552adf546f19",
  measurementId: "G-7GQCME87ZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Connect to the specific database named 'ananyaa' instead of the default.
const db = getFirestore(app, "ananyaa");

export { app, db };