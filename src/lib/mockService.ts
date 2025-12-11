/**
 * Servicio de prueba que usa datos embebidos
 * Permite probar la aplicación sin backend
 */

import {
  MOCK_USERS,
  MOCK_AUTH_RESPONSES,
  MOCK_SESSIONS,
  MOCK_SESSION_LIST,
  MOCK_MATERIALS,
  simulateDelay,
  getMockAIResponse,
  getMockMaterial,
} from './mockData';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  AiGenerationRequest,
  AiGenerationResponse,
  Session,
  SessionListItem,
  MaterialGenerationRequest,
  MaterialGenerationResponse,
  UploadedFile,
} from '@/types';

// Variable para controlar si usar datos de prueba
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

/**
 * Servicio de autenticación con datos de prueba
 */
export const mockAuthService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    await simulateDelay(800); // Simular latencia de red

    // Buscar usuario en datos de prueba
    const mockResponse = MOCK_AUTH_RESPONSES[credentials.email];

    if (!mockResponse) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar contraseña (en producción esto se haría en el backend)
    // Para pruebas, aceptamos cualquier contraseña o "password123"
    if (credentials.password !== 'password123' && credentials.password.length < 6) {
      throw new Error('Contraseña incorrecta');
    }

    return mockResponse;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await simulateDelay(1000);

    // Verificar si el email ya existe
    if (MOCK_AUTH_RESPONSES[data.email]) {
      throw new Error('El email ya está registrado');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      isActive: true,
    };

    const response: AuthResponse = {
      user: newUser,
      token: {
        access_token: `mock-token-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
      },
    };

    // Guardar en "base de datos" simulada
    MOCK_AUTH_RESPONSES[data.email] = response;
    MOCK_USERS.push(newUser);

    return response;
  },

  async getCurrentUser(): Promise<User> {
    await simulateDelay(300);

    // En una app real, esto vendría del token
    // Para pruebas, devolvemos el primer usuario
    return MOCK_USERS[0];
  },
};

/**
 * Servicio de API con datos de prueba
 */
export const mockApiService = {
  async generateAI(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    await simulateDelay(2000); // Simular tiempo de procesamiento de IA

    // Obtener respuesta basada en el área
    const response = getMockAIResponse(request.curriculum.area);

    // Personalizar respuesta con datos del request
    return {
      ...response,
      objectives: response.objectives.map((obj, index) => ({
        ...obj,
        text: obj.text.replace('textos descriptivos', request.classInfo.producto),
      })),
      criteria: response.criteria.map((crit, index) => ({
        ...crit,
        text: crit.text.replace('texto descriptivo', request.classInfo.producto),
      })),
      generatedAt: new Date(),
    };
  },

  async uploadFile(file: File): Promise<{ file: UploadedFile }> {
    await simulateDelay(1500);

    return {
      file: {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      },
    };
  },

  async saveSession(session: Session): Promise<Session> {
    await simulateDelay(500);

    // Guardar en "base de datos" simulada
    const existingIndex = MOCK_SESSIONS.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      MOCK_SESSIONS[existingIndex] = session;
    } else {
      MOCK_SESSIONS.push(session);
    }

    // También guardar en localStorage para persistencia
    try {
      const stored = localStorage.getItem('criteria_sessions');
      const sessions = stored ? JSON.parse(stored) : [];
      const existingIndex = sessions.findIndex((s: Session) => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem('criteria_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }

    return session;
  },

  async getSessionList(): Promise<SessionListItem[]> {
    await simulateDelay(400);

    // Combinar sesiones de mock y localStorage
    let allSessions = [...MOCK_SESSIONS];

    try {
      const stored = localStorage.getItem('criteria_sessions');
      if (stored) {
        const localSessions = JSON.parse(stored) as Session[];
        // Agregar solo las que no están en MOCK_SESSIONS
        localSessions.forEach((localSession) => {
          if (!allSessions.find((s) => s.id === localSession.id)) {
            allSessions.push({
              ...localSession,
              createdAt: new Date(localSession.createdAt),
              updatedAt: new Date(localSession.updatedAt),
            });
          }
        });
      }
    } catch (error) {
      console.error('Error cargando de localStorage:', error);
    }

    return allSessions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((session) => ({
        id: session.id,
        nombre: session.nombre,
        area: session.curriculum.area,
        grado: session.curriculum.grado,
        fecha: session.createdAt.toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }));
  },

  async getSessionById(id: string): Promise<Session> {
    await simulateDelay(300);

    // Buscar en MOCK_SESSIONS primero
    let session = MOCK_SESSIONS.find((s) => s.id === id);

    // Si no está, buscar en localStorage
    if (!session) {
      try {
        const stored = localStorage.getItem('criteria_sessions');
        if (stored) {
          const sessions = JSON.parse(stored) as Session[];
          session = sessions.find((s) => s.id === id);
          if (session) {
            session = {
              ...session,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
            };
          }
        }
      } catch (error) {
        console.error('Error cargando de localStorage:', error);
      }
    }

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    return session;
  },

  async deleteSession(id: string): Promise<void> {
    await simulateDelay(300);

    // Eliminar de MOCK_SESSIONS
    const index = MOCK_SESSIONS.findIndex((s) => s.id === id);
    if (index >= 0) {
      MOCK_SESSIONS.splice(index, 1);
    }

    // Eliminar de localStorage
    try {
      const stored = localStorage.getItem('criteria_sessions');
      if (stored) {
        const sessions = JSON.parse(stored) as Session[];
        const filtered = sessions.filter((s) => s.id !== id);
        localStorage.setItem('criteria_sessions', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
    }
  },

  async exportSession(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
    await simulateDelay(2000);

    // Simular exportación
    return {
      downloadUrl: `https://example.com/exports/${id}.${format}`,
    };
  },

  async generateMaterial(request: MaterialGenerationRequest): Promise<MaterialGenerationResponse> {
    await simulateDelay(1500);

    const material = getMockMaterial(request.materialType);

    // Personalizar material con datos del request
    let personalizedMaterial = material.material
      .replace(/Texto descriptivo/g, request.classInfo.producto)
      .replace(/Comunicación/g, request.curriculum.area)
      .replace(/4to de Primaria/g, request.curriculum.grado);

    // Reemplazar criterios
    const criteriaText = request.criteria.map((c, i) => `${i + 1}. ${c.text}`).join('\n');
    personalizedMaterial = personalizedMaterial.replace(
      /### Criterios de Evaluación[\s\S]*?(?=\n###|\n\*\*|$)/,
      `### Criterios de Evaluación\n\n${criteriaText}\n\n`
    );

    return {
      material: personalizedMaterial,
      materialType: request.materialType,
      generatedAt: new Date(),
    };
  },

  async getAIStatus(): Promise<{ openaiAvailable: boolean; message: string }> {
    await simulateDelay(200);

    return {
      openaiAvailable: USE_MOCK_DATA,
      message: USE_MOCK_DATA
        ? 'Modo de prueba activo. Usando datos embebidos.'
        : 'Backend no disponible. Usando modo simulación.',
    };
  },
};

/**
 * Función helper para determinar si usar datos de prueba
 */
export function shouldUseMockData(): boolean {
  return USE_MOCK_DATA || !import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL === '/api';
}
