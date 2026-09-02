import React, { createContext, useState, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://119.59.102.161:3023/api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      // admin_new with 123456 is the admin account
      const role: UserRole =
        username === 'admin_new' && password === '123456' ? 'admin' : 'user';

      // Setting user triggers navigation guard in _layout.tsx automatically
      setUser({ username, role });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errMsg = 'Registration failed';
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      // On success, caller can navigate to login (handled in register screen)
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Setting user to null triggers navigation guard in _layout.tsx automatically
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
