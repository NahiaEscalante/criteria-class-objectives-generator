# 🚀 APIs Necesarias para FastAPI - Especificación Completa

## 📋 Resumen

Este documento especifica **exactamente** qué APIs, modelos y servicios necesitas crear en FastAPI para que el frontend funcione correctamente.

---

## 🔌 ENDPOINTS REQUERIDOS

### 1. **POST** `/api/ai/generate`
**Descripción:** Genera objetivos de aprendizaje, criterios de evaluación y recursos sugeridos usando IA.

**Request Body:**
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
    "evidencia": "Producción escrita individual de una página",
    "contexto": "Estudiantes de 4to de primaria de escuela pública...",
    "objetivo": "Objetivo opcional de la sesión"
  },
  "fileId": "file-123456" // Opcional
}
```

**Response (200 OK):**
```json
{
  "objectives": [
    {
      "id": "obj-1234567890-1",
      "text": "Identificar y aplicar recursos apropiados...",
      "order": 1
    },
    {
      "id": "obj-1234567890-2",
      "text": "Aplicar estructura textual apropiada...",
      "order": 2
    }
  ],
  "criteria": [
    {
      "id": "crit-1234567890-1",
      "text": "El texto incluye recursos variados...",
      "order": 1
    },
    {
      "id": "crit-1234567890-2",
      "text": "La producción sigue una estructura clara...",
      "order": 2
    }
  ],
  "resources": [
    {
      "id": "res-1234567890-video-1",
      "type": "video",
      "title": "Cómo escribir textos descriptivos",
      "description": "Video educativo que explica...",
      "url": "#"
    },
    {
      "id": "res-1234567890-audio-1",
      "type": "audio",
      "title": "Podcast: Estrategias para textos descriptivos",
      "description": "Audio con ejemplos prácticos...",
      "url": "#"
    },
    {
      "id": "res-1234567890-image-1",
      "type": "image",
      "title": "Infografía: Estructura de texto descriptivo",
      "description": "Material visual con la estructura...",
      "url": "#"
    }
  ],
  "generatedAt": "2025-01-20T10:30:00Z"
}
```

**Notas:**
- `generatedAt` debe ser string ISO 8601
- Los `id` pueden ser cualquier string único
- `order` debe ser numérico secuencial (1, 2, 3...)
- `type` en resources debe ser: `"video"`, `"audio"`, o `"image"`

---

### 2. **POST** `/api/ai/generate-material`
**Descripción:** Genera material educativo (rúbrica, ejercicios, guía, ejemplos) basado en criterios.

**Request Body:**
```json
{
  "criteria": [
    {
      "id": "crit-1",
      "text": "El texto incluye recursos variados...",
      "order": 1
    },
    {
      "id": "crit-2",
      "text": "La producción sigue una estructura clara...",
      "order": 2
    }
  ],
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
    "contexto": "Estudiantes de 4to de primaria...",
    "objetivo": "Objetivo opcional"
  },
  "materialType": "rubrica"
}
```

**`materialType` puede ser:**
- `"rubrica"` - Rúbrica de evaluación
- `"ejercicios"` - Ejercicios prácticos
- `"guia"` - Guía de retroalimentación
- `"ejemplos"` - Ejemplos de trabajos

**Response (200 OK):**
```json
{
  "material": "# Rúbrica de Evaluación\n\n## Texto descriptivo\n\n**Área:** comunicacion\n**Grado:** 4to de Primaria\n\n### Criterios de Evaluación\n\n1. El texto incluye recursos variados...\n2. La producción sigue una estructura clara...\n\n### Niveles de Desempeño\n\n| Criterio | Inicio | En proceso | Logrado | Destacado |\n|----------|--------|------------|---------|-----------|\n| 1. El texto incluye... | 1 punto | 2 puntos | 3 puntos | 4 puntos |\n",
  "materialType": "rubrica",
  "generatedAt": "2025-01-20T10:30:00Z"
}
```

**Notas:**
- `material` es un string en formato Markdown
- `generatedAt` debe ser string ISO 8601

---

### 3. **GET** `/api/ai/status`
**Descripción:** Verifica si OpenAI está disponible y configurado.

**Request:** Sin body

**Response (200 OK):**
```json
{
  "openaiAvailable": true,
  "message": "OpenAI está configurado y disponible"
}
```

**O si no está disponible:**
```json
{
  "openaiAvailable": false,
  "message": "OpenAI no está configurado. Se usará modo simulación."
}
```

---

### 4. **POST** `/api/files/upload`
**Descripción:** Sube un archivo PPT (PowerPoint).

**Request:** 
- **Content-Type:** `multipart/form-data`
- **Body:** FormData con campo `file` que contiene el archivo

**Ejemplo en JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', file); // file es un objeto File
```

