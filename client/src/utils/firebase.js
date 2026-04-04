
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviwewiq.firebaseapp.com",
  projectId: "interviwewiq",
  storageBucket: "interviwewiq.firebasestorage.app",
  messagingSenderId: "383165590547",
  appId: "1:383165590547:web:9eb20cdce67925d596a3e6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export{auth,provider}