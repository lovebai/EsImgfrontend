'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated on component mount
    const token = localStorage.getItem('token');
    const expireAt = localStorage.getItem('expireAt');
    
    if (token && expireAt) {
      const expireTime = parseInt(expireAt, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is still valid
      if (expireTime > currentTime) {
        setIsAuthenticated(true);
      } else {
        // Token expired, remove it and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('expireAt');
        setIsAuthenticated(false);
        router.push('/login');
      }
    }
  }, [router]);

  const login = async (username: string, password: string, turnstileToken?: string): Promise<boolean> => {
    try {
      // Call the API login function with Turnstile token
      const result = await apiLogin(username, password, turnstileToken);
      if (result) {
        // Store token and expiration time
        localStorage.setItem('token', result.token);
        localStorage.setItem('expireAt', result.expireAt.toString());
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('expireAt');
    setIsAuthenticated(false);
    // Redirect to login page
    router.push('/login');
  };

  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}