**Response (201 Created):**
```json
{
  "success": true,
  "file": {
    "id": "file-1234567890",
    "name": "presentacion.pptx",
    "size": 1234567,
    "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "uploadedAt": "2025-01-20T10:30:00Z"
  },
  "message": "Archivo subido correctamente"
}
```

**Notas:**
- Debe aceptar archivos `.ppt` y `.pptx`
- `uploadedAt` debe ser string ISO 8601
- `id` debe ser único
- `size` en bytes

---

### 5. **GET** `/api/sessions`
**Descripción:** Obtiene la lista de todas las sesiones (resumen).

**Request:** Sin body

**Response (200 OK):**
```json
[
  {
    "id": "session-1234567890",
    "nombre": "Texto descriptivo",
    "area": "comunicacion",
    "grado": "4to de Primaria",
    "fecha": "20 de enero de 2025"
  },
  {
    "id": "session-0987654321",
    "nombre": "Afiche informativo",
    "area": "comunicacion",
    "grado": "5to de Primaria",
    "fecha": "19 de enero de 2025"
  }
]
```

**Notas:**
- Debe estar ordenado por fecha (más recientes primero)
- `fecha` debe estar en formato legible en español (ej: "20 de enero de 2025")
- Solo devuelve resumen, no la sesión completa

---

### 6. **POST** `/api/sessions`
**Descripción:** Guarda una nueva sesión o actualiza una existente.

**Request Body:**
```json
{
  "id": "session-1234567890",
  "nombre": "Texto descriptivo",
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
    "contexto": "Estudiantes de 4to de primaria...",
    "objetivo": "Objetivo opcional"
  },
  "file": {
    "id": "file-1234567890",
    "name": "presentacion.pptx",
    "size": 1234567,
    "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "uploadedAt": "2025-01-20T10:30:00Z"
  },
  "generation": {
    "objectives": [
      {
        "id": "obj-1",
        "text": "Identificar y aplicar recursos...",
        "order": 1
      }
    ],
    "criteria": [
      {
        "id": "crit-1",
        "text": "El texto incluye recursos...",
        "order": 1
      }
    ],
    "resources": [
      {
        "id": "res-1",
        "type": "video",
        "title": "Cómo escribir textos...",
        "description": "Video educativo...",
        "url": "#"
      }
    ],
    "generatedAt": "2025-01-20T10:30:00Z"
  },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

**Notas:**
- `file` es opcional (puede ser `null` o no estar presente)
- Si la sesión con ese `id` ya existe, debe actualizarse
- Si no existe, debe crearse
- `createdAt` solo se establece en creación, `updatedAt` siempre se actualiza

**Response (201 Created o 200 OK):**
```json
{
  "id": "session-1234567890",
  "nombre": "Texto descriptivo",
  "curriculum": { /* ... */ },
  "classInfo": { /* ... */ },
  "file": { /* ... */ },
  "generation": { /* ... */ },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

---

### 7. **GET** `/api/sessions/{id}`
**Descripción:** Obtiene una sesión completa por ID.

**Path Parameters:**
- `id`: string - ID de la sesión

**Request:** Sin body

**Response (200 OK):**
```json
{
  "id": "session-1234567890",
  "nombre": "Texto descriptivo",
  "curriculum": { /* ... */ },
  "classInfo": { /* ... */ },
  "file": { /* ... */ },
  "generation": { /* ... */ },
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Sesión no encontrada",
  "message": "No se encontró una sesión con ID: session-1234567890"
}
```

---

### 8. **DELETE** `/api/sessions/{id}`
**Descripción:** Elimina una sesión.

**Path Parameters:**
- `id`: string - ID de la sesión

**Request:** Sin body

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión eliminada correctamente"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Sesión no encontrada",
  "message": "No se encontró una sesión con ID: session-1234567890"
}
```

---

### 9. **POST** `/api/sessions/{id}/export`
**Descripción:** Exporta una sesión a PDF o DOCX.

**Path Parameters:**
- `id`: string - ID de la sesión

**Request Body:**
```json
{
  "format": "pdf"
}
```

**`format` puede ser:**
- `"pdf"` - Exportar a PDF
- `"docx"` - Exportar a DOCX

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Exportación PDF iniciada",
  "sessionId": "session-1234567890",
  "format": "pdf",
  "downloadUrl": "/api/exports/session-1234567890.pdf"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Sesión no encontrada",
  "message": "No se encontró una sesión con ID: session-1234567890"
}
```

**Notas:**
- `downloadUrl` debe ser una URL accesible para descargar el archivo
- Puede ser una URL temporal o permanente según tu implementación

