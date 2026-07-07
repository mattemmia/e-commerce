import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase'; 
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // ADDED for signup
  signOut,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // ADDED

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // HELPER: Create user doc if it doesn't exist
  const createUserDocument = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        role: 'user', // default. Change to 'admin' manually in firebase
        createdAt: serverTimestamp(),
      });
      console.log("Created user doc for:", user.uid);
    }
  };

  const signup = async (email, password, name) => { // ADDED SIGNUP
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument({...result.user, displayName: name}); // create doc
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user); // create doc if missing for old users
      return result.user;
    } catch (error) {
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      if (error.code === 'auth/wrong-password') message = 'Wrong password';
      if (error.code === 'auth/invalid-email') message = 'Invalid email format';
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user); // create doc for google users too
      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Popup closed before login completed');
      }
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth).then(() => {
      alert('Session expired. Please log in again.');
    });
  };

  useEffect(() => {
    let unsubscribe;
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        console.log("Auth persistence: SESSION mode");

        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log("Auth user:", currentUser?.uid || 'no user');
          setUser(currentUser);
          setLoading(false);
        }, (error) => {
          console.error("Auth state error:", error);
          setLoading(false);
        });
      } catch (error) {
        console.error("Persistence error:", error);
        setLoading(false);
      }
    };
    initAuth();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const value = { user, signup, login, loginWithGoogle, logout, loading }; // ADDED signup

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};