// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvSC8Du-2nFu_R1F-7pQ1QgbFCBoHTiLE",
  authDomain: "unigig-56d83.firebaseapp.com",
  projectId: "unigig-56d83",
  storageBucket: "unigig-56d83.firebasestorage.app",
  messagingSenderId: "130308083368",
  appId: "1:130308083368:web:dbbeadf082ee2cc0aefc9d",
  measurementId: "G-RXQ24H5GDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
