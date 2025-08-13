'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api';
import { Admin, LoginCredentials, AuthContextType, LoginResponse, AuthTokens } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!admin;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const adminData = localStorage.getItem('adminData');

      if (token && adminData) {
        // Verify token with backend
        try {
          const response = await apiClient.get('/auth/verify');
          if (response.sukses) {
            setAdmin(JSON.parse(adminData));
          } else {
            // Token is invalid, clear storage
            clearAuthData();
          }
        } catch (error) {
          // Token verification failed, try to refresh
          await refreshToken();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      const response = await apiClient.post('/auth/login', credentials);

      if (response.sukses && response.data) {
        const loginData = response.data as { admin: Admin; tokens: AuthTokens };
        const { admin: adminData, tokens } = loginData;

        // Store tokens and admin data
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('adminData', JSON.stringify(adminData));

        // Set HTTP-only cookie for refresh token (more secure)
        Cookies.set('refreshToken', tokens.refreshToken, {
          httpOnly: false, // Note: js-cookie can't set httpOnly, this should be done by backend
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: 7 // 7 days
        });

        setAdmin(adminData);
        toast.success('Login berhasil!');

        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      } else {
        throw new Error(response.pesan || 'Login gagal');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login gagal';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Clear all auth data
    clearAuthData();
    setAdmin(null);

    // Show success message
    toast.success('Logout berhasil');

    // Redirect to login
    router.push('/login');
  }, [router]);

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken') || Cookies.get('refreshToken');

      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: storedRefreshToken
      });

      if (response.sukses && response.data) {
        const refreshData = response.data as { admin: Admin; tokens: AuthTokens };
        const { tokens, admin: adminData } = refreshData;

        // Update stored tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('adminData', JSON.stringify(adminData));

        // Update cookie
        Cookies.set('refreshToken', tokens.refreshToken, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: 7
        });

        setAdmin(adminData);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      setAdmin(null);
      router.push('/login');
      throw error;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminData');
    Cookies.remove('refreshToken');
  };

  // Auto logout when token expires
  useEffect(() => {
    if (!admin) return;

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        logout();
        return;
      }

      try {
        // Decode JWT token to check expiry (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        // If token expires in less than 5 minutes, try to refresh
        if (payload.exp - currentTime < 300) {
          refreshToken().catch(() => {
            logout();
          });
        }

        // If token is already expired, logout
        if (payload.exp < currentTime) {
          logout();
        }
      } catch (error) {
        console.error('Token parsing error:', error);
        logout();
      }
    };

    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60000);

    // Initial check
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [admin, logout]);

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;