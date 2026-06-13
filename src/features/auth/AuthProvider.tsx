"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/services/firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guest Mode: Bypass Firebase Auth and use a mock guest user
    const guestIdKey = "carbontwin_guest_id";
    let guestId = localStorage.getItem(guestIdKey);
    if (!guestId) {
      guestId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : "guest_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(guestIdKey, guestId);
    }
    
    setUser({
      uid: guestId,
      displayName: "Guest Explorer",
      email: "guest@carbontwin.app",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + guestId,
    } as User);
    
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
