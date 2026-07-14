"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { authService } from "@/services/authService";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_COOKIE = "access_token";
const TOKEN_EXPIRY_DAYS = 1;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      Cookies.remove(TOKEN_COOKIE);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    Cookies.set(TOKEN_COOKIE, data.access_token, { expires: TOKEN_EXPIRY_DAYS, sameSite: "lax" });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_COOKIE);
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
