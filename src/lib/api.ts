import type {
  AiGenerationRequest,
  AiGenerationResponse,
  Session,
  SessionListItem,
  UploadedFile,
  MaterialGenerationRequest,
  MaterialGenerationResponse,
} from '@/types';

const API_BASE_URL = '/api';

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
 * Genera datos hardcodeados cuando el backend no está disponible
 */
function generateHardcodedAI(request: AiGenerationRequest): AiGenerationResponse {
  const baseId = `hardcoded-${Date.now()}`;
  
  // Objetivos basados en el contexto
  const objectives = [
    {
      id: `${baseId}-obj-1`,
      text: `Identificar y aplicar recursos apropiados para producir ${request.classInfo.producto} coherentes y adecuados al contexto de ${request.curriculum.grado}.`,
      order: 1,
    },
    {
      id: `${baseId}-obj-2`,
      text: `Aplicar estructura textual apropiada para ${request.classInfo.producto} según las convenciones del área de ${request.curriculum.area}.`,
      order: 2,
    },
    {
      id: `${baseId}-obj-3`,
      text: `Emplear vocabulario variado y preciso en la producción de ${request.classInfo.producto} considerando el contexto: ${request.classInfo.contexto.substring(0, 50)}...`,
      order: 3,
    },
  ];

  // Criterios basados en el desempeño
  const criteria = [
    {
      id: `${baseId}-crit-1`,
      text: `El ${request.classInfo.producto} incluye recursos variados y apropiados al contexto de aprendizaje.`,
      order: 1,
    },
    {
      id: `${baseId}-crit-2`,
      text: `La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.`,
      order: 2,
    },
    {
      id: `${baseId}-crit-3`,
      text: `Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.`,
      order: 3,
    },
    {
      id: `${baseId}-crit-4`,
      text: `Presenta ortografía adecuada y respeta las normas básicas según el ${request.curriculum.grado}.`,
      order: 4,
    },
    {
      id: `${baseId}-crit-5`,
      text: `La ${request.classInfo.evidencia} demuestra el logro de los aprendizajes esperados.`,
      order: 5,
    },
  ];

  // Recursos sugeridos
  const resources = [
    {
      id: `${baseId}-res-video-1`,
      type: 'video' as const,
      title: `Cómo producir ${request.classInfo.producto}`,
      description: `Video educativo que explica el proceso de producción de ${request.classInfo.producto} con ejemplos prácticos.`,
    },
    {
      id: `${baseId}-res-video-2`,
      type: 'video' as const,
      title: `${request.curriculum.capacidad}: Estrategias y recursos`,
      description: `Tutorial sobre cómo aplicar ${request.curriculum.capacidad} en producciones del área de ${request.curriculum.area}.`,
    },
    {
      id: `${baseId}-res-audio-1`,
      type: 'audio' as const,
      title: `Podcast: Estrategias para ${request.classInfo.producto}`,
      description: `Audio con ejemplos prácticos y consejos para desarrollar ${request.classInfo.producto} en el aula.`,
    },
    {
      id: `${baseId}-res-image-1`,
      type: 'image' as const,
      title: `Infografía: Estructura de ${request.classInfo.producto}`,
      description: `Material visual con la estructura y elementos clave para producir ${request.classInfo.producto}.`,
    },
    {
      id: `${baseId}-res-image-2`,
      type: 'image' as const,
      title: `Ejemplo de ${request.classInfo.producto} para referencia`,
      description: `Modelo o ejemplo de ${request.classInfo.producto} que los estudiantes pueden usar como referencia.`,
    },
  ];

  return {
    objectives,
    criteria,
    resources,
    generatedAt: new Date(),
  };
}

/**
 * Servicio de API para comunicación con el backend
 * Con fallback a datos hardcodeados si el backend no está disponible
 */
