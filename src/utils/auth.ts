'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { markUserAsNew, clearNewUserFlag } from '@/utils/onboarding';

// Define user types
export interface User {
  id: number;
  email: string;
  role: string;
  artistId?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Initialize with a real implementation
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null
});

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For demo: Check localStorage for a user session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);

    try {
      // For demo purposes - in a real app, this would call an API endpoint
      // Mock successful registration
      const newUser = { 
        id: Math.floor(Math.random() * 10000), 
        email, 
        role,
        artistId: role === 'artist' ? Math.floor(Math.random() * 10000) : undefined
      };
      
      // Store the user in localStorage (in a real app, this would be a JWT token)
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Set the user in state
      setUser(newUser);
      
      // Mark this as a new user for the onboarding flow
      markUserAsNew();
      
      console.log('User registered:', newUser);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login an existing user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // For demo purposes - in a real app, this would call an API endpoint
      // Mock successful login
      const mockUser = { 
        id: Math.floor(Math.random() * 10000), 
        email, 
        role: email.includes('artist') ? 'artist' : 'fan',
        artistId: email.includes('artist') ? Math.floor(Math.random() * 10000) : undefined
      };
      
      // Store the user in localStorage (in a real app, this would be a JWT token)
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Set the user in state
      setUser(mockUser);
      
      // Make sure this is not treated as a new user
      clearNewUserFlag();
      
      console.log('User logged in:', mockUser);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout the user
  const logout = () => {
    // Remove the user from localStorage
    localStorage.removeItem('user');
    // Clear the user from state
    setUser(null);
    // Clear any new user flag
    clearNewUserFlag();
  };

  // Create the auth context value
  const authValue = {
    user,
    loading,
    login,
    register,
    logout,
    error
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// API request helper with authentication
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Get stored user from localStorage
  const storedUser = localStorage.getItem('user');
  
  // Set up headers with authorization if user exists
  const headers = new Headers(options.headers);
  if (storedUser) {
    // In a real app, this would be a JWT token
    headers.set('Authorization', `Bearer mock-token-for-${JSON.parse(storedUser).id}`);
  }
  
  // Return the fetch with headers
  return fetch(url, {
    ...options,
    headers
  });
} 