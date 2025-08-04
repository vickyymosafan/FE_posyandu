import { ApiResponse } from '../types';
import { tokenStorage } from '../utils/storage';

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Koneksi internet bermasalah') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    const tokens = tokenStorage.getTokens();
    return tokens?.accessToken || null;
  }

  private async handleRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || 'Request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new NetworkError();
      }
      throw error;
    }
  }

  // GET request
  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(url, { method: 'DELETE' });
  }

  // File upload
  async uploadFile<T>(url: string, file: FormData): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new NetworkError();
      }
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;