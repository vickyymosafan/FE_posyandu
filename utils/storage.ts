import { MMKV } from 'react-native-mmkv';
import { AuthTokens, User } from '../types';

// Initialize MMKV storage
const storage = new MMKV();

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  OFFLINE_DATA: 'offline_data',
  SETTINGS: 'settings',
} as const;

// Auth token management
export const tokenStorage = {
  // Store authentication tokens
  setTokens: (tokens: AuthTokens): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
  },

  // Get authentication tokens
  getTokens: (): AuthTokens | null => {
    const tokensString = storage.getString(STORAGE_KEYS.AUTH_TOKENS);
    if (!tokensString) return null;
    
    try {
      return JSON.parse(tokensString) as AuthTokens;
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      return null;
    }
  },

  // Remove authentication tokens
  clearTokens: (): void => {
    storage.delete(STORAGE_KEYS.AUTH_TOKENS);
  },

  // Check if tokens exist and are not expired
  isTokenValid: (): boolean => {
    const tokens = tokenStorage.getTokens();
    if (!tokens) return false;
    
    // Check if access token is expired (with 5 minute buffer)
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes
    return tokens.expiresAt > (now + buffer);
  },

  // Check if refresh token exists
  hasRefreshToken: (): boolean => {
    const tokens = tokenStorage.getTokens();
    return !!(tokens?.refreshToken);
  }
};

// User data management
export const userStorage = {
  // Store user data
  setUser: (user: User): void => {
    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  // Get user data
  getUser: (): User | null => {
    const userString = storage.getString(STORAGE_KEYS.USER_DATA);
    if (!userString) return null;
    
    try {
      return JSON.parse(userString) as User;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Remove user data
  clearUser: (): void => {
    storage.delete(STORAGE_KEYS.USER_DATA);
  }
};

// Offline data management
export const offlineStorage = {
  // Store offline data with timestamp
  setOfflineData: (key: string, data: any): void => {
    const offlineData = offlineStorage.getOfflineData();
    offlineData[key] = {
      data,
      timestamp: Date.now(),
      synced: false
    };
    storage.set(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineData));
  },

  // Get all offline data
  getOfflineData: (): Record<string, any> => {
    const dataString = storage.getString(STORAGE_KEYS.OFFLINE_DATA);
    if (!dataString) return {};
    
    try {
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Error parsing offline data:', error);
      return {};
    }
  },

  // Get specific offline data
  getOfflineItem: (key: string): any => {
    const offlineData = offlineStorage.getOfflineData();
    return offlineData[key]?.data || null;
  },

  // Mark data as synced
  markAsSynced: (key: string): void => {
    const offlineData = offlineStorage.getOfflineData();
    if (offlineData[key]) {
      offlineData[key].synced = true;
      storage.set(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineData));
    }
  },

  // Get unsynced data
  getUnsyncedData: (): Record<string, any> => {
    const offlineData = offlineStorage.getOfflineData();
    const unsynced: Record<string, any> = {};
    
    Object.keys(offlineData).forEach(key => {
      if (!offlineData[key].synced) {
        unsynced[key] = offlineData[key];
      }
    });
    
    return unsynced;
  },

  // Clear all offline data
  clearOfflineData: (): void => {
    storage.delete(STORAGE_KEYS.OFFLINE_DATA);
  }
};

// Settings management
export const settingsStorage = {
  // Store app settings
  setSettings: (settings: Record<string, any>): void => {
    storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Get app settings
  getSettings: (): Record<string, any> => {
    const settingsString = storage.getString(STORAGE_KEYS.SETTINGS);
    if (!settingsString) return {};
    
    try {
      return JSON.parse(settingsString);
    } catch (error) {
      console.error('Error parsing settings:', error);
      return {};
    }
  },

  // Set specific setting
  setSetting: (key: string, value: any): void => {
    const settings = settingsStorage.getSettings();
    settings[key] = value;
    settingsStorage.setSettings(settings);
  },

  // Get specific setting
  getSetting: (key: string, defaultValue: any = null): any => {
    const settings = settingsStorage.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  // Clear all settings
  clearSettings: (): void => {
    storage.delete(STORAGE_KEYS.SETTINGS);
  }
};

// Clear all stored data (for logout)
export const clearAllStorage = (): void => {
  tokenStorage.clearTokens();
  userStorage.clearUser();
  offlineStorage.clearOfflineData();
  // Keep settings on logout
};

export default {
  tokenStorage,
  userStorage,
  offlineStorage,
  settingsStorage,
  clearAllStorage
};
