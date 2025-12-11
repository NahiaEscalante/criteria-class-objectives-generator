# 🤖 Arquitectura de Servicios de IA - CriterIA

## ❌ ¿Por qué NO en el Frontend?

### 1. **Seguridad - API Keys Expuestas** 🔐

Si pones la API key de OpenAI en el frontend:
- ❌ Cualquiera puede verla en el código fuente del navegador
- ❌ Puede ser robada y usada por terceros
- ❌ OpenAI puede revocar tu key si detecta uso no autorizado
- ❌ No puedes controlar quién usa tu key ni cuánto

```javascript
// ❌ MAL - NUNCA HACER ESTO
const OPENAI_API_KEY = "sk-..." // Visible en el navegador!
```

### 2. **Control de Costos** 💰

- ❌ No puedes limitar cuántas requests hace cada usuario
- ❌ No puedes monitorear el uso
- ❌ No puedes implementar rate limiting
- ❌ Los costos pueden dispararse sin control

### 3. **Privacidad de Datos** 🔒

- ❌ Los datos sensibles (contenido de PPTs, información de estudiantes) se envían directamente a servicios externos
- ❌ No puedes validar ni sanitizar los datos antes de enviarlos
- ❌ No puedes auditar qué se envía a OpenAI

### 4. **CORS y Configuración** ⚙️

- ❌ OpenAI puede no permitir requests directos desde el navegador
- ❌ Problemas de CORS
- ❌ Configuración más compleja

---

## ✅ Solución Correcta: Backend como Intermediario

### Arquitectura Recomendada

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │   OpenAI   │
│  (React)    │         │  (FastAPI)  │         │    API     │
└─────────────┘         └─────────────┘         └─────────────┘
     │                        │                        │
     │                        │                        │
     │ 1. Request              │ 2. Validar             │
     │    (sin API key)        │    datos              │
     │                        │                        │
     │                        │ 3. Llamar OpenAI       │
     │                        │    (con API key)       │
     │                        │                        │
     │ 4. Response             │                        │
     │    (resultados)         │                        │
```

### Flujo de Datos

1. **Frontend** → Envía request al backend (sin API key)
2. **Backend** → Valida datos, autentica usuario
3. **Backend** → Llama a OpenAI con API key (oculta)
4. **Backend** → Procesa respuesta, guarda en BD si es necesario
5. **Backend** → Devuelve resultados al frontend

---

## 🏗️ Implementación en Backend

### Estructura Recomendada

```
backend/
├── services/
│   ├── openai_service.py      # Servicio de OpenAI
│   └── ai_generation.py       # Lógica de generación
├── routes/
│   └── ai.py                  # Endpoints de IA
└── models/
    └── ai_models.py           # Modelos de datos
```

### Ejemplo: Servicio de OpenAI

```python
# services/openai_service.py
import os
from openai import OpenAI
from typing import Dict, List

class OpenAIService:
    def __init__(self):
        # API key desde variable de entorno (NUNCA hardcodeada)
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
    
    async def generate_objectives_and_criteria(
        self,
        curriculum: Dict,
        class_info: Dict,
        file_content: str = None
    ) -> Dict:
        """
        Genera objetivos y criterios usando OpenAI
        """
        # Construir prompt
        prompt = self._build_prompt(curriculum, class_info, file_content)
        
        # Llamar a OpenAI
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Eres un experto en educación..."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Procesar respuesta
        return self._parse_response(response)
    
    def _build_prompt(self, curriculum, class_info, file_content):
        # Construir prompt detallado
        pass
    
    def _parse_response(self, response):
        # Parsear respuesta de OpenAI a formato esperado
        pass
