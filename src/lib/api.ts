// API client for backend communication
import { ApiResponse, ApiError, HttpMethod, ApiClientConfig } from '@/types/api';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage or cookies
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options?.headers as Record<string, string> || {}),
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include', // Include cookies for refresh token
      ...options,
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.handleAuthError();
        }
        
        throw new Error(responseData.pesan || `HTTP ${response.status}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get token from localStorage first
    const token = localStorage.getItem('accessToken');
    return token;
  }

  private handleAuthError(): void {
    if (typeof window === 'undefined') return;
    
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  // File upload method
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(responseData.pesan || `HTTP ${response.status}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Download file method
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}

// Create API client instance
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

export default apiClient;