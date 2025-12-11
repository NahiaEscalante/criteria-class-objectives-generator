import type {
  AiGenerationRequest,
  AiGenerationResponse,
  Session,
  SessionListItem,
  UploadedFile,
  MaterialGenerationRequest,
  MaterialGenerationResponse,
  Resource,
} from '@/types';
import { getAuthHeaders, getAuthToken } from './auth';
import { mockApiService, shouldUseMockData } from './mockService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Maneja errores de autenticación
 * Si recibe 401, limpia datos y redirige a login
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

/**
 * Crea un AbortSignal con timeout (compatible con navegadores más antiguos)
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Si el signal se aborta, limpiar el timeout
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
  
  return controller.signal;
}

/**
 * Valida la estructura de una respuesta de generación de IA
 */
function validateAiGenerationResponse(data: any): data is AiGenerationResponse {
  if (!data || typeof data !== 'object') return false;
  
  // Validar objectives
  if (!Array.isArray(data.objectives)) return false;
  if (!data.objectives.every((obj: any) => 
    obj && typeof obj.id === 'string' && typeof obj.text === 'string' && typeof obj.order === 'number'
  )) return false;
  
  // Validar criteria
  if (!Array.isArray(data.criteria)) return false;
  if (!data.criteria.every((crit: any) => 
    crit && typeof crit.id === 'string' && typeof crit.text === 'string' && typeof crit.order === 'number'
  )) return false;
  
  // Validar resources
  if (!Array.isArray(data.resources)) return false;
  if (!data.resources.every((res: any) => 
    res && typeof res.id === 'string' && typeof res.type === 'string' && 
    ['video', 'audio', 'image'].includes(res.type) &&
    typeof res.title === 'string' && typeof res.description === 'string'
  )) return false;
  
  return true;
}

/**
 * Valida la estructura de una respuesta de estado de generación
 */
function validateGenerationStatusResponse(data: any): data is { resources: Resource[] } {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.resources)) return false;
  
  // Validar que cada recurso tenga la estructura mínima
  if (!data.resources.every((res: any) => 
    res && typeof res.id === 'string' && typeof res.type === 'string' &&
    ['video', 'audio', 'image'].includes(res.type)
  )) return false;
  
  return true;
}

/**
 * Servicio de API para comunicación con el backend
 * Falla claramente cuando el backend no está disponible
 */
export const apiService = {
  /**
   * Genera objetivos, criterios y recursos con IA
   * Requiere backend disponible
   */
  async generateAI(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.generateAI(request);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(), // Incluir autenticación si está disponible
        body: JSON.stringify(request),
        signal: createTimeoutSignal(30000), // 30 segundos para generación de IA
      });

      handleAuthError(response);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al generar: ${response.status}`);
      }

      const data = await response.json();
      
      // Validar estructura de respuesta
      if (!validateAiGenerationResponse(data)) {
        throw new Error('Respuesta del servidor tiene un formato inválido');
      }
      
      return data;
    } catch (error: any) {
      // Si es un error de red o timeout, dar mensaje claro
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Sube un archivo PPT
   * Requiere backend disponible
   */
  async uploadFile(file: File): Promise<{ file: UploadedFile }> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.uploadFile(file);
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const headers: HeadersInit = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers, // No incluir Content-Type - el navegador lo hace automáticamente para FormData
        body: formData,
        signal: createTimeoutSignal(10000), // Timeout más largo para uploads
      });

      handleAuthError(response);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al subir archivo: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Guarda una sesión
   * Requiere backend disponible
   */
  async saveSession(session: Session): Promise<Session> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.saveSession(session);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(session),
        signal: createTimeoutSignal(5000),
      });

      handleAuthError(response);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al guardar sesión: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Obtiene la lista de sesiones (resumen)
   * Requiere backend disponible
   */
  async getSessionList(): Promise<SessionListItem[]> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.getSessionList();
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: createTimeoutSignal(5000),
      });

      handleAuthError(response);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al obtener sesiones: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Obtiene una sesión completa por ID
   * Requiere backend disponible
   */
  async getSessionById(id: string): Promise<Session> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.getSessionById(id);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: createTimeoutSignal(5000),
      });

      handleAuthError(response);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sesión no encontrada');
        }
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al obtener sesión: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Elimina una sesión
   * Requiere backend disponible
   */
  async deleteSession(id: string): Promise<void> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.deleteSession(id);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: createTimeoutSignal(5000),
      });

      handleAuthError(response);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sesión no encontrada');
        }
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al eliminar sesión: ${response.status}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Exporta una sesión
   * Requiere backend disponible
   */
  async exportSession(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.exportSession(id, format);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}/export`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ format }),
        signal: createTimeoutSignal(30000), // 30 segundos para exportación
      });

      handleAuthError(response);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sesión no encontrada');
        }
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al exportar sesión: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Genera material educativo basado en los criterios
   * Requiere backend disponible
   */
  async generateMaterial(request: MaterialGenerationRequest): Promise<MaterialGenerationResponse> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.generateMaterial(request);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-material`, {
        method: 'POST',
        headers: getAuthHeaders(), // Incluir autenticación si está disponible
        body: JSON.stringify(request),
        signal: createTimeoutSignal(60000), // 60 segundos para generación con IA
      });

      handleAuthError(response);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al generar material: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Obtiene el estado de generación de recursos multimedia
   * Útil cuando los recursos se generan en background
   * Requiere backend disponible
   */
  async getGenerationStatus(generationId: string): Promise<{ resources: Resource[] }> {
    // En modo mock, los recursos ya vienen listos en la respuesta inicial
    // No hay necesidad de polling, pero devolvemos recursos vacíos para evitar errores
    if (shouldUseMockData()) {
      return { resources: [] };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generation-status/${generationId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: createTimeoutSignal(5000),
      });

      handleAuthError(response);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Generación no encontrada');
        }
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al obtener estado: ${response.status}`);
      }

      const data = await response.json();
      
      // Validar estructura de respuesta
      if (!validateGenerationStatusResponse(data)) {
        throw new Error('Respuesta del servidor tiene un formato inválido');
      }
      
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },

  /**
   * Verifica el estado de OpenAI
   * Requiere backend disponible
   */
  async getAIStatus(): Promise<{ openaiAvailable: boolean; message: string }> {
    // Usar datos de prueba si está configurado explícitamente
    if (shouldUseMockData()) {
      return mockApiService.getAIStatus();
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(5000),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Error del servidor: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `Error al verificar estado: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté disponible.');
      }
      throw error;
    }
  },
};

