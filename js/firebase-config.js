// js/firebase-config.js

// firebase libs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvSC8Du-2nFu_R1F-7pQ1QgbFCBoHTiLE",
  authDomain: "unigig-56d83.firebaseapp.com",
  projectId: "unigig-56d83",
  storageBucket: "unigig-56d83.firebasestorage.app",
  messagingSenderId: "130308083368",
  appId: "1:130308083368:web:dbbeadf082ee2cc0aefc9d",
  measurementId: "G-RXQ24H5GDF"
};

// init
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// exports
export const auth = getAuth(app);
export const db = getFirestore(app);
