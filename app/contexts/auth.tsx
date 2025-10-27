import React, { createContext, useEffect, useState } from "react";
import { authService } from "~/services/auth";
import type { LoginCredentials, CurrentUser } from "~/types/auth";

interface AuthContext {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ({ identifier, password }: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const authContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const userData = await authService.getMe();
          setIsAuthenticated(true);
          setUser(userData);
        } catch (error) {
          setUser(null);
          localStorage.removeItem("token");
        } finally {
          setIsLoading(false);
        }
      }
      setIsLoading(false);
    };

    getUser();
  }, []);

  async function login({ identifier, password }: LoginCredentials) {
    try {
      setIsLoading(true);
      const {
        access_token,
        token_type,
        usuario: currentUser,
      } = await authService.login({ identifier, password });
      localStorage.setItem("token", access_token);
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    //await authService.logout();

    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <authContext.Provider
      value={{ user, setUser, isLoading, isAuthenticated, login, logout }}
    >
      {children}
    </authContext.Provider>
  );
}
