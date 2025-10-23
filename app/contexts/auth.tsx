import React, { createContext, useEffect, useState } from "react";
import { authService } from "~/services/AuthService";
import type { LoginCredentials, User } from "~/types/auth";

interface AuthContext {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ({ identifier, password }: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const authContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await authService.getMe();
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  async function login({ identifier, password }: LoginCredentials) {
    try {
      setIsLoading(true);
      await authService.login({ identifier, password });
      const userData = await authService.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
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
