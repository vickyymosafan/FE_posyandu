// Authentication API functions
import apiClient from '@/lib/api';
import { LoginCredentials, LoginResponse, Admin } from '@/types/auth';

export const authApi = {
  /**
   * Login admin
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse['data']>('/auth/login', credentials);
    return {
      sukses: response.sukses,
      pesan: response.pesan,
      data: response.data!,
    };
  },

  /**
   * Logout admin
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    
    // Clear tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Verify current session
   */
  verify: async (): Promise<Admin> => {
    const response = await apiClient.get<{ admin: Admin }>('/auth/verify');
    return response.data!.admin;
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    return response.data!;
  },
};