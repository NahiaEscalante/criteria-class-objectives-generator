// ===== AUTHENTICATION TYPES =====

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface TokenData {
  access_token: string;
  expires_at: number; // Timestamp en milisegundos
}

