/**
 * Datos de prueba embebidos para desarrollo y testing
 * Estos datos permiten probar la aplicación sin necesidad de backend
 */

import type {
  Session,
  SessionListItem,
  AiGenerationResponse,
  User,
  AuthResponse,
  MaterialGenerationResponse,
} from '@/types';

// ===== USUARIOS DE PRUEBA =====

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'docente1@example.com',
    name: 'María González',
    createdAt: new Date('2024-01-15'),
    isActive: true,
  },
  {
    id: 'user-2',
    email: 'docente2@example.com',
    name: 'Juan Pérez',
    createdAt: new Date('2024-02-20'),
    isActive: true,
  },
  {
    id: 'user-3',
    email: 'docente3@example.com',
    name: 'Ana Martínez',
    createdAt: new Date('2024-03-10'),
    isActive: true,
  },
];

// ===== RESPUESTAS DE AUTENTICACIÓN DE PRUEBA =====

export const MOCK_AUTH_RESPONSES: Record<string, AuthResponse> = {
  'docente1@example.com': {
    user: MOCK_USERS[0],
    token: {
      access_token: 'mock-token-user-1-' + Date.now(),
      token_type: 'bearer',
      expires_in: 3600,
    },
  },
  'docente2@example.com': {
    user: MOCK_USERS[1],
    token: {
      access_token: 'mock-token-user-2-' + Date.now(),
      token_type: 'bearer',
      expires_in: 3600,
    },
  },
  'docente3@example.com': {
    user: MOCK_USERS[2],
    token: {
      access_token: 'mock-token-user-3-' + Date.now(),
      token_type: 'bearer',
      expires_in: 3600,
    },
  },
};

// ===== RESPUESTAS DE GENERACIÓN DE IA DE PRUEBA =====

export const MOCK_AI_RESPONSES: Record<string, AiGenerationResponse> = {
  default: {
    objectives: [
      {
        id: 'obj-1',
        text: 'Identificar y aplicar recursos apropiados para producir textos descriptivos coherentes y adecuados al contexto de 4to de Primaria.',
        order: 1,
      },
      {
        id: 'obj-2',
        text: 'Aplicar estructura textual apropiada para textos descriptivos según las convenciones del área de Comunicación.',
        order: 2,
      },
      {
        id: 'obj-3',
        text: 'Emplear vocabulario variado y preciso en la producción de textos descriptivos considerando el contexto de aprendizaje.',
        order: 3,
      },
    ],
    criteria: [
      {
        id: 'crit-1',
        text: 'El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.',
        order: 1,
      },
      {
        id: 'crit-2',
        text: 'La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.',
        order: 2,
      },
      {
        id: 'crit-3',
        text: 'Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.',
        order: 3,
      },
      {
        id: 'crit-4',
        text: 'Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.',
        order: 4,
      },
      {
        id: 'crit-5',
        text: 'La producción escrita individual demuestra el logro de los aprendizajes esperados.',
        order: 5,
      },
    ],
    resources: [
      {
        id: 'res-video-1',
        type: 'video',
        title: 'Cómo producir textos descriptivos',
        description: 'Video educativo que explica el proceso de producción de textos descriptivos con ejemplos prácticos.',
      },
      {
        id: 'res-video-2',
        type: 'video',
        title: 'Adecúa el texto a la situación comunicativa: Estrategias y recursos',
        description: 'Tutorial sobre cómo aplicar la capacidad de adecuar textos en producciones del área de Comunicación.',
      },
      {
        id: 'res-audio-1',
        type: 'audio',
        title: 'Podcast: Estrategias para textos descriptivos',
        description: 'Audio con ejemplos prácticos y consejos para desarrollar textos descriptivos en el aula.',
      },
      {
        id: 'res-image-1',
        type: 'image',
        title: 'Infografía: Estructura de textos descriptivos',
        description: 'Material visual con la estructura y elementos clave para producir textos descriptivos.',
      },
      {
        id: 'res-image-2',
        type: 'image',
        title: 'Ejemplo de texto descriptivo para referencia',
        description: 'Modelo o ejemplo de texto descriptivo que los estudiantes pueden usar como referencia.',
      },
    ],
    generatedAt: new Date(),
  },
  matematica: {
    objectives: [
      {
        id: 'obj-math-1',
        text: 'Resolver problemas que involucren operaciones con números naturales en situaciones cotidianas.',
        order: 1,
      },
      {
        id: 'obj-math-2',
        text: 'Aplicar estrategias de cálculo mental y escrito para resolver problemas matemáticos.',
        order: 2,
      },
    ],
    criteria: [
      {
        id: 'crit-math-1',
        text: 'Identifica correctamente los datos del problema y lo que se pide encontrar.',
        order: 1,
      },
      {
        id: 'crit-math-2',
        text: 'Aplica las operaciones matemáticas correctas para resolver el problema.',
        order: 2,
      },
      {
        id: 'crit-math-3',
        text: 'Presenta la solución de forma clara y organizada.',
        order: 3,
      },
    ],
    resources: [
      {
        id: 'res-math-1',
        type: 'video',
        title: 'Resolución de problemas matemáticos',
        description: 'Video que explica paso a paso cómo resolver problemas matemáticos.',
      },
    ],
    generatedAt: new Date(),
  },
};

