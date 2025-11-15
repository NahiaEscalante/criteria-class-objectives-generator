import type {
  AiGenerationRequest,
  AiGenerationResponse,
  Session,
  SessionListItem,
  UploadedFile,
} from '@/types';

const API_BASE_URL = '/api';

/**
 * Servicio de API para comunicación con el backend
 */
export const apiService = {
  /**
   * Genera objetivos, criterios y recursos con IA
   */
  async generateAI(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al generar con IA');
    }

    return response.json();
  },

  /**
   * Sube un archivo PPT (simulación)
   */
  async uploadFile(file: File): Promise<{ file: UploadedFile }> {
    // Para simulación, solo enviamos metadatos
    // En producción real, usaríamos FormData
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    return response.json();
  },

  /**
   * Guarda una sesión
   */
  async saveSession(session: Session): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al guardar sesión');
    }

    return response.json();
  },

  /**
   * Obtiene la lista de sesiones (resumen)
   */
  async getSessionList(): Promise<SessionListItem[]> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar sesiones');
    }

    return response.json();
  },

  /**
   * Obtiene una sesión completa por ID
   */
  async getSessionById(id: string): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar sesión');
    }

    return response.json();
  },

  /**
   * Elimina una sesión
   */
  async deleteSession(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar sesión');
    }
  },

  /**
   * Exporta una sesión (simulación)
   */
  async exportSession(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al exportar sesión');
    }

    return response.json();
  },
};