```

### Ejemplo: Endpoint en FastAPI

```python
# routes/ai.py
from fastapi import APIRouter, Depends, HTTPException
from services.openai_service import OpenAIService
from models.ai_models import AiGenerationRequest, AiGenerationResponse
from auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.post("/generate", response_model=AiGenerationResponse)
async def generate_ai(
    request: AiGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Genera objetivos y criterios con IA
    """
    try:
        # Validar request
        if not request.curriculum.area:
            raise HTTPException(400, "El área es requerida")
        
        # Obtener contenido del archivo si existe
        file_content = None
        if request.fileId:
            file_content = await get_file_content(request.fileId, current_user.id)
        
        # Llamar al servicio de OpenAI
        openai_service = OpenAIService()
        result = await openai_service.generate_objectives_and_criteria(
            curriculum=request.curriculum.dict(),
            class_info=request.classInfo.dict(),
            file_content=file_content
        )
        
        # Opcional: Guardar en historial
        await save_generation_history(current_user.id, request, result)
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error al generar: {str(e)}")
```

---

## 🔐 Seguridad en el Backend

### 1. Variables de Entorno

```bash
# .env (NUNCA commitear esto)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
```

### 2. Validación de Inputs

```python
# Validar antes de enviar a OpenAI
def validate_generation_request(request):
    if len(request.classInfo.contexto) < 20:
        raise ValueError("El contexto debe tener al menos 20 caracteres")
    # ... más validaciones
```

### 3. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/generate")
@limiter.limit("10/minute")  # Máximo 10 requests por minuto
async def generate_ai(...):
    pass
```

### 4. Monitoreo de Costos

```python
# Registrar cada llamada a OpenAI
async def log_openai_usage(user_id, tokens_used, cost):
    await db.execute(
        "INSERT INTO openai_usage (user_id, tokens, cost, created_at) VALUES (?, ?, ?, ?)",
        (user_id, tokens_used, cost, datetime.now())
    )
```

---

## 💡 Ventajas de Backend

### 1. **Seguridad** 🔒
- ✅ API keys nunca expuestas
- ✅ Validación de datos antes de enviar
- ✅ Control de acceso por usuario

### 2. **Control** 🎛️
- ✅ Rate limiting por usuario
- ✅ Monitoreo de uso
- ✅ Límites de costos

### 3. **Optimización** ⚡
- ✅ Caché de respuestas similares
- ✅ Procesamiento en batch
- ✅ Reutilización de prompts

### 4. **Auditoría** 📊
- ✅ Logs de todas las llamadas
- ✅ Tracking de costos
- ✅ Análisis de uso

### 5. **Flexibilidad** 🔄
- ✅ Fácil cambiar de proveedor (OpenAI → Anthropic, etc.)
- ✅ Implementar fallbacks
- ✅ A/B testing de modelos

---

## 📋 Checklist de Implementación

### Backend
- [ ] Crear servicio de OpenAI
- [ ] Configurar variables de entorno
- [ ] Implementar endpoints `/api/ai/generate` y `/api/ai/generate-material`
- [ ] Agregar validación de inputs
- [ ] Implementar rate limiting
- [ ] Agregar logging de uso
- [ ] Manejo de errores robusto
- [ ] Tests unitarios

### Frontend
- [ ] Llamar a endpoints del backend (NO a OpenAI directamente)
- [ ] Manejar errores del backend
- [ ] Mostrar estados de carga
- [ ] Validar datos antes de enviar

---

## 🚨 Errores Comunes a Evitar

### ❌ Error 1: API Key en el Frontend
```javascript
// NUNCA hacer esto
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}` // ❌ Expuesto!
  }
});
```

### ❌ Error 2: Sin Validación
```python
# MAL - Enviar directamente sin validar
response = openai.chat.completions.create(
    messages=[{"role": "user", "content": user_input}]  # ❌ Sin validar!
)
```

### ❌ Error 3: Sin Rate Limiting
```python
# MAL - Sin límites
@router.post("/generate")
async def generate():  # ❌ Sin rate limiting!
    pass
```

---

## ✅ Implementación Correcta

### Backend (FastAPI)

```python
# 1. Servicio con API key segura
class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # ✅ Desde .env
    
    async def generate(self, prompt: str):
        # Validar prompt
        if len(prompt) < 10:
            raise ValueError("Prompt muy corto")
        
        # Llamar a OpenAI
        response = self.client.chat.completions.create(...)
        return response

# 2. Endpoint con autenticación y rate limiting
@router.post("/generate")
@limiter.limit("10/minute")  # ✅ Rate limiting
async def generate_ai(
    request: AiGenerationRequest,
    current_user: User = Depends(get_current_user)  # ✅ Autenticación
):
    service = OpenAIService()
    result = await service.generate(...)
    await log_usage(current_user.id, result.tokens)  # ✅ Logging
    return result
```

### Frontend (React)

```typescript
// ✅ Correcto - Llamar al backend
async function generateAI(request: AiGenerationRequest) {
  const response = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // ✅ Token de usuario, NO API key
    },
    body: JSON.stringify(request)
  });
  
  return response.json();
}
```

---

## 🎬 Generación de Recursos Multimedia (Videos, Audios, Imágenes)

### 📋 Visión General

Además de generar objetivos y criterios, el sistema puede generar recursos multimedia reales:
- **Videos educativos** con avatares hablando
- **Audios/Podcasts** con Text-to-Speech de alta calidad
- **Infografías e imágenes** educativas generadas con IA

**Importante:** Estos recursos se generan en el **backend**, nunca en el frontend.

### 🎯 Estrategia Recomendada: Vertex AI + D-ID

**Vertex AI (Google Cloud)** - Servicio Principal ⭐
- ✅ **Text-to-Speech**: Generación de audios educativos
- ✅ **Imagen API**: Generación de infografías e imágenes
- ✅ **Text Generation (Gemini/PaLM)**: Objetivos, criterios y scripts
- ✅ **Todo en un solo lugar**: Integración perfecta entre servicios
- ✅ **Precios competitivos**: Más económico que múltiples proveedores
- ✅ **Google Cloud Storage**: Almacenamiento integrado
- ✅ **Escalabilidad**: Infraestructura de Google Cloud

**D-ID API** - Solo para Videos con Avatares
- ✅ Especializado en videos educativos con presentadores
- ✅ Avatares realistas hablando desde texto
- ✅ Usar solo cuando se necesiten videos con avatares

**Ventajas de esta estrategia:**
1. **Un solo proveedor principal** (Google Cloud) simplifica la configuración
2. **Costos reducidos** comparado con múltiples proveedores
3. **Integración nativa** entre servicios de Google Cloud
4. **Mejor soporte** y documentación unificada
5. **Escalabilidad** garantizada por la infraestructura de Google

---

## 🛠️ Tecnologías Necesarias

### 🎯 Estrategia Recomendada: Vertex AI + D-ID

**Vertex AI (Google Cloud)** - Opción Principal
- ✅ **Todo en un solo lugar**: Text-to-Speech, Imagen API, Text Generation
- ✅ **Precios competitivos**: Más económico que múltiples proveedores
- ✅ **Integración perfecta**: Con Google Cloud Storage y servicios
- ✅ **Escalabilidad**: Infraestructura de Google Cloud
- ✅ **Soporte empresarial**: Alta disponibilidad y confiabilidad
- 📚 Docs: https://cloud.google.com/vertex-ai

**D-ID API** - Solo para Videos con Avatares
- ✅ Avatares realistas hablando desde texto
- ✅ Especializado en videos educativos con presentadores
- ✅ Costo: ~$0.10 - $0.50 por minuto
- ✅ Tiempo: 2-5 minutos por video
- 📚 Docs: https://docs.d-id.com/

---

### 1. Generación de Videos

#### Opciones Disponibles:

**D-ID API** (Recomendado para Videos con Avatares)
- ✅ Avatares realistas hablando desde texto
- ✅ Fácil de integrar
- ✅ Costo: ~$0.10 - $0.50 por minuto
- ✅ Tiempo: 2-5 minutos por video
- 📚 Docs: https://docs.d-id.com/
- ⚠️ **Nota**: Usar solo para videos con avatares. Para otros tipos de videos, considerar Vertex AI Video Generation.

**Vertex AI Video Generation** (Alternativa)
- ✅ Generación de video desde texto/imagen
- ✅ Integración con otros servicios Vertex AI
- ⚠️ Menos especializado para avatares hablando
- 📚 Docs: https://cloud.google.com/vertex-ai/docs

**Synthesia** (Alternativa Premium)
- ✅ Avatares profesionales de alta calidad
- ✅ Múltiples idiomas y voces
- ❌ Más costoso: ~$1-5 por minuto
- ✅ Tiempo: 3-10 minutos por video

#### Ejemplo con D-ID (Videos con Avatares):

```python
# services/video_generation_service.py
import os
from did_client import DIDClient

class VideoGenerationService:
    def __init__(self):
        self.client = DIDClient(api_key=os.getenv("DID_API_KEY"))
    
    async def generate_video(
        self,
        title: str,
        description: str,
        script: str,
        avatar_id: str = "premium-avatar-1"
    ) -> Dict:
        """
        Genera un video educativo usando D-ID
        """
        # 1. Crear presentación (talk)
        talk = await self.client.talks.create(
            source_url=avatar_id,  # Avatar a usar
            script={
                "type": "text",
                "input": script,
                "provider": {
                    "type": "microsoft",
                    "voice_id": "es-PE-CamilaNeural"  # Voz en español peruano
                }
            }
        )
        
        # 2. Esperar a que se genere (puede tardar minutos)
        video_url = await self.wait_for_video(talk.id)
        
        # 3. Opcional: Subir a YouTube o storage propio
        storage_url = await self.upload_to_storage(video_url, title)
        
        return {
            "url": storage_url,
            "thumbnail": talk.thumbnail_url,
            "duration": talk.duration,
            "status": "ready"
        }
    
    async def wait_for_video(self, talk_id: str, max_wait: int = 300):
        """Espera hasta que el video esté listo"""
        import asyncio
        elapsed = 0
        
        while elapsed < max_wait:
            talk = await self.client.talks.get(talk_id)
            
            if talk.status == "done":
                return talk.result_url
            elif talk.status == "error":
                raise Exception(f"Error generando video: {talk.error}")
            
            await asyncio.sleep(5)  # Esperar 5 segundos
            elapsed += 5
        
        raise TimeoutError("Timeout esperando generación de video")
```

### 2. Generación de Audio

#### Opciones Disponibles:

**Vertex AI Text-to-Speech** (Recomendado) ⭐
- ✅ **Excelente calidad**: Voces naturales y expresivas
- ✅ **Múltiples voces**: Amplia selección de voces en español
- ✅ **Precio competitivo**: ~$0.016 por 1000 caracteres
- ✅ **Muy rápido**: Generación en segundos
- ✅ **Integración perfecta**: Con Google Cloud Storage
- ✅ **SSML avanzado**: Control de pronunciación, velocidad, tono
- 📚 Docs: https://cloud.google.com/text-to-speech/docs

**ElevenLabs** (Alternativa Premium)
- ✅ Calidad de voz muy natural
- ✅ Múltiples voces y idiomas
- ❌ Más costoso: ~$0.18 por 1000 caracteres
- ✅ Tiempo: Segundos (muy rápido)
- 📚 Docs: https://elevenlabs.io/docs

**OpenAI TTS** (Alternativa)
- ✅ Más económico: ~$0.015 por 1000 caracteres
- ✅ Buena calidad
- ✅ Tiempo: Segundos

#### Ejemplo con Vertex AI Text-to-Speech:

```python
# services/audio_generation_service.py
from google.cloud import texttospeech
import os
import uuid

class AudioGenerationService:
    def __init__(self):
        # Inicializar cliente de Vertex AI Text-to-Speech
        self.client = texttospeech.TextToSpeechClient()
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        # Configurar voz en español peruano
        self.voice_config = {
            "language_code": "es-PE",
            "name": "es-PE-Camila-Neural",  # Voz femenina peruana
            "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
        }
    
    async def generate_audio(
        self,
        title: str,
        description: str,
        script: str
    ) -> Dict:
        """
        Genera un audio educativo usando Vertex AI Text-to-Speech
        """
        # 1. Configurar síntesis de voz
        synthesis_input = texttospeech.SynthesisInput(text=script)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=self.voice_config["language_code"],
            name=self.voice_config["name"],
            ssml_gender=self.voice_config["ssml_gender"]
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,  # Velocidad normal
            pitch=0.0,  # Tono normal
            volume_gain_db=0.0  # Volumen normal
        )
        
        # 2. Generar audio
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # 3. Guardar temporalmente
        temp_path = f"/tmp/audio-{uuid.uuid4()}.mp3"
        with open(temp_path, "wb") as out:
            out.write(response.audio_content)
        
        # 4. Subir a Google Cloud Storage
        audio_url = await self.upload_to_gcs(temp_path, title)
        
        # 5. Obtener duración
        duration = self.get_audio_duration(temp_path)
        
        # 6. Limpiar archivo temporal
        os.remove(temp_path)
        
        return {
            "url": audio_url,
            "duration": duration,
            "status": "ready"
        }
    
    async def upload_to_gcs(self, file_path: str, title: str) -> str:
        """Sube el audio a Google Cloud Storage"""
        from google.cloud import storage
        
        storage_client = storage.Client(project=self.project_id)
        bucket_name = os.getenv("GCS_BUCKET_NAME", "criteria-audio-resources")
        bucket = storage_client.bucket(bucket_name)
        
        blob_name = f"audios/{uuid.uuid4()}-{title.lower().replace(' ', '-')}.mp3"
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(file_path)
        
        # Retornar URL pública
        return blob.public_url
```

### 3. Generación de Imágenes/Infografías

#### Opciones Disponibles:

**Vertex AI Imagen API** (Recomendado) ⭐
- ✅ **Excelente calidad**: Generación de imágenes de alta resolución
- ✅ **Fácil de usar**: API simple y bien documentada
- ✅ **Precio competitivo**: ~$0.02 por imagen
- ✅ **Muy rápido**: Generación en 10-30 segundos
- ✅ **Integración perfecta**: Con Google Cloud Storage
- ✅ **Control avanzado**: Parámetros de estilo, tamaño, etc.
- 📚 Docs: https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview

**DALL-E 3 (OpenAI)** (Alternativa)
- ✅ Excelente calidad
- ✅ Fácil de usar
- ❌ Más costoso: ~$0.04 - $0.12 por imagen
- ✅ Tiempo: 10-30 segundos
- 📚 Docs: https://platform.openai.com/docs/guides/images

**Midjourney API** (Alternativa Premium)
- ✅ Calidad artística superior
- ❌ Más costoso
- ❌ Menos control

**Stable Diffusion** (Alternativa Open Source)
- ✅ Open source
- ✅ Gratis (self-hosted)
- ❌ Requiere más configuración

#### Ejemplo con Vertex AI Imagen API:

```python
# services/image_generation_service.py
from google.cloud import aiplatform
from vertexai.preview import vision_models
import os
import uuid
import requests

class ImageGenerationService:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        # Inicializar Vertex AI
        aiplatform.init(project=self.project_id, location=self.location)
        
        # Inicializar modelo de generación de imágenes
        self.image_model = vision_models.ImageGenerationModel.from_pretrained("imagegeneration@006")
    
    async def generate_infographic(
        self,
        title: str,
        description: str
    ) -> Dict:
        """
        Genera una infografía educativa usando Vertex AI Imagen API
        """
        # 1. Construir prompt detallado
        prompt = f"""Create an educational infographic about: {title}
        
Description: {description}

Style: Clean, professional, educational infographic with:
- Clear typography
- Organized layout
- Educational color scheme
- Icons and visual elements
- Spanish text if needed
- Modern design
- High contrast for readability
"""
        
        # 2. Generar imagen con Vertex AI
        response = self.image_model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="1:1",  # Cuadrado para infografías
            safety_filter_level="block_some",  # Filtro de seguridad
            person_generation="allow_all"  # Permitir personas si es necesario
        )
        
        # 3. Obtener imagen generada
        generated_image = response.generated_images[0]
        image_bytes = generated_image._image_bytes
        
        # 4. Guardar temporalmente
        temp_path = f"/tmp/image-{uuid.uuid4()}.png"
        with open(temp_path, "wb") as f:
            f.write(image_bytes)
        
        # 5. Subir a Google Cloud Storage
        storage_url = await self.upload_to_gcs(temp_path, title)
        
        # 6. Limpiar archivo temporal
        os.remove(temp_path)
        
        return {
            "url": storage_url,
            "width": 1024,
            "height": 1024,
            "status": "ready"
        }
    
    async def upload_to_gcs(self, file_path: str, title: str) -> str:
        """Sube la imagen a Google Cloud Storage"""
        from google.cloud import storage
        
        storage_client = storage.Client(project=self.project_id)
        bucket_name = os.getenv("GCS_BUCKET_NAME", "criteria-image-resources")
        bucket = storage_client.bucket(bucket_name)
        
        blob_name = f"images/{uuid.uuid4()}-{title.lower().replace(' ', '-')}.png"
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(file_path)
        
        # Retornar URL pública
        return blob.public_url
```

---

## 🏗️ Arquitectura de Generación Multimedia

### Flujo Completo

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. POST /api/ai/generate
       │    (curriculum, classInfo)
       ↓
┌─────────────────────────────────┐
│         Backend FastAPI          │
│                                  │
│  2. Generar objetivos/criterios │
│     (OpenAI - rápido)            │
│                                  │
│  3. Iniciar generación multimedia│
│     (Background tasks)           │
│     ├─ Videos (D-ID)             │
│     ├─ Audios (Vertex AI TTS)     │
│     └─ Imágenes (Vertex AI)      │
│                                  │
│  4. Devolver respuesta inmediata │
│     con generationId             │
└──────┬──────────────────────────┘
       │
       │ 5. Response con:
       │    - Objetivos/criterios (listos)
       │    - Recursos (status: "generating")
       │    - generationId
       ↓
┌─────────────┐
│   Frontend  │
│             │
│ 6. Polling  │
│    GET /api/ai/generation-status/{id}
│    cada 5 segundos
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│    Backend (Background)          │
│                                  │
│ 7. Generar recursos              │
│    ├─ Video: 2-5 min             │
│    ├─ Audio: 10-30 seg           │
│    └─ Imagen: 10-30 seg          │
│                                  │
│ 8. Subir a storage               │
│    (S3, YouTube, etc.)           │
│                                  │
│ 9. Actualizar estado en BD       │
└─────────────────────────────────┘
```

---

## 🔧 Implementación en Backend

### Estructura de Servicios

```
backend/
├── services/
│   ├── vertex_ai_service.py      # Servicio principal Vertex AI
│   ├── openai_service.py          # Objetivos y criterios (o usar Vertex AI)
│   ├── video_generation_service.py # Generación de videos (D-ID)
│   ├── audio_generation_service.py # Generación de audios (Vertex AI TTS)
│   ├── image_generation_service.py # Generación de imágenes (Vertex AI)
│   └── multimedia_orchestrator.py  # Orquesta todo
├── tasks/
│   └── multimedia_tasks.py        # Tareas en background (Celery)
├── routes/
│   └── ai.py                      # Endpoints
└── models/
    └── ai_models.py               # Modelos de datos
```

### Servicio Principal de Vertex AI

```python
# services/vertex_ai_service.py
from google.cloud import aiplatform
from vertexai.preview.generative_models import GenerativeModel
import os

class VertexAIService:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        # Inicializar Vertex AI
        aiplatform.init(project=self.project_id, location=self.location)
        
        # Inicializar modelo de generación de texto (Gemini o PaLM)
        self.model_name = os.getenv("VERTEX_AI_MODEL", "gemini-pro")
        self.text_model = GenerativeModel(self.model_name)
    
    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = None,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        """
        Genera texto usando Vertex AI (Gemini o PaLM)
        """
        messages = []
        
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        
        messages.append({"role": "user", "content": prompt})
        
        response = await self.text_model.generate_content_async(
            contents=messages,
            generation_config={
                "max_output_tokens": max_tokens,
                "temperature": temperature
            }
        )
        
        return response.text
    
    async def generate_objectives_and_criteria(
        self,
        curriculum: Dict,
        class_info: Dict,
        file_content: str = None
    ) -> Dict:
        """
        Genera objetivos y criterios usando Vertex AI
        """
        # Construir prompt detallado
        prompt = self._build_prompt(curriculum, class_info, file_content)
        
        # Generar con Vertex AI
        response_text = await self.generate_text(
            prompt=prompt,
            system_instruction="Eres un experto en educación. Genera objetivos de aprendizaje y criterios de evaluación claros y pedagógicos.",
            max_tokens=2000,
            temperature=0.7
        )
        
        # Parsear respuesta
        return self._parse_response(response_text)
    
    def _build_prompt(self, curriculum, class_info, file_content):
        # Construir prompt detallado
        prompt = f"""Genera objetivos de aprendizaje y criterios de evaluación para:
        
Área: {curriculum.get('area', 'N/A')}
Grado: {curriculum.get('grado', 'N/A')}
Competencia: {curriculum.get('competencia', 'N/A')}
Capacidad: {curriculum.get('capacidad', 'N/A')}

Contexto de la clase:
{class_info.get('contexto', 'N/A')}

Contenido del archivo adjunto:
{file_content if file_content else 'No hay archivo adjunto'}

Genera:
1. Objetivos de aprendizaje claros y medibles
2. Criterios de evaluación específicos
3. Recursos sugeridos (videos, audios, imágenes)
"""
        return prompt
    
    def _parse_response(self, response_text):
        # Parsear respuesta de Vertex AI a formato esperado
        # Implementar lógica de parsing según formato de respuesta
        pass
```

### Servicio Orquestador

```python
# services/multimedia_orchestrator.py
from services.video_generation_service import VideoGenerationService
from services.audio_generation_service import AudioGenerationService
from services.image_generation_service import ImageGenerationService
from services.vertex_ai_service import VertexAIService
from tasks.multimedia_tasks import generate_multimedia_resources_task
import uuid

class MultimediaOrchestrator:
    def __init__(self):
        self.video_service = VideoGenerationService()  # D-ID para avatares
        self.audio_service = AudioGenerationService()  # Vertex AI TTS
        self.image_service = ImageGenerationService()  # Vertex AI Imagen
        self.vertex_ai_service = VertexAIService()  # Para scripts y texto
    
    async def generate_resources_async(
        self,
        resource_suggestions: List[Resource],
        generation_id: str
    ) -> None:
        """
        Inicia generación de recursos en background
        """
        # Iniciar tarea en background (Celery)
        generate_multimedia_resources_task.delay(
            generation_id=generation_id,
            resources=resource_suggestions
        )
    
    async def generate_resource_sync(
        self,
        resource: Resource
    ) -> Resource:
        """
        Genera un recurso de forma síncrona (para tests o generación rápida)
        """
        # Generar script con OpenAI
        script = await self._generate_script(resource)
        
        if resource.type == 'video':
            result = await self.video_service.generate_video(
                title=resource.title,
                description=resource.description,
                script=script
            )
            return {
                **resource,
                "url": result["url"],
                "thumbnail": result["thumbnail"],
                "duration": result["duration"],
                "status": "ready"
            }
        
        elif resource.type == 'audio':
            result = await self.audio_service.generate_audio(
                title=resource.title,
                description=resource.description,
                script=script
            )
            return {
                **resource,
                "url": result["url"],
                "duration": result["duration"],
                "status": "ready"
            }
        
        elif resource.type == 'image':
            result = await self.image_generation_service.generate_infographic(
                title=resource.title,
                description=resource.description
            )
            return {
                **resource,
                "url": result["url"],
                "status": "ready"
            }
    
    async def _generate_script(self, resource: Resource) -> str:
        """Genera script detallado para video/audio usando Vertex AI"""
        from services.vertex_ai_service import VertexAIService
        
        vertex_ai_service = VertexAIService()
        
        prompt = f"""Genera un script educativo para un {resource.type} sobre:
        
Título: {resource.title}
Descripción: {resource.description}

El script debe ser:
- Educativo y claro
- Apropiado para docentes
- Duración: {"2-3 minutos" if resource.type == "video" else "3-5 minutos"}
- En español peruano
- Con un tono profesional pero accesible
"""
        
        script = await vertex_ai_service.generate_text(
            prompt=prompt,
            system_instruction="Eres un experto en crear contenido educativo. Genera scripts claros y pedagógicos.",
            max_tokens=1000,
            temperature=0.7
        )
        
        return script
```

### Endpoint Actualizado

```python
# routes/ai.py
from celery import Celery
import uuid

celery_app = Celery('criteria')

@router.post("/generate", response_model=AiGenerationResponse)
async def generate_ai(
    request: AiGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Genera objetivos, criterios y recursos multimedia
    """
    # 1. Generar objetivos y criterios (rápido)
    # Opción 1: Usar Vertex AI (recomendado)
    from services.vertex_ai_service import VertexAIService
    vertex_ai_service = VertexAIService()
    ai_response = await vertex_ai_service.generate_objectives_and_criteria(
        curriculum=request.curriculum.dict(),
        class_info=request.classInfo.dict(),
        file_content=await get_file_content(request.fileId) if request.fileId else None
    )
    
    # Opción 2: Usar OpenAI (alternativa)
    # from services.openai_service import OpenAIService
    # openai_service = OpenAIService()
    # ai_response = await openai_service.generate_objectives_and_criteria(...)
    
    # 2. Crear generationId único
    generation_id = str(uuid.uuid4())
    
    # 3. Iniciar generación de recursos en background
    orchestrator = MultimediaOrchestrator()
    await orchestrator.generate_resources_async(
        resource_suggestions=ai_response.resources,
        generation_id=generation_id
    )
    
    # 4. Guardar estado inicial en BD
    await save_generation_status(
        generation_id=generation_id,
        user_id=current_user.id,
        resources=ai_response.resources,
        status="generating"
    )
    
    # 5. Devolver respuesta inmediata
    return {
        "objectives": ai_response.objectives,
        "criteria": ai_response.criteria,
        "resources": [
            {**r, "status": "generating", "progress": 0}
            for r in ai_response.resources
        ],
        "generatedAt": datetime.now(),
        "generationId": generation_id,
        "resourcesGenerating": True
    }
```

### Tarea en Background (Celery)

```python
# tasks/multimedia_tasks.py
from celery import Celery
from services.multimedia_orchestrator import MultimediaOrchestrator
import asyncio

celery_app = Celery('criteria')

@celery_app.task(name="generate_multimedia_resources")
def generate_multimedia_resources_task(generation_id: str, resources: List[Dict]):
    """
    Tarea en background para generar recursos multimedia
    """
    orchestrator = MultimediaOrchestrator()
    
    # Ejecutar en loop asíncrono
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def generate_all():
        for resource in resources:
            try:
                # Actualizar estado a "generating"
                await update_resource_status(
                    generation_id,
                    resource["id"],
                    status="generating",
                    progress=0
                )
                
                # Generar recurso
                result = await orchestrator.generate_resource_sync(resource)
                
                # Actualizar estado a "ready" con URL
                await update_resource_status(
                    generation_id,
                    resource["id"],
                    status="ready",
                    url=result["url"],
                    thumbnail=result.get("thumbnail"),
                    duration=result.get("duration"),
                    progress=100
                )
                
            except Exception as e:
                # Actualizar estado a "error"
                await update_resource_status(
                    generation_id,
                    resource["id"],
                    status="error",
                    error=str(e)
                )
    
    loop.run_until_complete(generate_all())
    loop.close()
```

### Endpoint de Estado

```python
@router.get("/generation-status/{generation_id}")
async def get_generation_status(
    generation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el estado actual de generación de recursos
    """
    status = await get_generation_status_from_db(generation_id, current_user.id)
    
    if not status:
        raise HTTPException(404, "Generación no encontrada")
    
    return {
        "resources": status.resources  # Lista de recursos con estados actualizados
    }
```

---

## 💾 Almacenamiento de Recursos

### Opciones de Storage

#### 1. **Google Cloud Storage** (Recomendado para producción) ⭐
```python
from google.cloud import storage
import os

async def upload_to_gcs(file_path: str, blob_name: str, bucket_name: str = None) -> str:
    """Sube archivo a Google Cloud Storage"""
    storage_client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT"))
    bucket_name = bucket_name or os.getenv("GCS_BUCKET_NAME", "criteria-resources")
    bucket = storage_client.bucket(bucket_name)
    
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(file_path)
    
    # Hacer público o usar signed URL
    blob.make_public()
    return blob.public_url
```

**Ventajas de GCS:**
- ✅ Integración perfecta con Vertex AI
- ✅ CDN integrado (Cloud CDN)
- ✅ Precios competitivos
- ✅ Fácil de usar desde servicios de Google Cloud

#### 2. **Cloud CDN** (Para distribución rápida)
- Configurar Cloud CDN delante de GCS
- URLs más rápidas globalmente
- Mejor experiencia de usuario
- Integración nativa con Google Cloud

#### 3. **Amazon S3** (Alternativa)
```python
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

async def upload_to_s3(file_path: str, key: str) -> str:
    s3_client.upload_file(
        file_path,
        os.getenv("AWS_S3_BUCKET"),
        key
    )
    return f"https://{os.getenv('AWS_S3_BUCKET')}.s3.amazonaws.com/{key}"
```

#### 4. **YouTube** (Solo para videos - opcional)
```python
from googleapiclient.discovery import build

youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

async def upload_to_youtube(video_path: str, title: str) -> str:
    # Subir video a YouTube
    # Retornar URL del video
    pass
```

#### 5. **Storage Local** (Solo desarrollo)
```python
UPLOAD_DIR = "./uploads"

async def upload_local(file_path: str, filename: str) -> str:
    destination = f"{UPLOAD_DIR}/{filename}"
    shutil.copy(file_path, destination)
    return f"/uploads/{filename}"
```

---

## ⏱️ Procesamiento Asíncrono

### ¿Por qué Asíncrono?

- **Videos**: Tardan 2-10 minutos en generarse
- **Audios**: Tardan 10-30 segundos
- **Imágenes**: Tardan 10-30 segundos

Si esperas a que todo termine, el usuario esperaría 5-15 minutos. **No es buena UX**.

### Solución: Generación en Background

1. **Responder inmediatamente** con objetivos/criterios
2. **Iniciar generación** de recursos en background
3. **Frontend hace polling** para verificar estado
4. **Actualizar UI** cuando cada recurso esté listo

### Implementación con Celery

```python
# Configuración de Celery
celery_app = Celery(
    'criteria',
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

# Tarea
@celery_app.task
def generate_multimedia_resources(generation_id, resources):
    # Generar recursos...
    pass
```

### Alternativa: Threading (más simple, menos escalable)

```python
import threading

def generate_in_background(generation_id, resources):
    # Generar recursos...
    pass

# En el endpoint
thread = threading.Thread(
    target=generate_in_background,
    args=(generation_id, resources)
)
thread.start()
```

---

## 💰 Costos Estimados

### Por Sesión (promedio):

| Recurso | Cantidad | Costo Unitario | Costo Total |
|---------|----------|----------------|-------------|
| Videos (D-ID) | 2 | $0.20 - $0.50/min | $0.80 - $2.00 |
| Audios (Vertex AI TTS) | 1 | $0.016/1000 chars | $0.05 - $0.15 |
| Imágenes (Vertex AI) | 2 | $0.02/imagen | $0.04 |
| **Total** | | | **$0.89 - $2.19** |

### Costos Mensuales (100 sesiones/mes):

- **Mínimo**: $89/mes
- **Promedio**: $154/mes
- **Máximo**: $219/mes

**Nota**: Los costos son significativamente menores usando Vertex AI en lugar de múltiples proveedores.

### Optimizaciones:

1. **Caché de recursos similares**: Reutilizar videos/audios existentes
2. **Generación bajo demanda**: Solo generar si el usuario lo solicita
3. **Límites por usuario**: Máximo X recursos por mes
4. **Calidad ajustable**: Usar modelos más económicos cuando sea posible

---

## 🔄 Flujo Completo de Generación

### Paso a Paso:

1. **Usuario completa formulario** y hace clic en "Generar"

2. **Frontend** → `POST /api/ai/generate`
   ```json
   {
     "curriculum": {...},
     "classInfo": {...},
     "fileId": "file-123"
   }
   ```

3. **Backend** genera objetivos/criterios (Vertex AI - 5-10 segundos)

4. **Backend** crea `generationId` y guarda estado inicial

5. **Backend** inicia tareas en background:
   - Tarea 1: Generar video 1 (D-ID - 2-5 min)
   - Tarea 2: Generar video 2 (D-ID - 2-5 min)
   - Tarea 3: Generar audio (Vertex AI TTS - 10-30 seg)
   - Tarea 4: Generar imagen 1 (Vertex AI Imagen - 10-30 seg)
   - Tarea 5: Generar imagen 2 (Vertex AI Imagen - 10-30 seg)

6. **Backend** responde inmediatamente:
   ```json
   {
     "objectives": [...],
     "criteria": [...],
     "resources": [
       {"id": "...", "status": "generating", "progress": 0},
       ...
     ],
     "generationId": "gen-123",
     "resourcesGenerating": true
   }
   ```

7. **Frontend** muestra objetivos/criterios inmediatamente

8. **Frontend** inicia polling: `GET /api/ai/generation-status/gen-123` cada 5 segundos

9. **Backend** (background) genera recursos y actualiza estado:
   - Audio listo → Actualiza BD → Próximo poll lo detecta
   - Imágenes listas → Actualiza BD → Próximo poll lo detecta
   - Videos listos → Actualiza BD → Próximo poll lo detecta

10. **Frontend** actualiza UI cuando detecta recursos listos:
    - Muestra reproductor de audio
    - Muestra imágenes
    - Muestra videos cuando estén listos

11. **Frontend** detiene polling cuando todos los recursos están `ready` o `error`

---

## 📊 Estados de Recursos

### Estados Posibles:

| Estado | Descripción | UI en Frontend |
|--------|-------------|----------------|
| `pending` | Pendiente de generación | Muestra solo título/descripción |
| `generating` | En proceso | Spinner + barra de progreso |
| `ready` | Generado y disponible | Muestra recurso (video/audio/imagen) |
| `error` | Error al generar | Muestra mensaje de error |

### Ejemplo de Recursos con Estados:

```json
{
  "resources": [
    {
      "id": "res-video-1",
      "type": "video",
      "title": "Cómo producir textos descriptivos",
      "description": "...",
      "status": "generating",
      "progress": 45,
      "url": null
    },
    {
      "id": "res-audio-1",
      "type": "audio",
      "title": "Podcast educativo",
      "description": "...",
      "status": "ready",
      "url": "https://storage.example.com/audio-123.mp3",
      "duration": 180
    },
    {
      "id": "res-image-1",
      "type": "image",
      "title": "Infografía",
      "description": "...",
      "status": "ready",
      "url": "https://storage.example.com/image-123.png"
    },
    {
      "id": "res-video-2",
      "type": "video",
      "title": "Tutorial avanzado",
      "description": "...",
      "status": "error",
      "error": "Timeout en la generación",
      "url": null
    }
  ]
}
```

---

## 🔐 Variables de Entorno Necesarias

```bash
# Google Cloud / Vertex AI (Principal) ⭐
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
# O usar Application Default Credentials (ADC) en producción

# Vertex AI - Text Generation (objetivos, criterios, scripts)
VERTEX_AI_MODEL=gemini-pro  # o text-bison@001
VERTEX_AI_LOCATION=us-central1

# Vertex AI - Text-to-Speech (audios)
VERTEX_AI_TTS_VOICE=es-PE-Camila-Neural  # Voz peruana femenina
VERTEX_AI_TTS_LOCATION=us-central1

# Vertex AI - Imagen API (infografías)
VERTEX_AI_IMAGEN_LOCATION=us-central1

# D-ID (videos con avatares - solo para este caso)
DID_API_KEY=did_api_key_here

# Google Cloud Storage (almacenamiento)
GCS_BUCKET_NAME=criteria-resources
GCS_BUCKET_LOCATION=us-central1

# Storage alternativo (si no usas GCS)
STORAGE_TYPE=gcs  # gcs | s3 | local | youtube
AWS_ACCESS_KEY_ID=...  # Solo si usas S3
AWS_SECRET_ACCESS_KEY=...  # Solo si usas S3
AWS_S3_BUCKET=criteria-resources  # Solo si usas S3

# Celery (procesamiento asíncrono)
REDIS_URL=redis://localhost:6379/0
# O usar Cloud Memorystore en producción

# YouTube (opcional, solo para videos)
YOUTUBE_API_KEY=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# OpenAI (opcional, alternativa a Vertex AI)
OPENAI_API_KEY=sk-proj-...  # Solo si prefieres OpenAI sobre Vertex AI
OPENAI_MODEL=gpt-4
```

### Configuración de Google Cloud

1. **Crear proyecto en Google Cloud Console**
2. **Habilitar APIs necesarias**:
   - Vertex AI API
   - Cloud Text-to-Speech API
   - Cloud Storage API
   - Cloud CDN API (opcional)
3. **Crear Service Account** con permisos:
   - `roles/aiplatform.user`
   - `roles/cloudstorage.admin`
   - `roles/texttospeech.admin`
4. **Descargar clave JSON** y configurar `GOOGLE_APPLICATION_CREDENTIALS`
5. **Crear bucket de GCS** para almacenar recursos

---

## 📋 Checklist de Implementación Multimedia

### Backend
- [ ] Configurar Google Cloud Project y habilitar APIs
- [ ] Configurar Service Account y credenciales
- [ ] Configurar servicios de generación:
  - [ ] Vertex AI Text-to-Speech (audios)
  - [ ] Vertex AI Imagen API (imágenes)
  - [ ] Vertex AI Text Generation (objetivos/criterios)
  - [ ] D-ID API (videos con avatares)
- [ ] Implementar `VertexAIService` (servicio principal)
- [ ] Implementar `MultimediaOrchestrator`
- [ ] Configurar Google Cloud Storage
- [ ] Configurar Celery o threading para tareas en background
- [ ] Implementar endpoint `/api/ai/generate` con generación asíncrona
- [ ] Implementar endpoint `/api/ai/generation-status/{id}`
- [ ] Implementar subida de recursos a GCS
- [ ] Agregar manejo de errores robusto
- [ ] Implementar logging de generación
- [ ] Tests de integración

### Frontend (Ya implementado ✅)
- [x] Tipos actualizados con estados y URLs
- [x] UI para mostrar videos/audios/imágenes
- [x] Polling automático para verificar estado
- [x] Manejo de estados de carga
- [x] Manejo de errores

---

## 🎯 Recomendaciones de Implementación

### Fase 0: Configuración Inicial
1. Crear proyecto en Google Cloud Console
2. Habilitar APIs necesarias (Vertex AI, Text-to-Speech, Storage)
3. Configurar Service Account y credenciales
4. Crear bucket de Google Cloud Storage
5. Configurar variables de entorno

### Fase 1: MVP (Solo Imágenes)
1. Implementar generación de imágenes con Vertex AI Imagen API
2. Configurar Google Cloud Storage para almacenar imágenes
3. Generación síncrona (rápida, 10-30 seg)
4. Validar flujo completo

### Fase 2: Audios
1. Agregar generación de audios con Vertex AI Text-to-Speech
2. Configurar voces en español peruano
3. Mantener síncrono (rápido, 10-30 seg)
4. Validar calidad de audio

### Fase 3: Objetivos y Criterios con Vertex AI
1. Migrar generación de objetivos/criterios a Vertex AI (Gemini o PaLM)
2. Validar calidad de respuestas
3. Comparar con OpenAI si es necesario

### Fase 4: Videos (Completo)
1. Agregar generación de videos con D-ID (solo para avatares)
2. Implementar procesamiento asíncrono (Celery)
3. Implementar polling en frontend
4. Validar experiencia completa

### Fase 5: Optimizaciones
1. Caché de recursos similares en GCS
2. Límites por usuario
3. Monitoreo de costos con Cloud Monitoring
4. Optimización de calidad/precio
5. Configurar Cloud CDN para distribución rápida

---

## 📊 Comparación

| Aspecto | Frontend ❌ | Backend ✅ |
|---------|------------|-----------|
| **Seguridad API Key** | Expuesta | Oculta |
| **Control de Costos** | No | Sí |
| **Rate Limiting** | No | Sí |
| **Validación** | Limitada | Completa |
| **Logging** | No | Sí |
| **Caché** | No | Sí |
| **Privacidad** | Baja | Alta |
| **Escalabilidad** | Baja | Alta |

---

## 🎯 Conclusión

**Los servicios de IA DEBEN ir en el backend**, nunca en el frontend.

### Razones principales:
1. 🔐 **Seguridad**: API keys protegidas
2. 💰 **Control de costos**: Monitoreo y límites
3. 🛡️ **Validación**: Datos validados antes de enviar
4. 📊 **Auditoría**: Logs y tracking
5. ⚡ **Optimización**: Caché y procesamiento eficiente

### El frontend solo debe:
- Enviar requests al backend
- Mostrar resultados
- Manejar estados de carga/error

### 🎯 Estrategia Recomendada de Implementación:

**Usar Vertex AI (Google Cloud) como servicio principal:**
- ✅ **Text-to-Speech** para audios
- ✅ **Imagen API** para infografías
- ✅ **Gemini/PaLM** para objetivos, criterios y scripts
- ✅ **Google Cloud Storage** para almacenamiento
- ✅ **Integración perfecta** entre todos los servicios

**Usar D-ID solo para videos con avatares:**
- ✅ Especializado en este caso de uso específico
- ✅ Mejor calidad para videos educativos con presentadores

**Ventajas de esta estrategia:**
1. **Un solo proveedor principal** simplifica configuración y mantenimiento
2. **Costos reducidos** (~$0.89-$2.19 por sesión vs $0.98-$4.74 con múltiples proveedores)
3. **Integración nativa** entre servicios de Google Cloud
4. **Mejor escalabilidad** y soporte empresarial
5. **Monitoreo unificado** con Cloud Monitoring

---

**Implementa los servicios de IA en el backend FastAPI usando Vertex AI como servicio principal, siguiendo la especificación en `ESPECIFICACION_API_COMPLETA.md`**
