"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Company, CompanySummary, AuthResponse } from "@/types";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  currentCompany: Company | null;
  availableCompanies: CompanySummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    currency?: string;
  }) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<CompanySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("bt_access_token");
      const savedUser = localStorage.getItem("bt_user");
      const savedCompany = localStorage.getItem("bt_company");
      const savedCompanies = localStorage.getItem("bt_available_companies");

      if (token && savedUser && savedCompany) {
        try {
          setUser(JSON.parse(savedUser));
          setCurrentCompany(JSON.parse(savedCompany));
          if (savedCompanies) {
            setAvailableCompanies(JSON.parse(savedCompanies));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const saveAuthSession = (auth: AuthResponse) => {
    localStorage.setItem("bt_access_token", auth.accessToken);
    localStorage.setItem("bt_refresh_token", auth.refreshToken);
    localStorage.setItem("bt_user", JSON.stringify(auth.user));
    localStorage.setItem("bt_company", JSON.stringify(auth.currentCompany));
    localStorage.setItem("bt_available_companies", JSON.stringify(auth.availableCompanies));

    setUser(auth.user);
    setCurrentCompany(auth.currentCompany);
    setAvailableCompanies(auth.availableCompanies);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    saveAuthSession(res);
    router.push("/dashboard");
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    currency?: string;
  }) => {
    const res = await api.register(data);
    saveAuthSession(res);
    router.push("/dashboard");
  };

  const switchCompany = async (companyId: string) => {
    const res = await api.switchCompany(companyId);
    saveAuthSession(res);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("bt_access_token");
    localStorage.removeItem("bt_refresh_token");
    localStorage.removeItem("bt_user");
    localStorage.removeItem("bt_company");
    localStorage.removeItem("bt_available_companies");
    setUser(null);
    setCurrentCompany(null);
    setAvailableCompanies([]);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentCompany,
        availableCompanies,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        switchCompany,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
