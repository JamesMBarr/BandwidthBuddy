import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  collection,
} from "firebase/firestore";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyDClxlWoMr5cZMs9cmVWJ2tMYS35AIGzFg",
  authDomain: "internet-monitor-8c155.firebaseapp.com",
  projectId: "internet-monitor-8c155",
  storageBucket: "internet-monitor-8c155.appspot.com",
  messagingSenderId: "362961223996",
  appId: "1:362961223996:web:121b4293af3e3f18f9de39",
});

export const auth = getAuth();

export const db = getFirestore(firebaseApp);
export const measurementsRef = collection(db, "measurements");

if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}
