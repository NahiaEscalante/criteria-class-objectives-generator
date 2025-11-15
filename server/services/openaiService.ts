import OpenAI from 'openai';
import type { EvaluationCriterion, CurriculumSelection, ClassInformation } from '../types.js';

/**
 * Servicio para interactuar con OpenAI
 * Si no hay API key, funciona en modo simulación
 */
class OpenAIService {
  private client: OpenAI | null = null;
  private isAvailable: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        this.client = new OpenAI({ apiKey });
        this.isAvailable = true;
        console.log('✅ OpenAI configurado correctamente');
      } catch (error) {
        console.warn('⚠️ Error al inicializar OpenAI:', error);
        this.isAvailable = false;
      }
    } else {
      console.warn('⚠️ OPENAI_API_KEY no configurada. Usando modo simulación.');
      this.isAvailable = false;
    }
  }

  /**
   * Genera material educativo basado en los criterios de evaluación
   */
  async generateMaterial(
    criteria: EvaluationCriterion[],
    curriculum: CurriculumSelection,
    classInfo: ClassInformation,
    materialType: 'rubrica' | 'ejercicios' | 'guia' | 'ejemplos' = 'rubrica'
  ): Promise<string> {
    if (!this.isAvailable || !this.client) {
      // Modo simulación si no hay API key
      return this.generateSimulatedMaterial(criteria, curriculum, classInfo, materialType);
    }

    try {
      const prompt = this.buildPrompt(criteria, curriculum, classInfo, materialType);
      
      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en educación peruana, especializado en la Currícula Nacional y en la creación de materiales educativos de alta calidad para docentes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No se recibió contenido de OpenAI');
      }

      return content;
    } catch (error: any) {
      console.error('Error al generar material con OpenAI:', error);
      // Fallback a simulación si hay error
      return this.generateSimulatedMaterial(criteria, curriculum, classInfo, materialType);
    }
  }

  /**
   * Construye el prompt para OpenAI según el tipo de material
   */
  private buildPrompt(
    criteria: EvaluationCriterion[],
    curriculum: CurriculumSelection,
    classInfo: ClassInformation,
    materialType: string
  ): string {
    const criteriaText = criteria.map((c, i) => `${i + 1}. ${c.text}`).join('\n');

    let prompt = `Contexto educativo:
- Área: ${curriculum.area}
- Competencia: ${curriculum.competencia}
- Capacidad: ${curriculum.capacidad}
- Desempeño esperado: ${curriculum.desempeno}
- Grado: ${curriculum.grado}
- Producto: ${classInfo.producto}
- Evidencia: ${classInfo.evidencia}
- Contexto de estudiantes: ${classInfo.contexto}

Criterios de evaluación:
${criteriaText}

`;

    switch (materialType) {
      case 'rubrica':
        prompt += `Genera una rúbrica de evaluación detallada basada en los criterios anteriores. La rúbrica debe incluir:
- Niveles de desempeño (Inicio, En proceso, Logrado, Destacado)
- Descripción clara de cada nivel para cada criterio
- Puntos o porcentajes de evaluación
- Formato claro y profesional, listo para usar en el aula

Formato la respuesta en markdown con encabezados y tablas.`;
        break;

      case 'ejercicios':
        prompt += `Genera ejercicios prácticos y actividades de evaluación basados en los criterios. Debe incluir:
- Al menos 3 ejercicios diferentes
- Instrucciones claras para cada ejercicio
- Cómo cada ejercicio se relaciona con los criterios de evaluación
- Sugerencias de implementación en el aula

Formato la respuesta en markdown.`;
        break;

      case 'guia':
        prompt += `Genera una guía de retroalimentación para docentes basada en los criterios. Debe incluir:
- Cómo evaluar cada criterio
- Ejemplos de retroalimentación positiva y constructiva
- Indicadores de logro para cada criterio
- Sugerencias para mejorar el desempeño de los estudiantes

Formato la respuesta en markdown.`;
        break;

      case 'ejemplos':
        prompt += `Genera ejemplos de trabajos de estudiantes que cumplan con los criterios. Debe incluir:
- Ejemplos de trabajos en diferentes niveles (inicio, proceso, logrado)
- Análisis de por qué cada ejemplo cumple o no cumple los criterios
- Qué elementos específicos demuestran el logro de cada criterio

Formato la respuesta en markdown.`;
        break;

      default:
        prompt += `Genera material educativo útil basado en los criterios de evaluación.`;
    }

    return prompt;
  }

  /**
   * Genera material simulado cuando no hay OpenAI disponible
   */
  private generateSimulatedMaterial(
    criteria: EvaluationCriterion[],
    curriculum: CurriculumSelection,
    classInfo: ClassInformation,
    materialType: string
  ): string {
    const criteriaText = criteria.map((c, i) => `${i + 1}. ${c.text}`).join('\n');

    if (materialType === 'rubrica') {
      return `# Rúbrica de Evaluación

## ${classInfo.producto}

**Área:** ${curriculum.area}  
**Grado:** ${curriculum.grado}

### Criterios de Evaluación

${criteria.map((c, i) => `
#### Criterio ${i + 1}: ${c.text.substring(0, 50)}...

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| **Destacado** | Supera las expectativas del criterio. Demuestra dominio excepcional. | 4 |
| **Logrado** | Cumple completamente con el criterio. Demuestra comprensión adecuada. | 3 |
| **En proceso** | Cumple parcialmente con el criterio. Requiere mejoras menores. | 2 |
| **Inicio** | No cumple con el criterio. Requiere apoyo significativo. | 1 |

`).join('\n')}

**Total de puntos:** ${criteria.length * 4}

---
*Nota: Esta es una rúbrica generada automáticamente. Se recomienda revisarla y ajustarla según las necesidades específicas del aula.*
`;
    }

    if (materialType === 'ejercicios') {
      return `# Ejercicios y Actividades de Evaluación

## ${classInfo.producto}

### Ejercicio 1: Evaluación de ${criteria[0]?.text.substring(0, 30)}...

**Objetivo:** Evaluar el primer criterio de evaluación.

**Instrucciones:**
1. Los estudiantes deberán...
2. Se evaluará específicamente...
3. Criterio relacionado: ${criteria[0]?.text}

**Tiempo estimado:** 30 minutos

---

### Ejercicio 2: Evaluación práctica

**Objetivo:** Evaluar múltiples criterios de forma integrada.

**Instrucciones:**
- Actividad práctica relacionada con ${classInfo.producto}
- Incluye evaluación de: ${criteria.slice(0, 2).map(c => c.text.substring(0, 40)).join(', ')}

---

*Nota: Estos ejercicios son sugerencias. Adapta según el contexto de tus estudiantes.*
`;
    }

    if (materialType === 'guia') {
      return `# Guía de Retroalimentación

## Cómo evaluar: ${classInfo.producto}

### Criterios y Retroalimentación

${criteria.map((c, i) => `
#### Criterio ${i + 1}: ${c.text}

**Indicadores de logro:**
- El estudiante demuestra...
- La evidencia muestra...
- Se observa...

**Retroalimentación sugerida:**
- **Positiva:** "Excelente trabajo en..."
- **Constructiva:** "Para mejorar, considera..."

`).join('\n')}

---
*Usa esta guía como referencia al proporcionar retroalimentación a tus estudiantes.*
`;
    }

    return `# Material Educativo Generado

## Basado en los criterios de evaluación

${criteriaText}

**Contexto:** ${classInfo.contexto}

Este material ha sido generado automáticamente. Se recomienda revisarlo y personalizarlo según las necesidades del aula.
`;
  }

  /**
   * Verifica si OpenAI está disponible
   */
  isOpenAIAvailable(): boolean {
    return this.isAvailable;
  }
}

export const openaiService = new OpenAIService();

