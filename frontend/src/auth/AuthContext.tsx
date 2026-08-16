import { createContext, useContext, useState, type ReactNode } from "react";
import { api, setAuthToken, getAuthToken } from "../api/client";
import type { AuthUser, Role } from "../api/types";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (phone: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; phone: string; password: string; role: Role; city: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "lunda_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!getAuthToken()) return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  function persist(res: AuthResponse) {
    setAuthToken(res.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }

  async function login(phone: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { phone, password });
    return persist(res);
  }

  async function register(input: { name: string; phone: string; password: string; role: Role; city: string }) {
    const res = await api.post<AuthResponse>("/auth/register", input);
    return persist(res);
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
