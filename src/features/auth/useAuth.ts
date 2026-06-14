"use client";

import { useAuthContext } from "./AuthProvider";
import { signOut } from "@/services/firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { User } from "firebase/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  const handleSignIn = useCallback(async () => {
    router.push("/dashboard");
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/login");
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