// ===== SESIONES DE PRUEBA =====

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    nombre: 'Texto descriptivo sobre mi comunidad',
    curriculum: {
      area: 'Comunicación',
      competencia: 'Escribe diversos tipos de textos',
      capacidad: 'Adecúa el texto a la situación comunicativa',
      desempeno: 'Escribe textos descriptivos utilizando adjetivos',
      grado: '4to de Primaria',
    },
    classInfo: {
      producto: 'Texto descriptivo',
      evidencia: 'Producción escrita individual de una página',
      contexto: 'Estudiantes de 4to de primaria de escuela pública, nivel heterogéneo con diferentes ritmos de aprendizaje',
      objetivo: 'Describir características de la comunidad usando adjetivos calificativos',
    },
    file: {
      id: 'file-1',
      name: 'Sesion_Texto_Descriptivo.pptx',
      size: 2048000,
      type: 'application/vnd.ms-powerpoint',
      uploadedAt: new Date('2024-01-15'),
    },
    generation: MOCK_AI_RESPONSES.default,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'session-2',
    nombre: 'Problemas de suma y resta',
    curriculum: {
      area: 'Matemática',
      competencia: 'Resuelve problemas de cantidad',
      capacidad: 'Traduce cantidades a expresiones numéricas',
      desempeno: 'Resuelve problemas que involucran suma y resta',
      grado: '3ro de Primaria',
    },
    classInfo: {
      producto: 'Resolución de problemas',
      evidencia: 'Hoja de trabajo con 5 problemas resueltos',
      contexto: 'Estudiantes de 3ro de primaria, nivel básico, necesitan apoyo visual',
      objetivo: 'Resolver problemas de suma y resta en situaciones cotidianas',
    },
    generation: MOCK_AI_RESPONSES.matematica,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'session-3',
    nombre: 'Afiche informativo sobre el reciclaje',
    curriculum: {
      area: 'Comunicación',
      competencia: 'Escribe diversos tipos de textos',
      capacidad: 'Organiza y desarrolla las ideas de forma coherente',
      desempeno: 'Organiza sus ideas en torno a un tema central',
      grado: '5to de Primaria',
    },
    classInfo: {
      producto: 'Afiche informativo',
      evidencia: 'Afiche en cartulina tamaño A3 con información sobre reciclaje',
      contexto: 'Estudiantes de 5to de primaria, nivel intermedio, trabajan en grupos',
      objetivo: 'Crear un afiche que informe sobre la importancia del reciclaje',
    },
    generation: {
      objectives: [
        {
          id: 'obj-afiche-1',
          text: 'Organizar información relevante sobre el reciclaje de forma clara y estructurada.',
          order: 1,
        },
        {
          id: 'obj-afiche-2',
          text: 'Utilizar recursos visuales y textuales apropiados para comunicar el mensaje.',
          order: 2,
        },
      ],
      criteria: [
        {
          id: 'crit-afiche-1',
          text: 'El afiche presenta información clara y organizada sobre el reciclaje.',
          order: 1,
        },
        {
          id: 'crit-afiche-2',
          text: 'Utiliza imágenes y textos que complementan el mensaje.',
          order: 2,
        },
        {
          id: 'crit-afiche-3',
          text: 'El diseño es atractivo y facilita la lectura.',
          order: 3,
        },
      ],
      resources: [
        {
          id: 'res-afiche-1',
          type: 'image',
          title: 'Ejemplos de afiches informativos',
          description: 'Galería de afiches informativos como referencia para los estudiantes.',
        },
      ],
      generatedAt: new Date('2024-01-25'),
    },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// ===== LISTA DE SESIONES DE PRUEBA =====

