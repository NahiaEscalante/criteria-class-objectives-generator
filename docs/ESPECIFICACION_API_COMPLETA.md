# 📡 Especificación Completa de APIs - Backend CriterIA

**Versión:** 1.0.0  
**Fecha:** 2025-01-20  
**Base URL:** `http://localhost:8000/api` (desarrollo) / `https://api.criteria.com/api` (producción)

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Generación con IA](#generación-con-ia)
3. [Gestión de Archivos](#gestión-de-archivos)
4. [Gestión de Sesiones](#gestión-de-sesiones)
5. [Manejo de Errores](#manejo-de-errores)
6. [Autenticación JWT](#autenticación-jwt)
7. [Tipos de Datos](#tipos-de-datos)

---

## 🔐 Autenticación

### POST `/api/auth/register`

Registra un nuevo usuario en el sistema.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "docente@example.com",
  "password": "Password123",
  "name": "Juan Pérez"
}
```

#### Validaciones
- `email`: Requerido, formato de email válido, único en la base de datos
- `password`: Requerido, mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
- `name`: Requerido, mínimo 2 caracteres

#### Response Success (201 Created)
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "docente@example.com",
    "name": "Juan Pérez",
    "createdAt": "2025-01-20T10:30:00Z",
    "isActive": true
  },
  "token": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "El email ya está registrado"
}
```

#### Response Error (422 Unprocessable Entity)
```json
{
  "error": "ValidationError",
  "message": "La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números",
  "details": {
    "field": "password",
    "errors": ["La contraseña debe contener al menos una mayúscula"]
  }
}
```

---

### POST `/api/auth/login`

Inicia sesión con email y contraseña.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "docente@example.com",
  "password": "Password123"
}
```

#### Validaciones
- `email`: Requerido, formato de email válido
- `password`: Requerido

#### Response Success (200 OK)
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "docente@example.com",
    "name": "Juan Pérez",
    "createdAt": "2025-01-20T10:30:00Z",
    "isActive": true
  },
  "token": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Credenciales incorrectas"
}
```

#### Response Error (403 Forbidden)
```json
{
  "error": "AccountError",
  "message": "La cuenta está desactivada"
}
```

---

### GET `/api/auth/me`

Obtiene la información del usuario autenticado.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
Ninguno

#### Response Success (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "docente@example.com",
  "name": "Juan Pérez",
  "createdAt": "2025-01-20T10:30:00Z",
  "isActive": true
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

---

## 🤖 Generación con IA

### POST `/api/ai/generate`

Genera objetivos de aprendizaje, criterios de evaluación y recursos sugeridos usando IA.

#### Headers
```
Content-Type: application/json
Authorization: Bearer {access_token} (opcional, pero recomendado para guardar historial)
```

#### Request Body
```json
{
  "curriculum": {
    "area": "Comunicación",
    "competencia": "Escribe diversos tipos de textos",
    "capacidad": "Adecúa el texto a la situación comunicativa",
    "desempeno": "Escribe textos descriptivos utilizando adjetivos",
    "grado": "4to de Primaria"
  },
  "classInfo": {
    "producto": "Texto descriptivo",
    "evidencia": "Producción escrita individual de una página",
    "contexto": "Estudiantes de 4to de primaria de escuela pública, nivel heterogéneo",
    "objetivo": "Describir características de la comunidad usando adjetivos calificativos"
  },
  "fileId": "file-1234567890" // Opcional: ID del archivo PPT subido
}
```

#### Validaciones
- `curriculum.area`: Requerido
- `curriculum.competencia`: Requerido
- `curriculum.capacidad`: Requerido
- `curriculum.desempeno`: Requerido
- `curriculum.grado`: Requerido
- `classInfo.producto`: Requerido, mínimo 3 caracteres
- `classInfo.evidencia`: Requerido, mínimo 10 caracteres
- `classInfo.contexto`: Requerido, mínimo 20 caracteres
- `classInfo.objetivo`: Opcional
- `fileId`: Opcional, debe existir si se proporciona

#### Response Success (200 OK) - Generación inmediata
```json
{
  "objectives": [
    {
      "id": "obj-550e8400-e29b-41d4-a716-446655440000",
      "text": "Identificar y aplicar recursos apropiados para producir textos descriptivos coherentes y adecuados al contexto de 4to de Primaria.",
      "order": 1
    },
    {
      "id": "obj-550e8400-e29b-41d4-a716-446655440001",
      "text": "Aplicar estructura textual apropiada para textos descriptivos según las convenciones del área de Comunicación.",
      "order": 2
    },
    {
      "id": "obj-550e8400-e29b-41d4-a716-446655440002",
      "text": "Emplear vocabulario variado y preciso en la producción de textos descriptivos considerando el contexto de aprendizaje.",
      "order": 3
    }
  ],
  "criteria": [
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440000",
      "text": "El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.",
      "order": 1
    },
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440001",
      "text": "La producción sigue una estructura clara y organizada: introducción, desarrollo con características relevantes, y cierre.",
      "order": 2
    },
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440002",
      "text": "Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas de forma coherente.",
      "order": 3
    },
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440003",
      "text": "Presenta ortografía adecuada y respeta las normas básicas según el 4to de Primaria.",
      "order": 4
    },
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440004",
      "text": "La producción escrita individual demuestra el logro de los aprendizajes esperados.",
      "order": 5
    }
  ],
  "resources": [
    {
      "id": "res-video-550e8400-e29b-41d4-a716-446655440000",
      "type": "video",
      "title": "Cómo producir textos descriptivos",
      "description": "Video educativo que explica el proceso de producción de textos descriptivos con ejemplos prácticos.",
      "url": "https://storage.example.com/videos/video-123.mp4",
      "status": "ready",
      "thumbnail": "https://storage.example.com/videos/video-123-thumb.jpg",
      "duration": 300
    },
    {
      "id": "res-audio-550e8400-e29b-41d4-a716-446655440001",
      "type": "audio",
      "title": "Podcast: Estrategias para textos descriptivos",
      "description": "Audio con ejemplos prácticos y consejos para desarrollar textos descriptivos en el aula.",
      "url": "https://storage.example.com/audios/audio-123.mp3",
      "status": "ready",
      "duration": 180
    },
    {
      "id": "res-image-550e8400-e29b-41d4-a716-446655440002",
      "type": "image",
      "title": "Infografía: Estructura de textos descriptivos",
      "description": "Material visual con la estructura y elementos clave para producir textos descriptivos.",
      "url": "https://storage.example.com/images/infographic-123.png",
      "status": "ready"
    }
  ],
  "generatedAt": "2025-01-20T10:35:00Z",
  "generationId": null,
  "resourcesGenerating": false
}
```

#### Response Success (200 OK) - Generación asíncrona (recursos en background)
```json
{
  "objectives": [
    {
      "id": "obj-550e8400-e29b-41d4-a716-446655440000",
      "text": "Identificar y aplicar recursos apropiados...",
      "order": 1
    }
  ],
  "criteria": [
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440000",
      "text": "El texto descriptivo incluye recursos variados...",
      "order": 1
    }
  ],
  "resources": [
    {
      "id": "res-video-550e8400-e29b-41d4-a716-446655440000",
      "type": "video",
      "title": "Cómo producir textos descriptivos",
      "description": "Video educativo que explica el proceso...",
      "status": "generating",
      "progress": 45,
      "url": null
    },
    {
      "id": "res-audio-550e8400-e29b-41d4-a716-446655440001",
      "type": "audio",
      "title": "Podcast: Estrategias para textos descriptivos",
      "description": "Audio con ejemplos prácticos...",
      "status": "ready",
      "url": "https://storage.example.com/audios/audio-123.mp3",
      "duration": 180
    }
  ],
  "generatedAt": "2025-01-20T10:35:00Z",
  "generationId": "gen-550e8400-e29b-41d4-a716-446655440000",
  "resourcesGenerating": true
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "Faltan campos requeridos",
  "details": {
    "field": "curriculum.area",
    "message": "El área curricular es requerida"
  }
}
```

#### Response Error (500 Internal Server Error)
```json
{
  "error": "AIGenerationError",
  "message": "Error al generar contenido con IA. Por favor, intenta nuevamente."
}
```

#### Notas
- El tiempo de respuesta puede variar entre 5-30 segundos dependiendo de la complejidad
- Si se proporciona `fileId`, el sistema puede analizar el contenido del PPT para mejorar la generación
- Los recursos sugeridos pueden incluir URLs si están disponibles

---

### POST `/api/ai/generate-material`

Genera material educativo (rúbrica, ejercicios, guía, ejemplos) basado en los criterios de evaluación.

#### Headers
```
Content-Type: application/json
Authorization: Bearer {access_token} (opcional)
```

#### Request Body
```json
{
  "criteria": [
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440000",
      "text": "El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.",
      "order": 1
    },
    {
      "id": "crit-550e8400-e29b-41d4-a716-446655440001",
      "text": "La producción sigue una estructura clara y organizada.",
      "order": 2
    }
  ],
  "curriculum": {
    "area": "Comunicación",
    "competencia": "Escribe diversos tipos de textos",
    "capacidad": "Adecúa el texto a la situación comunicativa",
    "desempeno": "Escribe textos descriptivos utilizando adjetivos",
    "grado": "4to de Primaria"
  },
  "classInfo": {
    "producto": "Texto descriptivo",
    "evidencia": "Producción escrita individual de una página",
    "contexto": "Estudiantes de 4to de primaria de escuela pública",
    "objetivo": "Describir características de la comunidad"
  },
  "materialType": "rubrica" // "rubrica" | "ejercicios" | "guia" | "ejemplos"
}
```

#### Validaciones
- `criteria`: Requerido, array con al menos 1 elemento
- `curriculum`: Requerido, objeto válido
- `classInfo`: Requerido, objeto válido
- `materialType`: Requerido, uno de: "rubrica", "ejercicios", "guia", "ejemplos"

#### Response Success (200 OK)
```json
{
  "material": "# Rúbrica de Evaluación\n\n## Texto descriptivo\n\n**Área:** Comunicación  \n**Grado:** 4to de Primaria\n\n### Criterios de Evaluación\n\n1. El texto descriptivo incluye recursos variados y apropiados al contexto de aprendizaje.\n2. La producción sigue una estructura clara y organizada.\n\n### Niveles de Desempeño\n\n| Criterio | Inicio | En proceso | Logrado | Destacado |\n|----------|--------|------------|---------|-----------|\n| 1. El texto descriptivo incluye recursos... | 1 punto | 2 puntos | 3 puntos | 4 puntos |\n| 2. La producción sigue una estructura... | 1 punto | 2 puntos | 3 puntos | 4 puntos |\n\n**Total:** 8 puntos",
  "materialType": "rubrica",
  "generatedAt": "2025-01-20T10:40:00Z"
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "El tipo de material debe ser uno de: rubrica, ejercicios, guia, ejemplos"
}
```

#### Notas
- El material se devuelve en formato Markdown
- El tiempo de respuesta puede variar entre 3-15 segundos
- El contenido generado es personalizado según los criterios y contexto proporcionados

---

### GET `/api/ai/generation-status/{generationId}`

Obtiene el estado actual de la generación de recursos multimedia para una generación específica.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
- `generationId`: ID de la generación (UUID)

#### Request Body
Ninguno

#### Response Success (200 OK)
```json
{
  "resources": [
    {
      "id": "res-video-550e8400-e29b-41d4-a716-446655440000",
      "type": "video",
      "title": "Cómo producir textos descriptivos",
      "description": "Video educativo que explica el proceso...",
      "status": "generating",
      "progress": 75,
      "url": null,
      "thumbnail": null,
      "duration": null
    },
    {
      "id": "res-audio-550e8400-e29b-41d4-a716-446655440001",
      "type": "audio",
      "title": "Podcast: Estrategias para textos descriptivos",
      "description": "Audio con ejemplos prácticos...",
      "status": "ready",
      "url": "https://storage.example.com/audios/audio-123.mp3",
      "duration": 180
    },
    {
      "id": "res-image-550e8400-e29b-41d4-a716-446655440002",
      "type": "image",
      "title": "Infografía: Estructura de textos descriptivos",
      "description": "Material visual con la estructura...",
      "status": "ready",
      "url": "https://storage.example.com/images/infographic-123.png"
    },
    {
      "id": "res-video-550e8400-e29b-41d4-a716-446655440003",
      "type": "video",
      "title": "Tutorial avanzado",
      "description": "Video tutorial...",
      "status": "error",
      "error": "Error al generar video: Timeout en la generación",
      "url": null
    }
  ]
}
```

#### Estados de Recursos
- `pending`: Recurso pendiente de generación
- `generating`: Recurso en proceso de generación
- `ready`: Recurso generado y disponible
- `error`: Error al generar el recurso

#### Response Error (404 Not Found)
```json
{
  "error": "NotFoundError",
  "message": "Generación no encontrada"
}
```

#### Notas
- Este endpoint se usa para polling cuando los recursos se generan en background
- El frontend puede consultar cada 5-10 segundos hasta que todos los recursos estén `ready` o `error`
- El campo `progress` (0-100) indica el progreso de generación cuando está en estado `generating`

---

### GET `/api/ai/status`

Verifica el estado de la conexión con OpenAI y la disponibilidad del servicio de IA.

#### Headers
```
Content-Type: application/json
```

#### Request Body
Ninguno

#### Response Success (200 OK)
```json
{
  "openaiAvailable": true,
  "message": "Servicio de IA disponible y funcionando correctamente"
}
```

#### Response Success (200 OK) - Servicio no disponible
```json
{
  "openaiAvailable": false,
  "message": "Servicio de IA no disponible. Verifica la configuración de OpenAI."
}
```

#### Notas
- Este endpoint no requiere autenticación
- Útil para verificar la configuración antes de generar contenido

---

## 📁 Gestión de Archivos

### POST `/api/files/upload`

Sube un archivo PPT (PowerPoint) para análisis y generación de contenido.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

#### Request Body (FormData)
```
file: [File object]
```

#### Validaciones
- `file`: Requerido, debe ser un archivo PPT o PPTX
- Tamaño máximo: 50 MB
- Tipos permitidos: `.ppt`, `.pptx`

#### Response Success (200 OK)
```json
{
  "file": {
    "id": "file-550e8400-e29b-41d4-a716-446655440000",
    "name": "Sesion_Texto_Descriptivo.pptx",
    "size": 2048000,
    "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "uploadedAt": "2025-01-20T10:30:00Z",
    "url": "https://storage.example.com/files/file-550e8400..." // Opcional: URL de descarga
  }
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "El archivo debe ser un PPT o PPTX"
}
```

#### Response Error (413 Payload Too Large)
```json
{
  "error": "FileSizeError",
  "message": "El archivo excede el tamaño máximo permitido (50 MB)"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

#### Notas
- El archivo se almacena asociado al usuario autenticado
- El archivo puede ser usado posteriormente en la generación de IA proporcionando el `fileId`
- Los archivos pueden ser eliminados automáticamente después de un período de inactividad (configurable)

---

## 📚 Gestión de Sesiones

### GET `/api/sessions`

Obtiene la lista de sesiones del usuario autenticado (resumen).

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Query Parameters (Opcionales)
```
?page=1          // Número de página (default: 1)
?limit=20        // Elementos por página (default: 20, max: 100)
?area=Comunicación // Filtrar por área
?grado=4to de Primaria // Filtrar por grado
```

#### Request Body
Ninguno

#### Response Success (200 OK)
```json
{
  "sessions": [
    {
      "id": "session-550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Texto descriptivo sobre mi comunidad",
      "area": "Comunicación",
      "grado": "4to de Primaria",
      "fecha": "20 de enero de 2025"
    },
    {
      "id": "session-550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Problemas de suma y resta",
      "area": "Matemática",
      "grado": "3ro de Primaria",
      "fecha": "19 de enero de 2025"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

#### Notas
- Solo devuelve sesiones del usuario autenticado
- Ordenadas por fecha de creación (más recientes primero)
- La fecha está formateada en español (formato: "DD de MMMM de YYYY")

---

### GET `/api/sessions/{id}`

Obtiene una sesión completa por su ID.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
- `id`: ID de la sesión (UUID)

#### Request Body
Ninguno

#### Response Success (200 OK)
```json
{
  "id": "session-550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Texto descriptivo sobre mi comunidad",
  "curriculum": {
    "area": "Comunicación",
    "competencia": "Escribe diversos tipos de textos",
    "capacidad": "Adecúa el texto a la situación comunicativa",
    "desempeno": "Escribe textos descriptivos utilizando adjetivos",
    "grado": "4to de Primaria"
  },
  "classInfo": {
    "producto": "Texto descriptivo",
    "evidencia": "Producción escrita individual de una página",
    "contexto": "Estudiantes de 4to de primaria de escuela pública, nivel heterogéneo",
    "objetivo": "Describir características de la comunidad usando adjetivos calificativos"
  },
  "file": {
    "id": "file-550e8400-e29b-41d4-a716-446655440000",
    "name": "Sesion_Texto_Descriptivo.pptx",
    "size": 2048000,
    "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "uploadedAt": "2025-01-20T10:30:00Z"
  },
  "generation": {
    "objectives": [
      {
        "id": "obj-550e8400-e29b-41d4-a716-446655440000",
        "text": "Identificar y aplicar recursos apropiados para producir textos descriptivos...",
        "order": 1
      }
    ],
    "criteria": [
      {
        "id": "crit-550e8400-e29b-41d4-a716-446655440000",
        "text": "El texto descriptivo incluye recursos variados...",
        "order": 1
      }
    ],
    "resources": [
      {
        "id": "res-video-550e8400-e29b-41d4-a716-446655440000",
        "type": "video",
        "title": "Cómo producir textos descriptivos",
        "description": "Video educativo...",
        "url": "https://example.com/video1"
      }
    ],
    "generatedAt": "2025-01-20T10:35:00Z"
  },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:35:00Z"
}
```

#### Response Error (404 Not Found)
```json
{
  "error": "NotFoundError",
  "message": "Sesión no encontrada"
}
```

#### Response Error (403 Forbidden)
```json
{
  "error": "AuthorizationError",
  "message": "No tienes permiso para acceder a esta sesión"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

#### Notas
- Solo se puede acceder a sesiones propias del usuario
- El campo `file` es opcional (puede ser `null` si no se subió archivo)

---

### POST `/api/sessions`

Crea o actualiza una sesión.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "id": "session-550e8400-e29b-41d4-a716-446655440000", // Opcional: si se proporciona, actualiza; si no, crea nueva
  "nombre": "Texto descriptivo sobre mi comunidad",
  "curriculum": {
    "area": "Comunicación",
    "competencia": "Escribe diversos tipos de textos",
    "capacidad": "Adecúa el texto a la situación comunicativa",
    "desempeno": "Escribe textos descriptivos utilizando adjetivos",
    "grado": "4to de Primaria"
  },
  "classInfo": {
    "producto": "Texto descriptivo",
    "evidencia": "Producción escrita individual de una página",
    "contexto": "Estudiantes de 4to de primaria de escuela pública",
    "objetivo": "Describir características de la comunidad"
  },
  "fileId": "file-550e8400-e29b-41d4-a716-446655440000", // Opcional
  "generation": {
    "objectives": [
      {
        "id": "obj-550e8400-e29b-41d4-a716-446655440000",
        "text": "Identificar y aplicar recursos apropiados...",
        "order": 1
      }
    ],
    "criteria": [
      {
        "id": "crit-550e8400-e29b-41d4-a716-446655440000",
        "text": "El texto descriptivo incluye recursos variados...",
        "order": 1
      }
    ],
    "resources": [
      {
        "id": "res-video-550e8400-e29b-41d4-a716-446655440000",
        "type": "video",
        "title": "Cómo producir textos descriptivos",
        "description": "Video educativo...",
        "url": "https://example.com/video1"
      }
    ],
    "generatedAt": "2025-01-20T10:35:00Z"
  }
}
```

#### Validaciones
- `nombre`: Requerido, mínimo 3 caracteres
- `curriculum`: Requerido, objeto válido
- `classInfo`: Requerido, objeto válido
- `generation`: Requerido, objeto válido
- `fileId`: Opcional, debe existir si se proporciona

#### Response Success (201 Created) - Nueva sesión
```json
{
  "id": "session-550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Texto descriptivo sobre mi comunidad",
  "curriculum": { ... },
  "classInfo": { ... },
  "file": { ... },
  "generation": { ... },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

#### Response Success (200 OK) - Sesión actualizada
```json
{
  "id": "session-550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Texto descriptivo sobre mi comunidad (actualizado)",
  "curriculum": { ... },
  "classInfo": { ... },
  "file": { ... },
  "generation": { ... },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T11:00:00Z"
}
```

#### Response Error (400 Bad Request)
```json
{
  "error": "ValidationError",
  "message": "Faltan campos requeridos",
  "details": {
    "field": "nombre",
    "message": "El nombre es requerido"
  }
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

#### Notas
- Si se proporciona `id` y existe, se actualiza la sesión
- Si se proporciona `id` pero no existe, se crea una nueva con ese ID
- Si no se proporciona `id`, se genera uno automáticamente
- La sesión se asocia automáticamente al usuario autenticado

---

### DELETE `/api/sessions/{id}`

Elimina una sesión.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
- `id`: ID de la sesión (UUID)

#### Request Body
Ninguno

#### Response Success (204 No Content)
Sin cuerpo de respuesta

#### Response Error (404 Not Found)
```json
{
  "error": "NotFoundError",
  "message": "Sesión no encontrada"
}
```

#### Response Error (403 Forbidden)
```json
{
  "error": "AuthorizationError",
  "message": "No tienes permiso para eliminar esta sesión"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "error": "AuthenticationError",
  "message": "Token inválido o expirado"
}
```

#### Notas
- Solo se pueden eliminar sesiones propias
- La eliminación es permanente
- Si la sesión tiene un archivo asociado, también se elimina el archivo

---

### POST `/api/sessions/{id}/export`

Exporta una sesión en formato PDF o DOCX.

#### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
- `id`: ID de la sesión (UUID)

#### Request Body
```json
{
  "format": "pdf" // "pdf" | "docx"
}
```

#### Validaciones
- `format`: Requerido, uno de: "pdf", "docx"

#### Response Success (200 OK)
```json
{
  "downloadUrl": "https://storage.example.com/exports/session-550e8400-export.pdf",
  "expiresAt": "2025-01-20T12:00:00Z" // URL válida por 1 hora
}
```

#### Response Error (404 Not Found)
```json
{
  "error": "NotFoundError",
  "message": "Sesión no encontrada"
}
```

#### Response Error (500 Internal Server Error)
```json
{
  "error": "ExportError",
  "message": "Error al generar el archivo de exportación"
}
```

#### Notas
- El proceso de exportación puede tardar 10-30 segundos
- La URL de descarga expira después de 1 hora
- El formato PDF incluye todos los detalles de la sesión
- El formato DOCX es editable

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Error de validación o solicitud inválida |
| 401 | Unauthorized | Token inválido, expirado o ausente |
| 403 | Forbidden | No tienes permiso para esta operación |
| 404 | Not Found | Recurso no encontrado |
| 413 | Payload Too Large | Archivo demasiado grande |
| 422 | Unprocessable Entity | Error de validación de datos |
| 500 | Internal Server Error | Error del servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

### Formato de Error Estándar

Todos los errores siguen este formato:

```json
{
  "error": "ErrorType",
  "message": "Descripción del error en lenguaje humano",
  "details": {
    // Información adicional opcional
    "field": "campo específico",
    "errors": ["error 1", "error 2"]
  }
}
```

### Tipos de Error

- `ValidationError`: Error de validación de datos
- `AuthenticationError`: Error de autenticación
- `AuthorizationError`: Error de autorización
- `NotFoundError`: Recurso no encontrado
- `FileSizeError`: Error de tamaño de archivo
- `AIGenerationError`: Error en generación con IA
- `ExportError`: Error en exportación
- `ServerError`: Error interno del servidor

---

## 🔒 Autenticación JWT

### Formato del Token

El token JWT contiene la siguiente información:

```json
{
  "sub": "user-id-uuid",
  "email": "docente@example.com",
  "exp": 1737360000,
  "iat": 1737356400
}
```

### Uso del Token

1. **Obtener token:** Después de login o registro exitoso
2. **Incluir en requests:** Agregar header `Authorization: Bearer {token}`
3. **Validar token:** El backend valida el token en cada request protegido
4. **Renovar token:** El token expira después de `expires_in` segundos (3600 por defecto)

### Endpoints que Requieren Autenticación

- ✅ `GET /api/auth/me` - Requiere autenticación
- ✅ `POST /api/files/upload` - Requiere autenticación
- ✅ `GET /api/sessions` - Requiere autenticación
- ✅ `GET /api/sessions/{id}` - Requiere autenticación
- ✅ `POST /api/sessions` - Requiere autenticación
- ✅ `DELETE /api/sessions/{id}` - Requiere autenticación
- ✅ `POST /api/sessions/{id}/export` - Requiere autenticación
- ⚠️ `POST /api/ai/generate` - Opcional (recomendado para historial)
- ⚠️ `POST /api/ai/generate-material` - Opcional

### Endpoints Públicos

- ✅ `POST /api/auth/register` - No requiere autenticación
- ✅ `POST /api/auth/login` - No requiere autenticación
- ✅ `GET /api/ai/status` - No requiere autenticación

---

## 📊 Tipos de Datos

### User
```typescript
{
  id: string;              // UUID
  email: string;          // Email único
  name: string;           // Nombre completo
  createdAt: Date;        // ISO 8601
  isActive: boolean;      // Estado de la cuenta
}
```

### CurriculumSelection
```typescript
{
  area: string;           // Ej: "Comunicación"
  competencia: string;   // Ej: "Escribe diversos tipos de textos"
  capacidad: string;     // Ej: "Adecúa el texto a la situación comunicativa"
  desempeno: string;     // Ej: "Escribe textos descriptivos utilizando adjetivos"
  grado: string;         // Ej: "4to de Primaria"
}
```

### ClassInformation
```typescript
{
  producto: string;       // Ej: "Texto descriptivo"
  evidencia: string;     // Ej: "Producción escrita individual de una página"
  contexto: string;       // Ej: "Estudiantes de 4to de primaria..."
  objetivo?: string;     // Opcional
}
```

### LearningObjective
```typescript
{
  id: string;            // UUID
  text: string;          // Texto del objetivo
  order: number;         // Orden (1, 2, 3...)
}
```

### EvaluationCriterion
```typescript
{
  id: string;            // UUID
  text: string;          // Texto del criterio
  order: number;         // Orden (1, 2, 3...)
}
```

### Resource
```typescript
{
  id: string;            // UUID
  type: "video" | "audio" | "image";
  title: string;         // Título del recurso
  description: string;   // Descripción
  url?: string;          // URL opcional del recurso
}
```

### UploadedFile
```typescript
{
  id: string;            // UUID
  name: string;          // Nombre del archivo
  size: number;          // Tamaño en bytes
  type: string;          // MIME type
  uploadedAt: Date;      // ISO 8601
  url?: string;          // URL de descarga opcional
}
```

### Session
```typescript
{
  id: string;            // UUID
  nombre: string;        // Nombre de la sesión
  curriculum: CurriculumSelection;
  classInfo: ClassInformation;
  file?: UploadedFile;   // Opcional
  generation: {
    objectives: LearningObjective[];
    criteria: EvaluationCriterion[];
    resources: Resource[];
    generatedAt: Date;
  };
  createdAt: Date;       // ISO 8601
  updatedAt: Date;       // ISO 8601
}
```

### MaterialType
```typescript
"rubrica" | "ejercicios" | "guia" | "ejemplos"
```

---

## 🔧 Configuración del Backend

### Variables de Entorno Requeridas

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/criteria_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600  # segundos

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4  # o gpt-3.5-turbo

# Servidor
PORT=8000
ENVIRONMENT=development  # development | production

# CORS
CORS_ORIGINS=http://localhost:8080,http://localhost:3000

# Storage (opcional)
STORAGE_TYPE=local  # local | s3
STORAGE_PATH=./uploads
# Si usas S3:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=...
```

### CORS Configuration

El backend debe permitir:
- **Origins:** `http://localhost:8080` (desarrollo), dominio de producción
- **Methods:** GET, POST, DELETE
- **Headers:** Authorization, Content-Type
- **Credentials:** true

---

## 📝 Notas de Implementación

### Validaciones Importantes

1. **Email:** Debe ser único en la base de datos
2. **Password:** Mínimo 8 caracteres, mayúsculas, minúsculas y números
3. **Archivos:** Solo PPT/PPTX, máximo 50 MB
4. **IDs:** Todos los IDs deben ser UUIDs válidos
5. **Fechas:** Todas las fechas en formato ISO 8601

### Seguridad

1. **Passwords:** Deben hashearse con bcrypt (mínimo 10 rounds)
2. **JWT:** Firmar con algoritmo HS256
3. **File Uploads:** Validar tipo MIME, no solo extensión
4. **Rate Limiting:** Implementar límites de requests por usuario
5. **SQL Injection:** Usar queries parametrizadas

### Performance

1. **Caché:** Cachear respuestas de `/api/ai/status`
2. **Paginación:** Implementar paginación en `/api/sessions`
3. **Async Processing:** Considerar cola de trabajos para generación de IA
4. **File Storage:** Usar almacenamiento externo (S3) en producción

---

## 🚀 Ejemplos de Uso

### Flujo Completo: Crear Sesión

1. **Registrar usuario:**
```bash
POST /api/auth/register
```

2. **Iniciar sesión:**
```bash
POST /api/auth/login
# Guardar token
```

3. **Subir archivo (opcional):**
```bash
POST /api/files/upload
# Guardar fileId
```

4. **Generar con IA:**
```bash
POST /api/ai/generate
# Con Authorization header
```

5. **Guardar sesión:**
```bash
POST /api/sessions
# Con Authorization header
```

6. **Exportar sesión:**
```bash
POST /api/sessions/{id}/export
# Con Authorization header
```

---

**Documento generado para la implementación del backend FastAPI de CriterIA**
