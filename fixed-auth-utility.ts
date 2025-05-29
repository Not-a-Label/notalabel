'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  artist_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  error: string | null;
  setAuthFromToken?: (token: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  error: null
});

// API URL configuration - simplified and reliable
function getApiUrl(): string {
  // In browser, use environment variable or fallback to server IP
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://159.89.247.208/api';
  }
  // On server, use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://159.89.247.208/api';
}

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token (optional - can be done through a specific endpoint)
          setUser({ id: 1, username: 'user', email: 'user@example.com' }); // Placeholder
        } catch (error) {
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = getApiUrl();
      console.log('Login API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const userData = data.user;
      const token = data.token;

      localStorage.setItem('auth_token', token);
      setUser(userData);
      setLoading(false);
      
      return userData;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, role: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = getApiUrl();
      console.log('Registration API URL:', apiUrl);
      console.log('Registration payload:', { username, email, password: '***', role });
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || 'Registration failed');
        } catch (parseError) {
          throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Registration success:', data);
      
      const userData = data.user;
      const token = data.token;

      localStorage.setItem('auth_token', token);
      setUser(userData);
      setLoading(false);
      
      return userData;
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError(null);
  };

  const setAuthFromToken = (token: string) => {
    localStorage.setItem('auth_token', token);
    // You might want to decode the token to get user info
    // For now, setting a placeholder user
    setUser({ id: 1, username: 'user', email: 'user@example.com' });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    error,
    setAuthFromToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};