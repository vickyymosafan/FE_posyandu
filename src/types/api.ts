// API related types

export interface ApiResponse<T = any> {
  sukses: boolean;
  pesan: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  sukses: false;
  pesan: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}