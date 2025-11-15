import type {
  AiGenerationRequest,
  AiGenerationResponse,
  LearningObjective,
  EvaluationCriterion,
  Resource,
} from '../types.js';

/**
 * Simulador de IA que genera objetivos, criterios y recursos
 * basándose en los datos de entrada de forma inteligente (pero fake)
 */
export class AiSimulator {
  /**
   * Genera objetivos de aprendizaje basados en el currículo y contexto
   */
  private generateObjectives(
    curriculum: AiGenerationRequest['curriculum'],
    classInfo: AiGenerationRequest['classInfo']
  ): LearningObjective[] {
    const objectives: LearningObjective[] = [];
    const baseId = `obj-${Date.now()}`;

    // Objetivos basados en el área y competencia
    if (curriculum.area === 'comunicacion') {
      if (curriculum.competencia === 'escribe') {
        objectives.push({
          id: `${baseId}-1`,
          text: `Identificar y utilizar recursos lingüísticos (${curriculum.capacidad}) para producir ${classInfo.producto} coherentes y adecuados al contexto.`,
          order: 1,
        });
        
        objectives.push({
          id: `${baseId}-2`,
          text: `Aplicar estructura textual apropiada para ${classInfo.producto} según las convenciones del ${curriculum.grado}.`,
          order: 2,
        });

        objectives.push({
          id: `${baseId}-3`,
          text: `Emplear vocabulario variado y preciso en la producción de ${classInfo.producto} considerando el contexto: ${classInfo.contexto.substring(0, 50)}...`,
          order: 3,
        });
      } else if (curriculum.competencia === 'lee') {
        objectives.push({
          id: `${baseId}-1`,
          text: `Comprender e interpretar textos de diversos tipos relacionados con ${classInfo.producto}.`,
          order: 1,
        });
        objectives.push({
          id: `${baseId}-2`,
          text: `Inferir información implícita y explícita de los textos leídos.`,
          order: 2,
        });
      }
    } else if (curriculum.area === 'matematica') {
      objectives.push({
        id: `${baseId}-1`,
        text: `Resolver problemas matemáticos relacionados con ${classInfo.producto} aplicando estrategias adecuadas.`,
        order: 1,
      });
      objectives.push({
        id: `${baseId}-2`,
        text: `Comunicar procedimientos y resultados de forma clara y organizada.`,
        order: 2,
      });
    } else {
      // Genérico para otras áreas
      objectives.push({
        id: `${baseId}-1`,
        text: `Desarrollar competencias de ${curriculum.area} mediante la producción de ${classInfo.producto}.`,
        order: 1,
      });
      objectives.push({
        id: `${baseId}-2`,
        text: `Aplicar conocimientos y habilidades del área de ${curriculum.area} en contextos específicos.`,
        order: 2,
      });
    }

    // Si hay objetivo personalizado, agregarlo
    if (classInfo.objetivo) {
      objectives.push({
        id: `${baseId}-custom`,
        text: classInfo.objetivo,
        order: objectives.length + 1,
      });
    }

    return objectives;
  }

  /**
   * Genera criterios de evaluación basados en el desempeño esperado
   */
  private generateCriteria(
    curriculum: AiGenerationRequest['curriculum'],
    classInfo: AiGenerationRequest['classInfo']
  ): EvaluationCriterion[] {
    const criteria: EvaluationCriterion[] = [];
    const baseId = `crit-${Date.now()}`;

    // Criterios basados en el desempeño
    if (curriculum.desempeno.includes('adjetivos') || curriculum.desempeno.includes('descriptivos')) {
      criteria.push({
        id: `${baseId}-1`,
        text: `El ${classInfo.producto} incluye al menos 5 recursos lingüísticos variados y apropiados al contexto.`,
        order: 1,
      });
      criteria.push({
        id: `${baseId}-2`,
        text: `La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.`,
        order: 2,
      });
      criteria.push({
        id: `${baseId}-3`,
        text: `Utiliza conectores textuales (además, también, por otro lado, sin embargo) para organizar las ideas de forma coherente.`,
        order: 3,
      });
      criteria.push({
        id: `${baseId}-4`,
        text: `Presenta ortografía adecuada en palabras de uso frecuente y respeta las normas de puntuación básicas según el ${curriculum.grado}.`,
        order: 4,
      });
    } else if (curriculum.desempeno.includes('organiza') || curriculum.desempeno.includes('ideas')) {
      criteria.push({
        id: `${baseId}-1`,
        text: `Organiza sus ideas en torno a un tema central relacionado con ${classInfo.producto}.`,
        order: 1,
      });
      criteria.push({
        id: `${baseId}-2`,
        text: `Utiliza párrafos coherentes con una idea principal y oraciones de apoyo.`,
        order: 2,
      });
      criteria.push({
        id: `${baseId}-3`,
        text: `Aplica recursos textuales para establecer relaciones entre ideas (conectores, referencias, sinónimos).`,
        order: 3,
      });
    } else {
      // Criterios genéricos
      criteria.push({
        id: `${baseId}-1`,
        text: `Demuestra comprensión del contenido abordado en ${classInfo.producto}.`,
        order: 1,
      });
      criteria.push({
        id: `${baseId}-2`,
        text: `Aplica los conocimientos del área de ${curriculum.area} de forma adecuada.`,
        order: 2,
      });
      criteria.push({
        id: `${baseId}-3`,
        text: `La ${classInfo.evidencia} cumple con los requisitos establecidos y refleja el nivel esperado para ${curriculum.grado}.`,
        order: 3,
      });
      criteria.push({
        id: `${baseId}-4`,
        text: `Utiliza recursos apropiados y muestra dominio de las convenciones básicas del área.`,
        order: 4,
      });
    }

    // Criterio específico basado en la evidencia
    if (classInfo.evidencia) {
      criteria.push({
        id: `${baseId}-evidencia`,
        text: `La evidencia (${classInfo.evidencia.substring(0, 60)}...) demuestra el logro de los aprendizajes esperados.`,
        order: criteria.length + 1,
      });
    }

    return criteria;
  }

