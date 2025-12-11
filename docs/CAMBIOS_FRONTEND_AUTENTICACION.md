# 🔐 Cambios en Frontend para Autenticación Completa

## 📋 Contexto

Este documento especifica **todos los cambios necesarios** en el frontend React para implementar autenticación completa, considerando que:
- El backend será FastAPI en un repositorio separado
- El frontend solo se conectará vía API REST
- Se implementará JWT para autenticación
- Las rutas protegidas requerirán autenticación

---

## 🆕 ARCHIVOS NUEVOS A CREAR

### 1. Tipos de Autenticación

**Archivo:** `src/types/auth.ts` (NUEVO)

```typescript
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
```

**Razón:** Separar tipos de autenticación del resto de tipos para mejor organización.

---

### 2. Contexto de Autenticación

**Archivo:** `src/contexts/AuthContext.tsx` (NUEVO)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'criteria_auth_token';
const USER_KEY = 'criteria_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar si el token aún es válido
          const tokenData = JSON.parse(storedToken);
          const now = Date.now();
          
          if (tokenData.expires_at > now) {
            setToken(tokenData.access_token);
            setUser(userData);
            
            // Verificar con el backend que el usuario sigue siendo válido
            try {
              await refreshUser();
            } catch (error) {
              // Si falla, limpiar datos
              logout();
            }
          } else {
            // Token expirado, limpiar
            logout();
          }
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      
      // Guardar token y usuario
      const tokenData: TokenData = {
        access_token: response.token.access_token,
        expires_at: Date.now() + (response.token.expires_in * 1000),
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setToken(tokenData.access_token);
      setUser(response.user);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}`,
      });
      
      navigate('/generar');
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.register(data);
      
      // Guardar token y usuario
      const tokenData: TokenData = {
        access_token: response.token.access_token,
        expires_at: Date.now() + (response.token.expires_in * 1000),
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setToken(tokenData.access_token);
      setUser(response.user);
      
      toast({
        title: "Registro exitoso",
        description: `Cuenta creada para ${response.user.name}`,
      });
      
      navigate('/generar');
    } catch (error: any) {
      toast({
        title: "Error al registrar",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate('/');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      // Si falla, el token probablemente es inválido
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

**Razón:** Contexto centralizado para manejar estado de autenticación en toda la aplicación.

---

### 3. Servicio de Autenticación

**Archivo:** `src/lib/auth.ts` (NUEVO)

```typescript
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

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
```

**Razón:** Servicio centralizado para todas las operaciones de autenticación.

---

### 4. Componente de Ruta Protegida

**Archivo:** `src/components/ProtectedRoute.tsx` (NUEVO)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-secondary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Razón:** Componente para proteger rutas que requieren autenticación.

---

### 5. Página de Login

**Archivo:** `src/pages/Login.tsx` (NUEVO)

```typescript
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta a la que redirigir después del login
  const from = (location.state as any)?.from?.pathname || '/generar';

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      // El error ya se maneja en el contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-muted-foreground">
                Ingresa a tu cuenta de CriterIA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    className={errors.email ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    className={errors.password ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                ¿No tienes una cuenta?{' '}
              </span>
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Regístrate aquí
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

**Razón:** Página de inicio de sesión con validación y manejo de errores.

---

### 6. Página de Registro

**Archivo:** `src/pages/Register.tsx` (NUEVO)

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/generar');
    } catch (error) {
      // El error ya se maneja en el contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Crear Cuenta
              </h1>
              <p className="text-muted-foreground">
                Regístrate para comenzar a usar CriterIA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                    className={errors.name ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    className={errors.email ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    className={errors.password ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, con mayúsculas, minúsculas y números
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    className={errors.confirmPassword ? "border-destructive pl-10" : "pl-10"}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
              </span>
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

**Razón:** Página de registro con validación completa de formulario.

---

## 🔄 ARCHIVOS A MODIFICAR

### 1. Tipos Existentes

**Archivo:** `src/types/index.ts`

**Agregar al final del archivo:**

```typescript
// ===== AUTHENTICATION TYPES =====
// Los tipos de autenticación están en src/types/auth.ts
// Importar desde allí cuando sea necesario
```

**O mejor aún, crear `src/types/auth.ts` como se especificó arriba y mantener este archivo sin cambios.**

**Razón:** Mantener tipos organizados y separados.

---

### 2. Servicio de API

**Archivo:** `src/lib/api.ts`

**Cambios necesarios:**

#### A. Importar función de auth headers

**Al inicio del archivo, después de los imports:**

```typescript
import { getAuthHeaders } from './auth';
```

#### B. Modificar todas las funciones fetch para usar auth headers

**Ejemplo - Función `saveSession`:**

**ANTES:**
```typescript
async saveSession(session: Session): Promise<Session> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
      signal: createTimeoutSignal(2000),
    }).catch(() => null);
```

**DESPUÉS:**
```typescript
async saveSession(session: Session): Promise<Session> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(), // ← CAMBIO: Usar headers con auth
      body: JSON.stringify(session),
      signal: createTimeoutSignal(2000),
    }).catch(() => null);
```

#### C. Manejar errores 401 (No autorizado)

**Agregar función helper al inicio del archivo:**

```typescript
/**
 * Maneja errores de autenticación
 * Si recibe 401, redirige a login
 */
function handleAuthError(response: Response | null) {
  if (response && response.status === 401) {
    // Limpiar datos de auth
    localStorage.removeItem('criteria_auth_token');
    localStorage.removeItem('criteria_auth_user');
    
    // Redirigir a login
    window.location.href = '/login';
    
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
}
```

**Modificar cada función para manejar 401:**

**Ejemplo en `getSessionList`:**

**ANTES:**
```typescript
if (response && response.ok) {
  try {
    return await response.json();
  } catch {
    // Fall through to localStorage
  }
}
```

**DESPUÉS:**
```typescript
if (response) {
  handleAuthError(response); // ← Verificar auth antes de procesar
  
  if (response.ok) {
    try {
      return await response.json();
    } catch {
      // Fall through to localStorage
    }
  }
}
```

**Funciones a modificar:**
- `saveSession` - Línea ~217
- `getSessionList` - Línea ~262
- `getSessionById` - Línea ~311
- `deleteSession` - Línea ~350
- `exportSession` - Línea ~382
- `generateAI` - Línea ~133 (opcional, puede ser público)
- `generateMaterial` - Línea ~404 (opcional, puede ser público)
- `uploadFile` - Línea ~175

**Nota:** `generateAI` y `generateMaterial` pueden no requerir autenticación si quieres permitir uso sin cuenta. Si requieren auth, aplicar los mismos cambios.

---

### 3. App.tsx - Agregar AuthProvider y Rutas

**Archivo:** `src/App.tsx`

**Cambios completos:**

**ANTES:**
```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Generar from "./pages/Generar";
import Historial from "./pages/Historial";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generar" element={<Generar />} />
          <Route path="/historial" element={<Historial />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

**DESPUÉS:**
```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Generar from "./pages/Generar";
import Historial from "./pages/Historial";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/generar"
              element={
                <ProtectedRoute>
                  <Generar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial"
              element={
                <ProtectedRoute>
                  <Historial />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

**Razón:** Envolver la app con AuthProvider y proteger rutas que requieren autenticación.

---

### 4. Navbar - Agregar Estado de Autenticación

**Archivo:** `src/components/Navbar.tsx`

**Cambios completos:**

**ANTES:**
```typescript
import { Link } from "react-router-dom";
import logo from "@/assets/criteria-logo.png";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="CriterIA" className="h-14 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/generar"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Generar criterios
            </Link>
            <Link
              to="/historial"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Historial
            </Link>
            <a
              href="#ayuda"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Ayuda
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

**DESPUÉS:**
```typescript
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/criteria-logo.png";
import { User, LogOut } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="CriterIA" className="h-14 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/generar"
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Generar criterios
                </Link>
                <Link
                  to="/historial"
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Historial
                </Link>
                <a
                  href="#ayuda"
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Ayuda
                </a>
                
                {/* Menú de usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user ? getInitials(user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/generar" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi cuenta</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/generar"
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Generar criterios
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Button asChild variant="default">
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

**Razón:** Mostrar estado de autenticación y opciones de usuario cuando está autenticado.

---

### 5. Landing Page - Agregar CTA de Registro

**Archivo:** `src/pages/Landing.tsx`

**Cambios:**

**Buscar el botón principal (alrededor de línea 24-31):**

**ANTES:**
```typescript
<Button
  size="lg"
  onClick={() => navigate("/generar")}
  className="text-lg px-8 py-6 h-auto"
>
  Comenzar a generar criterios
  <Sparkles className="ml-2 h-5 w-5" />
</Button>
```

**DESPUÉS:**
```typescript
import { useAuth } from "@/contexts/AuthContext";

// Dentro del componente:
const { isAuthenticated } = useAuth();

// En el JSX:
<div className="flex gap-4 justify-center">
  {isAuthenticated ? (
    <Button
      size="lg"
      onClick={() => navigate("/generar")}
      className="text-lg px-8 py-6 h-auto"
    >
      Generar criterios
      <Sparkles className="ml-2 h-5 w-5" />
    </Button>
  ) : (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={() => navigate("/login")}
        className="text-lg px-8 py-6 h-auto"
      >
        Iniciar sesión
      </Button>
      <Button
        size="lg"
        onClick={() => navigate("/register")}
        className="text-lg px-8 py-6 h-auto"
      >
        Comenzar gratis
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
    </>
  )}
</div>
```

**Razón:** Mostrar opciones apropiadas según el estado de autenticación.

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Crear Archivos Nuevos
- [ ] Crear `src/types/auth.ts` con todos los tipos
- [ ] Crear `src/contexts/AuthContext.tsx`
- [ ] Crear `src/lib/auth.ts` con servicio de autenticación
- [ ] Crear `src/components/ProtectedRoute.tsx`
- [ ] Crear `src/pages/Login.tsx`
- [ ] Crear `src/pages/Register.tsx`

### Fase 2: Modificar Archivos Existentes
- [ ] Modificar `src/lib/api.ts`:
  - [ ] Importar `getAuthHeaders` de `./auth`
  - [ ] Agregar función `handleAuthError`
  - [ ] Modificar `saveSession` para usar auth headers
  - [ ] Modificar `getSessionList` para usar auth headers y manejar 401
  - [ ] Modificar `getSessionById` para usar auth headers y manejar 401
  - [ ] Modificar `deleteSession` para usar auth headers y manejar 401
  - [ ] Modificar `exportSession` para usar auth headers y manejar 401
  - [ ] Modificar `uploadFile` para usar auth headers y manejar 401
  - [ ] (Opcional) Modificar `generateAI` y `generateMaterial` si requieren auth

- [ ] Modificar `src/App.tsx`:
  - [ ] Importar `AuthProvider`
  - [ ] Envolver app con `AuthProvider`
  - [ ] Importar `ProtectedRoute`
  - [ ] Importar `Login` y `Register`
  - [ ] Agregar rutas `/login` y `/register`
  - [ ] Proteger rutas `/generar` y `/historial`

- [ ] Modificar `src/components/Navbar.tsx`:
  - [ ] Importar `useAuth`
  - [ ] Importar componentes de UI necesarios (DropdownMenu, Avatar, etc.)
  - [ ] Agregar lógica condicional para mostrar menú de usuario
  - [ ] Agregar botones de login/register cuando no está autenticado

- [ ] Modificar `src/pages/Landing.tsx`:
  - [ ] Importar `useAuth`
  - [ ] Modificar botón principal para mostrar opciones según auth

### Fase 3: Verificación
- [ ] Verificar que el frontend compila sin errores
- [ ] Probar flujo de registro
- [ ] Probar flujo de login
- [ ] Probar protección de rutas (intentar acceder sin auth)
- [ ] Probar logout
- [ ] Verificar que tokens se guardan correctamente
- [ ] Verificar que tokens se envían en requests
- [ ] Probar manejo de errores 401
- [ ] Verificar redirección después de login/register

---

## 🔍 VERIFICACIONES ESPECÍFICAS

### 1. Verificar que el Token se Guarda
```typescript
// En la consola del navegador después de login:
localStorage.getItem('criteria_auth_token')
// Debe retornar un JSON con access_token y expires_at
```

### 2. Verificar que el Token se Envía
```typescript
// En Network tab del DevTools:
// Verificar que las requests a /api/sessions tienen header:
// Authorization: Bearer <token>
```

### 3. Verificar Protección de Rutas
- Intentar acceder a `/generar` sin estar autenticado
- Debe redirigir a `/login`
- Después de login, debe redirigir de vuelta a `/generar`

### 4. Verificar Manejo de Token Expirado
- Simular token expirado cambiando `expires_at` en localStorage
- Recargar la página
- Debe limpiar datos y redirigir a login

---

## ⚠️ NOTAS IMPORTANTES

### 1. Variables de Entorno
Asegúrate de que `.env.local` tenga:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. CORS en Backend
El backend FastAPI debe configurar CORS para aceptar:
- Origin: `http://localhost:8080` (desarrollo)
- Credentials: `true`
- Headers: `Authorization`

### 3. Formato de Respuestas del Backend
El backend debe devolver:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nombre",
    "createdAt": "2025-01-20T10:30:00Z",
    "isActive": true
  },
  "token": {
    "access_token": "jwt-token",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### 4. Manejo de Errores
El backend debe devolver errores en formato:
```json
{
  "error": "Tipo de error",
  "message": "Descripción detallada"
}
```

### 5. Validación de Contraseña
La validación en el frontend es básica. El backend debe tener validación más robusta:
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

---

## 🚀 Orden de Implementación Recomendado

1. **Crear tipos** (`src/types/auth.ts`)
2. **Crear servicio de auth** (`src/lib/auth.ts`)
3. **Crear contexto** (`src/contexts/AuthContext.tsx`)
4. **Crear ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
5. **Crear páginas** (`Login.tsx`, `Register.tsx`)
6. **Modificar App.tsx** (agregar provider y rutas)
7. **Modificar api.ts** (agregar auth headers)
8. **Modificar Navbar** (agregar estado de auth)
9. **Modificar Landing** (agregar CTAs)
10. **Probar todo el flujo**

---

## 📌 Resumen de Archivos

### Nuevos (6 archivos):
1. `src/types/auth.ts`
2. `src/contexts/AuthContext.tsx`
3. `src/lib/auth.ts`
4. `src/components/ProtectedRoute.tsx`
5. `src/pages/Login.tsx`
6. `src/pages/Register.tsx`

### Modificados (4 archivos):
1. `src/lib/api.ts`
2. `src/App.tsx`
3. `src/components/Navbar.tsx`
4. `src/pages/Landing.tsx`

---

*Documento creado para implementar autenticación completa en el frontend de CriterIA*

