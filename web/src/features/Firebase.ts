import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCLgLEB72JJL13ihJgRkyEQl8bwVJKR2Bc",
  authDomain: "vault-f7191.firebaseapp.com",
  projectId: "vault-f7191",
  storageBucket: "vault-f7191.firebasestorage.app",
  messagingSenderId: "875140524783",
  appId: "1:875140524783:web:6ad405ec902d75c4eb491a",
  measurementId: "G-62X4TNZCLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);

export default auth;