---

### 10. **GET** `/health` (Opcional pero recomendado)
**Descripción:** Health check del backend.

**Request:** Sin body

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "CriterIA API está funcionando"
}
```

---

## 📦 MODELOS PYDANTIC A CREAR

### 1. CurriculumSelection
```python
from pydantic import BaseModel

class CurriculumSelection(BaseModel):
    area: str
    competencia: str
    capacidad: str
    desempeno: str
    grado: str
```

### 2. ClassInformation
```python
class ClassInformation(BaseModel):
    producto: str
    evidencia: str
    contexto: str
    objetivo: str | None = None
```

### 3. UploadedFile
```python
from datetime import datetime

class UploadedFile(BaseModel):
    id: str
    name: str
    size: int
    type: str
    uploadedAt: datetime
```

### 4. LearningObjective
```python
class LearningObjective(BaseModel):
    id: str
    text: str
    order: int
```

### 5. EvaluationCriterion
```python
class EvaluationCriterion(BaseModel):
    id: str
    text: str
    order: int
```

### 6. Resource
```python
from typing import Literal

ResourceType = Literal["video", "audio", "image"]

class Resource(BaseModel):
    id: str
    type: ResourceType
    title: str
    description: str
    url: str | None = None
```

### 7. AiGenerationRequest
```python
class AiGenerationRequest(BaseModel):
    curriculum: CurriculumSelection
    classInfo: ClassInformation
    fileId: str | None = None
```

### 8. AiGenerationResponse
```python
from datetime import datetime

class AiGenerationResponse(BaseModel):
    objectives: list[LearningObjective]
    criteria: list[EvaluationCriterion]
    resources: list[Resource]
    generatedAt: datetime
```

### 9. MaterialType
```python
from typing import Literal

MaterialType = Literal["rubrica", "ejercicios", "guia", "ejemplos"]
```

### 10. MaterialGenerationRequest
```python
class MaterialGenerationRequest(BaseModel):
    criteria: list[EvaluationCriterion]
    curriculum: CurriculumSelection
    classInfo: ClassInformation
    materialType: MaterialType
```

### 11. MaterialGenerationResponse
```python
class MaterialGenerationResponse(BaseModel):
    material: str  # Markdown content
    materialType: MaterialType
    generatedAt: datetime
```

### 12. Session
```python
class Session(BaseModel):
    id: str
    nombre: str
    curriculum: CurriculumSelection
    classInfo: ClassInformation
    file: UploadedFile | None = None
    generation: AiGenerationResponse
    createdAt: datetime
    updatedAt: datetime
```

### 13. SessionListItem
```python
class SessionListItem(BaseModel):
    id: str
    nombre: str
    area: str
    grado: str
    fecha: str  # Formato legible en español
```

### 14. ExportRequest
```python
from typing import Literal

class ExportRequest(BaseModel):
    format: Literal["pdf", "docx"]
```

### 15. AIStatusResponse
```python
class AIStatusResponse(BaseModel):
    openaiAvailable: bool
    message: str
