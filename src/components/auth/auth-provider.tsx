"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: { token: string; user: User }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncUser() {
      if (!token) {
        if (!cancelled) {
          setIsReady(true);
        }
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (!cancelled) {
          setAuth({ token, user: currentUser });
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [clearAuth, setAuth, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isReady,
      login: async ({ token: nextToken, user: nextUser }) => {
        setAuth({ token: nextToken, user: nextUser });
        setIsReady(true);
      },
      logout: () => {
        clearAuth();
        setIsReady(true);
      },
    }),
    [clearAuth, isReady, setAuth, token, user]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