  /**
   * Genera recursos sugeridos (videos, audios, imágenes) relacionados
   */
  private generateResources(
    curriculum: AiGenerationRequest['curriculum'],
    classInfo: AiGenerationRequest['classInfo']
  ): Resource[] {
    const resources: Resource[] = [];
    const baseId = `res-${Date.now()}`;

    // Videos sugeridos
    if (curriculum.area === 'comunicacion') {
      if (curriculum.competencia === 'escribe') {
        resources.push({
          id: `${baseId}-video-1`,
          type: 'video',
          title: `Cómo escribir ${classInfo.producto}: Guía paso a paso`,
          description: `Video educativo que explica el proceso de producción de ${classInfo.producto} con ejemplos prácticos para ${curriculum.grado}.`,
          url: '#',
        });
        resources.push({
          id: `${baseId}-video-2`,
          type: 'video',
          title: `${curriculum.capacidad}: Recursos y estrategias`,
          description: `Tutorial sobre cómo aplicar ${curriculum.capacidad} en producciones escritas.`,
          url: '#',
        });
      }
    }

    // Audios sugeridos
    resources.push({
      id: `${baseId}-audio-1`,
      type: 'audio',
      title: `Podcast: Estrategias para ${classInfo.producto}`,
      description: `Audio con ejemplos prácticos y consejos para desarrollar ${classInfo.producto} en el aula.`,
      url: '#',
    });

    // Imágenes/Infografías sugeridas
    if (curriculum.area === 'comunicacion') {
      resources.push({
        id: `${baseId}-image-1`,
        type: 'image',
        title: `Infografía: Estructura de ${classInfo.producto}`,
        description: `Material visual con la estructura y elementos clave para producir ${classInfo.producto}.`,
        url: '#',
      });
      resources.push({
        id: `${baseId}-image-2`,
        type: 'image',
        title: `Ejemplo de ${classInfo.producto} para referencia`,
        description: `Modelo o ejemplo de ${classInfo.producto} que los estudiantes pueden usar como referencia.`,
        url: '#',
      });
    } else {
      resources.push({
        id: `${baseId}-image-1`,
        type: 'image',
        title: `Infografía: ${curriculum.area} - ${curriculum.competencia}`,
        description: `Material visual con conceptos clave y ejemplos prácticos.`,
        url: '#',
      });
    }

    return resources;
  }

  /**
   * Método principal que genera la respuesta completa de IA
   */
  generate(request: AiGenerationRequest): AiGenerationResponse {
    // Simular delay de procesamiento (1500-2500ms)
    const delay = 1500 + Math.random() * 1000;
    
    // En producción real, aquí habría una llamada a OpenAI u otro servicio
    // Por ahora, generamos datos inteligentes basados en las entradas

    const objectives = this.generateObjectives(request.curriculum, request.classInfo);
    const criteria = this.generateCriteria(request.curriculum, request.classInfo);
    const resources = this.generateResources(request.curriculum, request.classInfo);

    return {
      objectives,
      criteria,
      resources,
      generatedAt: new Date(),
    };
  }

  /**
   * Versión asíncrona para simular mejor el comportamiento de IA
   */
  async generateAsync(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    return this.generate(request);
  }
}

export const aiSimulator = new AiSimulator();

