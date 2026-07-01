"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

type AuthContextType = {
  user: User | null;
  username: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, username: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().username) {
            setUsername(snap.data().username);
          } else {
            setUsername(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, username, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
