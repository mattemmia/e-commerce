import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyBfwtyJQNfhBi2TJSHBWDEa-ewdLG5KCyo",
  authDomain: "e-commerced.firebaseapp.com",
  projectId: "e-commerced",
  storageBucket: "e-commerced.firebasestorage.app",
  messagingSenderId: "228647938373",
  appId: "1:228647938373:web:ebeaceec27743e2ccb362c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;