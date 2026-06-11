// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";  // ← THIS LINE is required
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClM8hKoCd7m14ms-UssIAZSXpAXNlOF3k",
  authDomain: "cmststing.firebaseapp.com",
  projectId: "cmststing",
  storageBucket: "cmststing.firebasestorage.app",
  messagingSenderId: "779240743693",
  appId: "1:779240743693:web:f19100f471880d351a8644",
  measurementId: "G-VN9ZEXSNNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);