export const MOCK_SESSION_LIST: SessionListItem[] = MOCK_SESSIONS.map((session) => ({
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

// ===== MATERIALES EDUCATIVOS DE PRUEBA =====

export const MOCK_MATERIALS: Record<string, MaterialGenerationResponse> = {
  rubrica: {
    material: `# Rúbrica de Evaluación

## Texto descriptivo

**Área:** Comunicación  
**Grado:** 4to de Primaria

### Criterios de Evaluación

1. El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.
2. La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.
3. Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.
4. Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.
5. La producción escrita individual demuestra el logro de los aprendizajes esperados.

### Niveles de Desempeño

| Criterio | Inicio (1 punto) | En proceso (2 puntos) | Logrado (3 puntos) | Destacado (4 puntos) |
|----------|------------------|----------------------|-------------------|---------------------|
| 1. Recursos variados | No incluye recursos descriptivos | Incluye algunos recursos pero limitados | Incluye recursos variados y apropiados | Incluye recursos creativos y muy apropiados |
| 2. Estructura | No tiene estructura clara | Tiene estructura parcial | Tiene estructura clara y organizada | Tiene estructura excelente y muy organizada |
| 3. Conectores | No utiliza conectores | Utiliza pocos conectores | Utiliza conectores apropiados | Utiliza conectores variados y efectivos |
| 4. Ortografía | Muchos errores ortográficos | Algunos errores ortográficos | Pocos errores ortográficos | Sin errores ortográficos |
| 5. Logro de aprendizajes | No demuestra logro | Demuestra logro parcial | Demuestra logro completo | Demuestra logro destacado |

**Total:** 20 puntos`,
    materialType: 'rubrica',
    generatedAt: new Date(),
  },
  ejercicios: {
    material: `# Ejercicios Prácticos

## Texto descriptivo

**Área:** Comunicación  
**Grado:** 4to de Primaria

### Criterios de Evaluación

1. El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.
2. La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.
3. Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.
4. Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.
5. La producción escrita individual demuestra el logro de los aprendizajes esperados.

### Contenido

#### Ejercicio 1: Identificar adjetivos
Lee el siguiente texto y subraya todos los adjetivos calificativos que encuentres:
"Mi escuela es grande y bonita. Tiene un patio amplio donde jugamos durante el recreo. Las aulas son luminosas y cómodas."

#### Ejercicio 2: Completar descripción
Completa la siguiente descripción usando adjetivos apropiados:
"Mi mascota es un perro _____. Tiene el pelo _____ y los ojos _____. Es muy _____ y _____."

#### Ejercicio 3: Escribir descripción
Escribe una descripción de tu lugar favorito siguiendo esta estructura:
- Introducción: Presenta el lugar
- Desarrollo: Describe sus características principales
- Cierre: Expresa tu opinión sobre el lugar

**Nota:** Por favor, personaliza estos ejercicios según las necesidades específicas de tu aula.`,
    materialType: 'ejercicios',
    generatedAt: new Date(),
  },
  guia: {
    material: `# Guía de Retroalimentación

## Texto descriptivo

**Área:** Comunicación  
**Grado:** 4to de Primaria

### Criterios de Evaluación

1. El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.
2. La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.
3. Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.
4. Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.
5. La producción escrita individual demuestra el logro de los aprendizajes esperados.

### Contenido

#### Retroalimentación para Criterio 1: Recursos variados
- **Fortalezas:** "Has utilizado adjetivos variados como 'grande', 'colorido', 'amplio'."
- **Mejoras:** "Podrías incluir más recursos descriptivos como comparaciones o metáforas simples."

#### Retroalimentación para Criterio 2: Estructura
- **Fortalezas:** "Tu texto tiene una introducción clara y un desarrollo organizado."
- **Mejoras:** "Recuerda incluir un cierre que resuma las ideas principales."

#### Retroalimentación para Criterio 3: Conectores
- **Fortalezas:** "Has usado conectores como 'además' y 'también' correctamente."
- **Mejoras:** "Intenta usar más variedad de conectores para enriquecer tu texto."

#### Retroalimentación para Criterio 4: Ortografía
- **Fortalezas:** "La mayoría de las palabras están escritas correctamente."
- **Mejoras:** "Revisa la escritura de palabras con 'b' y 'v', y palabras con 'c' y 's'."

#### Retroalimentación para Criterio 5: Logro de aprendizajes
- **Fortalezas:** "Tu texto demuestra que comprendes cómo escribir descripciones."
- **Mejoras:** "Continúa practicando para mejorar la calidad de tus descripciones."

**Nota:** Por favor, personaliza esta guía según las necesidades específicas de cada estudiante.`,
    materialType: 'guia',
    generatedAt: new Date(),
  },
  ejemplos: {
    material: `# Ejemplos de Trabajos

## Texto descriptivo

**Área:** Comunicación  
**Grado:** 4to de Primaria

### Criterios de Evaluación

1. El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.
2. La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.
3. Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.
4. Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.
5. La producción escrita individual demuestra el logro de los aprendizajes esperados.

### Contenido

#### Ejemplo 1: Texto descriptivo - Nivel Logrado

**Mi Escuela**

Mi escuela es un lugar muy especial. Es grande y tiene muchos espacios para aprender y jugar.

Además, tiene un patio amplio donde podemos correr y jugar durante el recreo. También tiene aulas luminosas y cómodas donde estudiamos todos los días.

En conclusión, mi escuela es un lugar donde me siento feliz y aprendo muchas cosas importantes.

**Análisis:** Este ejemplo muestra una estructura clara (introducción, desarrollo, cierre), uso de adjetivos variados, y conectores apropiados.

#### Ejemplo 2: Texto descriptivo - Nivel Destacado

**El Parque de mi Barrio**

El parque de mi barrio es el lugar más hermoso que conozco. Es un espacio verde y tranquilo donde las familias se reúnen los fines de semana.

Además de tener árboles altos y frondosos, también tiene juegos coloridos para los niños. Por otro lado, tiene bancas cómodas donde los adultos pueden descansar.

En resumen, este parque es un lugar mágico que hace que mi barrio sea especial y acogedor.

**Análisis:** Este ejemplo muestra un uso excelente de recursos descriptivos, estructura muy organizada, y conectores variados y efectivos.

**Nota:** Estos ejemplos pueden usarse como referencia para que los estudiantes comprendan mejor cómo escribir textos descriptivos.`,
    materialType: 'ejemplos',
    generatedAt: new Date(),
  },
};

// ===== UTILIDADES =====

/**
 * Simula un delay para hacer las respuestas más realistas
 */
export function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Obtiene una respuesta de IA basada en el área
 */
export function getMockAIResponse(area: string): AiGenerationResponse {
  if (area.toLowerCase().includes('matemática') || area.toLowerCase().includes('matematica')) {
    return MOCK_AI_RESPONSES.matematica;
  }
  return MOCK_AI_RESPONSES.default;
}

/**
 * Obtiene un material educativo de prueba
 */
export function getMockMaterial(type: string): MaterialGenerationResponse {
  return MOCK_MATERIALS[type] || MOCK_MATERIALS.rubrica;
}
