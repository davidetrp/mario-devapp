import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { apiService } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('mario_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Try to get current user from API
    const response = await apiService.getCurrentUser();
    if (response.success && response.data) {
      setAuthState({
        user: response.data,
        isAuthenticated: true,
      });
    } else {
      // Token is invalid, remove it
      localStorage.removeItem('mario_token');
      localStorage.removeItem('mario_user');
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('mario_token', token);
        localStorage.setItem('mario_user', JSON.stringify(user));
        setAuthState({ user, isAuthenticated: true });
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to localStorage for development/demo
      const user: User = {
        id: Date.now().toString(),
        email,
        username: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      localStorage.setItem('mario_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      const response = await apiService.register(email, password, username);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('mario_token', token);
        localStorage.setItem('mario_user', JSON.stringify(user));
        setAuthState({ user, isAuthenticated: true });
        return true;
      } else {
        console.error('Registration failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to localStorage for development/demo
      const user: User = {
        id: Date.now().toString(),
        email,
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      };
      localStorage.setItem('mario_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('mario_token');
    localStorage.removeItem('mario_user');
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};