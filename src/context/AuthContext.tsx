/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, RegisterData } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  async function checkAuth(): Promise<void> {
    try {
      const userData = await apiService.getCurrentUser();
      if (userData && typeof userData === 'object' && 'id' in userData) {
        setUser(userData as User);
        setIsAuthenticated(true);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<void> {
    await apiService.login(username, password);
    await checkAuth();
  }

  async function register(data: RegisterData): Promise<void> {
    await apiService.register(data);
    await checkAuth();
  }

  async function logout(): Promise<void> {
    await apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{!loading ? children : null}</AuthContext.Provider>
  );
}
