import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthTokens, ApiResponse } from '../types';
import { tokenStorage, userStorage, clearAllStorage } from '../utils/storage';
import { apiService } from '../services/api';
import { logUserLogin, logUserLogout } from '../services/activityLogger';
import { syncService } from '../services/syncService';

interface AuthContextType {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && tokens && tokenStorage.isTokenValid());

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Call logout endpoint if we have a valid token
      if (tokens && tokenStorage.isTokenValid()) {
        try {
          await apiService.post('/auth/logout');
        } catch (error) {
          // Ignore logout API errors, still proceed with local logout
          console.warn('Logout API call failed:', error);
        }
      }

      // Log logout before clearing data
      if (tokens && user) {
        logUserLogout(user.id.toString());
      }

      // Stop sync service
      syncService.stopPeriodicSync();

      // Clear all stored data
      clearAllStorage();

      // Update state
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tokens, user]);

  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get stored tokens and user data
      const storedTokens = tokenStorage.getTokens();
      const storedUser = userStorage.getUser();

      if (!storedTokens || !storedUser) {
        // No stored auth data
        setUser(null);
        setTokens(null);
        return;
      }

      // Check if access token is still valid
      if (tokenStorage.isTokenValid()) {
        setUser(storedUser);
        setTokens(storedTokens);
        return;
      }

      // Try to refresh token if refresh token exists
      if (tokenStorage.hasRefreshToken()) {
        try {
          const response: ApiResponse<{
            tokens: AuthTokens;
          }> = await apiService.post('/auth/refresh', {
            refreshToken: storedTokens.refreshToken
          });

          if (response.success && response.data) {
            const { tokens: newTokens } = response.data;
            // Store new tokens
            tokenStorage.setTokens(newTokens);
            setTokens(newTokens);
            setUser(storedUser);
            return;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }
      
      // Refresh failed or no refresh token, clear auth data
      clearAllStorage();
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear auth data directly to avoid circular dependency
      clearAllStorage();
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = tokenStorage.getTokens();
      if (!storedTokens?.refreshToken) {
        return false;
      }

      const response: ApiResponse<{
        tokens: AuthTokens;
      }> = await apiService.post('/auth/refresh', {
        refreshToken: storedTokens.refreshToken
      });

      if (response.success && response.data) {
        const { tokens: newTokens } = response.data;

        // Store new tokens
        tokenStorage.setTokens(newTokens);
        setTokens(newTokens);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto refresh token when it's about to expire
  useEffect(() => {
    if (!tokens || !isAuthenticated) return;

    const checkTokenExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = tokens.expiresAt - now;
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes

      if (timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0) {
        refreshToken();
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [tokens, isAuthenticated, refreshToken]);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      const response: ApiResponse<{
        user: User;
        tokens: AuthTokens;
      }> = await apiService.post('/auth/login', {
        username,
        password
      });

      if (response.success && response.data) {
        const { user: userData, tokens: tokenData } = response.data;

        // Store auth data
        tokenStorage.setTokens(tokenData);
        userStorage.setUser(userData);

        // Update state
        setUser(userData);
        setTokens(tokenData);

        // Log successful login
        logUserLogin(userData.id.toString());

        // Initialize sync service
        syncService.initialize();
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
