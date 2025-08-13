// Authentication related types

export interface Admin {
  id: number;
  nama_pengguna: string;
  nama_lengkap: string;
  email: string;
}

export interface LoginCredentials {
  nama_pengguna: string;
  kata_sandi: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface LoginResponse {
  sukses: boolean;
  pesan: string;
  data?: {
    admin: Admin;
    tokens: AuthTokens;
  };
}

export interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}