"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

export type UserRole = "Student" | "Recruiter" | "Admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        setCurrentUser(null);
        return;
      }

      const data = await response.json();
      setCurrentUser(data.user ?? null);
    } catch (error) {
      console.error("Unable to load current user:", error);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) setCurrentUser(null);
          return;
        }

        const data = await response.json();

        if (active) {
          setCurrentUser(data.user ?? null);
        }
      } catch (error) {
        console.error("Unable to load current user:", error);

        if (active) setCurrentUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      setCurrentUser(null);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}