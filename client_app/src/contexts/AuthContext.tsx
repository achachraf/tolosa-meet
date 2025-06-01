import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  joinedAt: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (displayName?: string, bio?: string) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await apiService.getToken();
      if (token) {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(response.data.user);
        } else {
          // Token is invalid, remove it
          await apiService.removeToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.signIn(email, password);
      
      if (response.success) {
        await apiService.saveToken(response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Sign in failed');
        return false;
      }
    } catch (error) {
      setError('Network error occurred');
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.signUp(email, password, displayName);
      
      if (response.success) {
        await apiService.saveToken(response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Sign up failed');
        return false;
      }
    } catch (error) {
      setError('Network error occurred');
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    await apiService.removeToken();
    setUser(null);
  };

  const updateProfile = async (displayName?: string, bio?: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.updateProfile(displayName, bio);
      
      if (response.success) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Profile update failed');
        return false;
      }
    } catch (error) {
      setError('Network error occurred');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