export const apiService = {
  /**
   * Genera objetivos, criterios y recursos con IA
   * Si el backend no está disponible, usa datos hardcodeados
   */
  async generateAI(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        // Agregar timeout para detectar rápido si no hay backend
        signal: createTimeoutSignal(2000),
      }).catch(() => {
        // Si hay error de red, devolver null para usar fallback
        return null;
      });

      if (!response || !response.ok) {
        // Si es 404 o cualquier error, usar fallback silenciosamente
        if (response && response.status === 404) {
          // Silencioso - es esperado cuando no hay backend
          return generateHardcodedAI(request);
        }
        // Para otros errores, también usar fallback
        return generateHardcodedAI(request);
      }

      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        // Si no se puede parsear JSON (ej: HTML de error), usar fallback
        return generateHardcodedAI(request);
      }
    } catch (error: any) {
      // Cualquier error = usar fallback silenciosamente
      return generateHardcodedAI(request);
    }
  },

  /**
   * Sube un archivo PPT (simulación)
   * Si el backend no está disponible, devuelve metadatos hardcodeados
   */
  async uploadFile(file: File): Promise<{ file: UploadedFile }> {
    try {
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
        signal: createTimeoutSignal(2000),
      }).catch(() => null);

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to fallback
        }
      }
    } catch (error: any) {
      // Silencioso - usar fallback
    }

    // Fallback: devolver metadatos sin subir realmente
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

  /**
   * Guarda una sesión
   * Si el backend no está disponible, usa localStorage como fallback
   */
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

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to localStorage
        }
      }
    } catch (error: any) {
      // Silencioso - usar localStorage
    }

    // Fallback: usar localStorage
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
      return session;
    } catch (localError) {
      throw new Error('No se pudo guardar la sesión');
    }
  },

  /**
   * Obtiene la lista de sesiones (resumen)
   * Si el backend no está disponible, usa localStorage como fallback
   */
  async getSessionList(): Promise<SessionListItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(2000),
      }).catch(() => null);

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to localStorage
        }
      }
    } catch (error: any) {
      // Silencioso - usar localStorage
    }

    // Fallback: usar localStorage
    try {
      const stored = localStorage.getItem('criteria_sessions');
      if (!stored) return [];
      
      const sessions = JSON.parse(stored) as Session[];
      return sessions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(session => ({
          id: session.id,
          nombre: session.nombre,
          area: session.curriculum.area,
          grado: session.curriculum.grado,
          fecha: new Date(session.createdAt).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }));
    } catch (localError) {
      return [];
    }
  },

  /**
   * Obtiene una sesión completa por ID
   * Si el backend no está disponible, usa localStorage como fallback
   */
  async getSessionById(id: string): Promise<Session> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(2000),
      }).catch(() => null);

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to localStorage
        }
      }
    } catch (error: any) {
      // Silencioso - usar localStorage
    }

    // Fallback: usar localStorage
    try {
      const stored = localStorage.getItem('criteria_sessions');
      if (!stored) throw new Error('Sesión no encontrada');
      
      const sessions = JSON.parse(stored) as Session[];
      const session = sessions.find(s => s.id === id);
      if (!session) throw new Error('Sesión no encontrada');
      return session;
    } catch (localError) {
      throw new Error('No se encontró la sesión');
    }
  },

  /**
   * Elimina una sesión
   * Si el backend no está disponible, usa localStorage como fallback
   */
  async deleteSession(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(2000),
      }).catch(() => null);

      if (response && response.ok) {
        return;
      }
    } catch (error: any) {
      // Silencioso - usar localStorage
    }

    // Fallback: usar localStorage
    try {
      const stored = localStorage.getItem('criteria_sessions');
      if (!stored) return;
      
      const sessions = JSON.parse(stored) as Session[];
      const filtered = sessions.filter(s => s.id !== id);
      localStorage.setItem('criteria_sessions', JSON.stringify(filtered));
    } catch (localError) {
      throw new Error('No se pudo eliminar la sesión');
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

  /**
   * Genera material educativo basado en los criterios
   * Si el backend no está disponible, genera material básico hardcodeado
   */
  async generateMaterial(request: MaterialGenerationRequest): Promise<MaterialGenerationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: createTimeoutSignal(3000),
      }).catch(() => null);

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to fallback
        }
      }
    } catch (error: any) {
      // Silencioso - usar fallback
    }

    // Fallback: generar material básico hardcodeado
    const criteriaText = request.criteria.map((c, i) => `${i + 1}. ${c.text}`).join('\n');
    
    let material = '';
    const title = `# ${request.materialType === 'rubrica' ? 'Rúbrica de Evaluación' : 
                   request.materialType === 'ejercicios' ? 'Ejercicios Prácticos' :
                   request.materialType === 'guia' ? 'Guía de Retroalimentación' : 
                   'Ejemplos de Trabajos'}\n\n`;
    
    material += title;
    material += `## ${request.classInfo.producto}\n\n`;
    material += `**Área:** ${request.curriculum.area}  \n`;
    material += `**Grado:** ${request.curriculum.grado}\n\n`;
    material += `### Criterios de Evaluación\n\n${criteriaText}\n\n`;
    
    if (request.materialType === 'rubrica') {
      material += `### Niveles de Desempeño\n\n`;
      material += `| Criterio | Inicio | En proceso | Logrado | Destacado |\n`;
      material += `|----------|--------|------------|---------|-----------|\n`;
      request.criteria.forEach((c, i) => {
        material += `| ${i + 1}. ${c.text.substring(0, 40)}... | 1 punto | 2 puntos | 3 puntos | 4 puntos |\n`;
      });
    } else {
      material += `### Contenido\n\n`;
      material += `Este material ha sido generado automáticamente basado en los criterios de evaluación.\n\n`;
      material += `**Nota:** Por favor, personaliza este material según las necesidades específicas de tu aula.\n`;
    }
    
    return {
      material,
      materialType: request.materialType,
      generatedAt: new Date(),
    };
  },

  /**
   * Verifica el estado de OpenAI
   * Si el backend no está disponible, devuelve estado por defecto
   */
  async getAIStatus(): Promise<{ openaiAvailable: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(2000),
      }).catch(() => null);

      if (response && response.ok) {
        try {
          return await response.json();
        } catch {
          // Fall through to fallback
        }
      }
    } catch (error: any) {
      // Silencioso - usar fallback
    }

    // Fallback: devolver estado por defecto
    return {
      openaiAvailable: false,
      message: 'Backend no disponible. Usando modo simulación.',
    };
  },
};

