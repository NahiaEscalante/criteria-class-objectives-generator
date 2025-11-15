# Backend de CriterIA - Documentación

## Resumen

Se ha implementado un backend completo con Express.js que simula las funcionalidades de una API real. El backend incluye:

- ✅ Rutas de API para generación con IA (simulada)
- ✅ Gestión de sesiones (CRUD completo)
- ✅ Subida de archivos PPT (simulación)
- ✅ Almacenamiento persistente en archivo JSON
- ✅ Simulación de IA que genera contenido inteligente basado en los datos de entrada

## Estructura del Backend

```
server/
├── index.ts              # Servidor Express principal
├── types.ts              # Tipos compartidos
├── routes/
│   ├── ai.ts            # Rutas de generación con IA
│   ├── sessions.ts      # Rutas de gestión de sesiones
│   └── files.ts         # Rutas de archivos
├── services/
│   ├── aiSimulator.ts   # Simulador de IA
│   └── storage.ts       # Servicio de almacenamiento (JSON)
└── data/
    └── sessions.json    # Archivo de datos (se crea automáticamente)
```

## Endpoints de la API

### 1. Generación con IA

**POST** `/api/ai/generate`

Genera objetivos, criterios y recursos sugeridos basándose en el currículo y contexto.

**Body:**
```json
{
  "curriculum": {
    "area": "comunicacion",
    "competencia": "escribe",
    "capacidad": "adecua",
    "desempeno": "Escribe textos descriptivos utilizando adjetivos",
    "grado": "4to de Primaria"
  },
  "classInfo": {
    "producto": "Texto descriptivo",
    "evidencia": "Producción escrita individual",
    "contexto": "Estudiantes de 4to grado...",
    "objetivo": "Objetivo opcional"
  },
  "fileId": "id-del-archivo-ppt" // opcional
}
```

**Response:**
```json
{
  "objectives": [
    {
      "id": "obj-...",
      "text": "Objetivo de aprendizaje...",
      "order": 1
    }
  ],
  "criteria": [
    {
      "id": "crit-...",
      "text": "Criterio de evaluación...",
      "order": 1
    }
  ],
  "resources": [
    {
      "id": "res-...",
      "type": "video",
      "title": "Título del recurso",
      "description": "Descripción...",
      "url": "#"
    }
  ],
  "generatedAt": "2025-01-20T..."
}
```

### 2. Gestión de Sesiones

#### POST `/api/sessions`
Guarda una nueva sesión.

**Body:** Objeto `Session` completo (ver `src/types/index.ts`)

#### GET `/api/sessions`
Lista todas las sesiones (resumen).

**Response:** Array de `SessionListItem[]`

#### GET `/api/sessions/:id`
Obtiene una sesión completa por ID.

**Response:** Objeto `Session`

#### DELETE `/api/sessions/:id`
Elimina una sesión.

**Response:**
```json
{
  "success": true,
  "message": "Sesión eliminada correctamente"
}
```

#### POST `/api/sessions/:id/export`
Exporta una sesión (simulación).

**Body:**
```json
{
  "format": "pdf" // o "docx"
}
```

### 3. Archivos

#### POST `/api/files/upload`
Sube un archivo PPT (simulación - solo guarda metadatos).

**Body:**
```json
{
  "name": "presentacion.pptx",
  "size": 123456,
  "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
}
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "name": "presentacion.pptx",
    "size": 123456,
    "type": "...",
    "uploadedAt": "2025-01-20T..."
  }
}
```

## Simulación de IA

El módulo `aiSimulator.ts` genera contenido inteligente basándose en:

- **Área curricular**: Diferencia entre Comunicación, Matemática, etc.
- **Competencia**: Genera objetivos diferentes según si es "escribe", "lee", etc.
- **Desempeño esperado**: Los criterios se adaptan al desempeño seleccionado
- **Información de la clase**: Producto, evidencia y contexto se incorporan en el contenido generado

### Ejemplo de generación inteligente

Si el área es "comunicacion" y la competencia es "escribe":
- Genera objetivos sobre producción de textos
- Incluye criterios sobre estructura textual, ortografía, conectores
- Sugiere recursos de videos sobre escritura

Si el área es "matematica":
- Genera objetivos sobre resolución de problemas
- Incluye criterios sobre procedimientos y comunicación matemática

## Almacenamiento

Las sesiones se guardan en `server/data/sessions.json`. El servicio de almacenamiento:

- Crea el directorio automáticamente si no existe
- Convierte fechas entre JSON (strings) y Date objects
- Maneja errores de lectura/escritura
- Ordena sesiones por fecha (más recientes primero)

## Configuración

### Variables de Entorno

- `PORT`: Puerto del servidor (default: 3001)
- `FRONTEND_URL`: URL del frontend para CORS (default: http://localhost:8080)

### Proxy de Vite

El archivo `vite.config.ts` está configurado para redirigir todas las peticiones `/api/*` al backend Express en `http://localhost:3001`.

## Cómo Ejecutar

### Desarrollo (Frontend + Backend)

```bash
npm run dev:all
```

Esto ejecuta ambos servidores simultáneamente:
- Backend: http://localhost:3001
- Frontend: http://localhost:8080

### Solo Backend

```bash
npm run dev:server
```

### Solo Frontend

```bash
npm run dev
```

## Notas Importantes

1. **Simulación de IA**: El módulo de IA NO hace llamadas reales a OpenAI u otros servicios. Genera contenido inteligente basado en reglas y los datos de entrada.

2. **Archivos PPT**: Actualmente solo se guardan metadatos del archivo. En producción, implementarías almacenamiento real (S3, sistema de archivos, etc.).

3. **Exportación**: La funcionalidad de exportar a PDF/DOCX está simulada. En producción, usarías librerías como `puppeteer` o `docx`.

4. **Base de Datos**: Actualmente usa un archivo JSON. Para producción, migrar a una base de datos real (PostgreSQL, MongoDB, etc.).

5. **Autenticación**: No hay autenticación implementada. Cada sesión es independiente y accesible por ID.

## Próximos Pasos para Producción

1. Implementar autenticación y autorización (JWT, OAuth, etc.)
2. Reemplazar almacenamiento JSON por base de datos real
3. Integrar con servicio de IA real (OpenAI, Anthropic, etc.)
4. Implementar almacenamiento real de archivos (S3, Cloud Storage, etc.)
5. Generar PDF/DOCX reales para exportación
6. Agregar validación más robusta (Zod schemas)
7. Implementar logging y monitoreo
8. Agregar tests unitarios e integración

