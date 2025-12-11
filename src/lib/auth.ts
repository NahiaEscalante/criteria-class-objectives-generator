import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';
import { mockAuthService, shouldUseMockData } from './mockService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Obtiene el token de autenticación del localStorage
 */
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('criteria_auth_token');
    if (!stored) return null;
    
    const tokenData = JSON.parse(stored);
    return tokenData.access_token;
  } catch {
    return null;
  }
}

/**
 * Crea headers con autenticación
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Usar datos de prueba si no hay backend disponible
    if (shouldUseMockData()) {
      return mockAuthService.login(credentials);
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      throw new Error(error.message || 'Credenciales incorrectas');
    }

    const data: AuthResponse = await response.json();
    
    // Convertir fechas de string a Date
    return {
      ...data,
      user: {
        ...data.user,
        createdAt: new Date(data.user.createdAt),
      },
    };
  },

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Usar datos de prueba si no hay backend disponible
    if (shouldUseMockData()) {
      return mockAuthService.register(data);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrar' }));
      throw new Error(error.message || 'No se pudo crear la cuenta');
    }

    const authData: AuthResponse = await response.json();
    
    // Convertir fechas de string a Date
    return {
      ...authData,
      user: {
        ...authData.user,
        createdAt: new Date(authData.user.createdAt),
      },
    };
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User> {
    // Usar datos de prueba si no hay backend disponible
    if (shouldUseMockData()) {
      return mockAuthService.getCurrentUser();
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      const error = await response.json().catch(() => ({ message: 'Error al obtener usuario' }));
      throw new Error(error.message || 'No se pudo obtener la información del usuario');
    }

    const user: User = await response.json();
    return {
      ...user,
      createdAt: new Date(user.createdAt),
    };
  },

  /**
   * Cierra sesión (opcional - puede ser solo frontend)
   */
  async logout(): Promise<void> {
    // En el frontend, solo limpiamos localStorage
    // El backend puede invalidar tokens si es necesario
    localStorage.removeItem('criteria_auth_token');
    localStorage.removeItem('criteria_auth_user');
  },
};

/**
 * Exportar función para obtener headers con auth
 * Útil para otros servicios que necesiten autenticación
 */
export { getAuthHeaders, getAuthToken };