```

---

## 🗄️ BASE DE DATOS

### Tablas/Modelos Necesarios

#### 1. **Sessions** (Tabla principal)
```sql
CREATE TABLE sessions (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    curriculum_area VARCHAR NOT NULL,
    curriculum_competencia VARCHAR NOT NULL,
    curriculum_capacidad VARCHAR NOT NULL,
    curriculum_desempeno VARCHAR NOT NULL,
    curriculum_grado VARCHAR NOT NULL,
    class_info_producto VARCHAR NOT NULL,
    class_info_evidencia TEXT NOT NULL,
    class_info_contexto TEXT NOT NULL,
    class_info_objetivo TEXT,
    file_id VARCHAR,
    file_name VARCHAR,
    file_size INTEGER,
    file_type VARCHAR,
    file_uploaded_at TIMESTAMP,
    generation_objectives JSONB NOT NULL,
    generation_criteria JSONB NOT NULL,
    generation_resources JSONB NOT NULL,
    generation_generated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

**O si usas ORM (SQLAlchemy):**
```python
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True)
    nombre = Column(String, nullable=False)
    # ... otros campos
    generation_objectives = Column(JSON, nullable=False)
    generation_criteria = Column(JSON, nullable=False)
    generation_resources = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

#### 2. **Files** (Opcional - si quieres almacenar metadatos de archivos)
```sql
CREATE TABLE files (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    size INTEGER NOT NULL,
    type VARCHAR NOT NULL,
    file_path VARCHAR,  -- Ruta donde se guarda el archivo
    uploaded_at TIMESTAMP NOT NULL
);
```

---

## 🔧 SERVICIOS A CREAR

### 1. **Servicio de IA (AI Service)**
**Responsabilidades:**
- Generar objetivos, criterios y recursos usando OpenAI
- Generar material educativo (rúbricas, ejercicios, etc.)
- Verificar estado de OpenAI

**Dependencias:**
- OpenAI SDK para Python
- Prompts bien diseñados para cada tipo de generación

### 2. **Servicio de Sesiones (Session Service)**
**Responsabilidades:**
- CRUD de sesiones
- Formatear fechas en español para `SessionListItem`
- Validar datos de sesiones

### 3. **Servicio de Archivos (File Service)**
**Responsabilidades:**
- Guardar archivos PPT subidos
- Validar tipo y tamaño de archivos
- Generar IDs únicos para archivos
- (Opcional) Procesar contenido de PPTs

### 4. **Servicio de Exportación (Export Service)**
**Responsabilidades:**
- Generar PDFs desde sesiones
- Generar DOCX desde sesiones
- Crear URLs de descarga temporales o permanentes

**Dependencias sugeridas:**
- `reportlab` o `weasyprint` para PDF
- `python-docx` para DOCX

---

## ⚙️ CONFIGURACIÓN NECESARIA

### 1. CORS
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Desarrollo
        "https://tu-frontend.com"  # Producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Variables de Entorno
```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Base de datos
DATABASE_URL=postgresql://user:password@localhost/criteria

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# Servidor
PORT=8000
ENVIRONMENT=development
```

### 3. Manejo de Archivos
```python
from fastapi import UploadFile, File
import aiofiles

@app.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validar tipo de archivo
    if not file.filename.endswith(('.ppt', '.pptx')):
        raise HTTPException(400, "Solo se permiten archivos PPT/PPTX")
    
    # Guardar archivo
    file_path = f"./uploads/{file_id}.pptx"
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Retornar metadatos
    return {"file": {...}}
```

---

## 📝 VALIDACIONES IMPORTANTES

### 1. Validación de Archivos
- Solo aceptar `.ppt` y `.pptx`
- Tamaño máximo: 10MB (recomendado)
- Validar que el archivo no esté corrupto

### 2. Validación de Datos
- Todos los campos requeridos deben estar presentes
- `materialType` debe ser uno de los valores permitidos
- `format` en export debe ser `"pdf"` o `"docx"`
- Fechas deben ser válidas

### 3. Manejo de Errores
- Devolver errores en formato JSON consistente:
```json
{
  "error": "Tipo de error",
  "message": "Descripción detallada del error"
}
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Estructura Básica
1. Crear proyecto FastAPI
2. Configurar CORS
3. Crear modelos Pydantic
4. Configurar base de datos (SQLite para empezar, PostgreSQL para producción)

### Fase 2: Endpoints Básicos
1. `GET /health`
2. `GET /api/ai/status`
3. `GET /api/sessions` (lista)
4. `GET /api/sessions/{id}`

### Fase 3: CRUD de Sesiones
1. `POST /api/sessions` (crear/actualizar)
2. `DELETE /api/sessions/{id}`

### Fase 4: Generación con IA
1. `POST /api/ai/generate` (con simulación primero)
2. `POST /api/ai/generate-material` (con simulación primero)
3. Integrar OpenAI real

### Fase 5: Archivos y Exportación
1. `POST /api/files/upload`
2. `POST /api/sessions/{id}/export`

---

## ✅ CHECKLIST FINAL

Antes de considerar el backend completo, verificar:

- [ ] Todos los 10 endpoints implementados
- [ ] CORS configurado correctamente
- [ ] Validación de datos con Pydantic
- [ ] Manejo de errores consistente
- [ ] Base de datos funcionando
- [ ] OpenAI integrado (o simulación funcionando)
- [ ] Archivos se guardan correctamente
- [ ] Exportación a PDF/DOCX funciona
- [ ] Fechas en formato ISO 8601
- [ ] Fechas en español para `SessionListItem`
- [ ] Tests básicos de endpoints

---

## 📚 RECURSOS ADICIONALES

### Librerías Python Recomendadas
```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
alembic==1.12.1
openai==1.3.0
python-multipart==0.0.6  # Para upload de archivos
aiofiles==23.2.1  # Para manejo asíncrono de archivos
python-docx==1.1.0  # Para generar DOCX
reportlab==4.0.7  # Para generar PDF
```

### Estructura de Proyecto Sugerida
```
criteria-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── pydantic_models.py
│   │   └── database_models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── ai.py
│   │   ├── sessions.py
│   │   └── files.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py
│   │   ├── session_service.py
│   │   └── file_service.py
│   └── config.py
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

---

*Documento creado para especificar exactamente qué necesita el backend FastAPI*

