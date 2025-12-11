import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { User, LoginRequest, RegisterRequest, AuthResponse, TokenData } from '@/types/auth';

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

