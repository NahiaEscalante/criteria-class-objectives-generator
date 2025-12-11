# 📋 Plan de Cambios: Preparar Frontend para Backend FastAPI

## 🎯 Objetivo
Preparar el frontend para trabajar con un backend FastAPI separado en otro repositorio, eliminando toda la dependencia del backend Express actual.

---

## 🗑️ ELIMINAR

### 1. Carpeta Completa del Backend
**Ubicación:** `server/`
**Razón:** El backend se moverá a un repositorio separado con FastAPI

**Archivos a eliminar:**
```
server/
├── index.ts
├── types.ts
├── tsconfig.json
├── routes/
│   ├── ai.ts
│   ├── files.ts
│   └── sessions.ts
├── services/
│   ├── aiSimulator.ts
│   ├── openaiService.ts
│   └── storage.ts
└── data/
    └── sessions.json (si existe)
```

### 2. Dependencias del Backend en package.json
**Ubicación:** `package.json`
**Razón:** Ya no se necesitan dependencias de Node.js/Express

**Dependencias a eliminar:**
```json
{
  "@types/express": "^4.17.21",
  "@types/cors": "^2.8.17",
  "cors": "^2.8.5",
  "express": "^4.18.2",
  "tsx": "^4.7.0",
  "concurrently": "^8.2.2",
  "openai": "^4.28.0"
}
```

### 3. Scripts Relacionados con el Backend
**Ubicación:** `package.json` → `scripts`
**Razón:** Ya no hay backend local que ejecutar

**Scripts a eliminar:**
```json
{
  "dev:server": "tsx watch server/index.ts",
  "dev:all": "concurrently \"npm run dev:server\" \"npm run dev\""
}
```

### 4. Configuración de Proxy en Vite
**Ubicación:** `vite.config.ts`
**Razón:** El proxy solo funcionaba en desarrollo local. Con FastAPI separado, usaremos variables de entorno

**Código a eliminar:**
```typescript
proxy: mode === "development" ? {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    configure: (proxy, options) => {
      // ... todo el código del proxy
    },
  },
} : undefined,
```

### 5. Referencias en .gitignore
**Ubicación:** `.gitignore`
**Razón:** Ya no hay carpeta server/data

**Línea a eliminar:**
```
# Backend data files
server/data/sessions.json
```

### 6. Documentación del Backend Actual
**Ubicación:** Raíz del proyecto
**Razón:** La documentación es para Express, no aplica a FastAPI

**Archivos a eliminar:**
- `BACKEND.md` (documentación del backend Express)
- `OPENAI_SETUP.md` (si es específica del backend Express)
- `UBICACION_BACKEND.md` (ya no aplica)
- `SEPARACION_BACKEND_FRONTEND.md` (documentación de análisis, ya no necesaria)

**Nota:** Mantener `ANALISIS_PROYECTO.md` como referencia histórica si lo deseas.

---

## 🔄 CAMBIAR

### 1. URL Base de la API
**Archivo:** `src/lib/api.ts`
**Línea:** 11
**Cambio actual:**
```typescript
const API_BASE_URL = '/api';
```

**Cambio a:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

**Razón:** Permitir configuración mediante variable de entorno para diferentes entornos (dev, staging, producción)

### 2. Configuración de Vite para Variables de Entorno
**Archivo:** `vite.config.ts`
**Cambio:** Eliminar el proxy y mantener solo la configuración básica

**Antes:**
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === "development" ? {
      '/api': {
        target: 'http://localhost:3001',
        // ... configuración del proxy
      },
    } : undefined,
  },
  // ...
}));
```

**Después:**
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy eliminado - usar VITE_API_BASE_URL en .env
  },
  // ...
}));
```

### 3. Manejo de Upload de Archivos
**Archivo:** `src/lib/api.ts`
**Función:** `uploadFile`
**Línea:** 173-209

**Cambio actual:**
```typescript
async uploadFile(file: File): Promise<{ file: UploadedFile }> {
  // Envía JSON con metadatos
  body: JSON.stringify({
    name: file.name,
    size: file.size,
    type: file.type,
  }),
}
```

**Cambio a:**
```typescript
async uploadFile(file: File): Promise<{ file: UploadedFile }> {
  // Usar FormData para enviar el archivo real
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData, // No JSON, usar FormData
    // No incluir Content-Type header - el navegador lo hace automáticamente
    signal: createTimeoutSignal(10000), // Timeout más largo para uploads
  });
}
```

**Razón:** FastAPI esperará recibir el archivo real usando FormData, no solo metadatos JSON

### 4. Timeout para Generación de Material
**Archivo:** `src/lib/api.ts`
**Función:** `generateMaterial`
**Línea:** 410

**Cambio actual:**
```typescript
signal: createTimeoutSignal(3000),
```

**Cambio a:**
```typescript
signal: createTimeoutSignal(60000), // 60 segundos para generación con IA
```

**Razón:** La generación con IA real puede tardar más tiempo

### 5. Manejo de Errores en exportSession
**Archivo:** `src/lib/api.ts`
**Función:** `exportSession`
**Línea:** 381-396

**Cambio actual:**
```typescript
async exportSession(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}/export`, {
    // ... sin manejo de timeout ni fallback
  });
}
```

**Cambio a:**
```typescript
async exportSession(id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
      signal: createTimeoutSignal(30000), // 30 segundos para exportación
    }).catch(() => null);

    if (!response || !response.ok) {
      const error = response ? await response.json().catch(() => ({ message: 'Error desconocido' })) : { message: 'No se pudo conectar con el servidor' };
      throw new Error(error.message || 'Error al exportar sesión');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Error al exportar sesión');
  }
}
```

**Razón:** Agregar manejo de errores consistente con el resto de funciones

---

## ➕ AGREGAR

### 1. Archivo .env.example
**Ubicación:** Raíz del proyecto
**Contenido:**
```env
# API Backend URL
# Desarrollo local (FastAPI en otro puerto, ej: 8000)
VITE_API_BASE_URL=http://localhost:8000/api

# Producción (URL del backend desplegado)
# VITE_API_BASE_URL=https://api.criteria.com/api

# Nota: Las variables que empiezan con VITE_ son expuestas al frontend
```

**Razón:** Documentar las variables de entorno necesarias

### 2. Archivo .env.local (para desarrollo)
**Ubicación:** Raíz del proyecto
**Contenido:**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Razón:** Configuración local para desarrollo (no se sube a Git)

### 3. Actualizar .gitignore
**Ubicación:** `.gitignore`
**Agregar:**
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Mantener .env.example
!.env.example
```

**Razón:** No subir variables de entorno al repositorio

### 4. Documentación de Configuración
**Archivo:** `README.md` o nuevo archivo `CONFIGURACION.md`
**Contenido a agregar:**
```markdown
## Configuración del Backend

El frontend se conecta a un backend FastAPI separado. Para configurar la URL del backend:

1. Copia `.env.example` a `.env.local`
2. Configura `VITE_API_BASE_URL` con la URL de tu backend FastAPI
3. En desarrollo: `VITE_API_BASE_URL=http://localhost:8000/api`
4. En producción: `VITE_API_BASE_URL=https://tu-backend.com/api`

### Desarrollo Local

1. Inicia el backend FastAPI en el puerto 8000 (o el que configures)
2. Inicia el frontend: `npm run dev`
3. El frontend se conectará automáticamente al backend configurado en `.env.local`
```

### 5. Tipo para Variables de Entorno
**Archivo:** `src/vite-env.d.ts` (ya existe, solo agregar)
**Agregar:**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Razón:** TypeScript reconocerá las variables de entorno

### 6. Función de Utilidad para Verificar Backend
**Archivo:** `src/lib/api.ts` (opcional, pero recomendado)
**Agregar:**
```typescript
/**
 * Verifica si el backend está disponible
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      signal: createTimeoutSignal(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

**Razón:** Permitir verificar la conectividad con el backend

---

## ✅ MANTENER (Sin Cambios)

### 1. Estructura de Tipos
**Archivo:** `src/types/index.ts`
**Razón:** Los tipos deben coincidir con lo que FastAPI devuelve. Mantenerlos iguales.

### 2. Fallbacks a localStorage
**Archivo:** `src/lib/api.ts`
**Funciones:** `saveSession`, `getSessionList`, `getSessionById`, `deleteSession`
**Razón:** Los fallbacks son útiles cuando el backend no está disponible

### 3. Fallback de Datos Hardcodeados
**Archivo:** `src/lib/api.ts`
**Función:** `generateHardcodedAI`
**Razón:** Útil para desarrollo y cuando el backend no está disponible

### 4. Manejo de Errores Actual
**Archivo:** `src/lib/api.ts`
**Razón:** El manejo de errores actual es robusto y funciona bien

### 5. Componentes y Páginas
**Archivos:** `src/pages/*`, `src/components/*`
**Razón:** No necesitan cambios, solo usan `apiService`

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Eliminación
- [ ] Eliminar carpeta `server/` completa
- [ ] Eliminar dependencias del backend en `package.json`
- [ ] Eliminar scripts `dev:server` y `dev:all`
- [ ] Eliminar configuración de proxy en `vite.config.ts`
- [ ] Eliminar línea de `server/data/sessions.json` en `.gitignore`
- [ ] Eliminar documentación obsoleta (`BACKEND.md`, `OPENAI_SETUP.md`, etc.)

### Fase 2: Cambios en Código
- [ ] Cambiar `API_BASE_URL` para usar variable de entorno
- [ ] Actualizar función `uploadFile` para usar FormData
- [ ] Aumentar timeout en `generateMaterial` a 60 segundos
- [ ] Mejorar manejo de errores en `exportSession`
- [ ] Limpiar `vite.config.ts` (eliminar proxy)

### Fase 3: Configuración
- [ ] Crear `.env.example` con `VITE_API_BASE_URL`
- [ ] Crear `.env.local` para desarrollo
- [ ] Actualizar `.gitignore` para ignorar archivos `.env`
- [ ] Agregar tipos de variables de entorno en `vite-env.d.ts`

### Fase 4: Documentación
- [ ] Actualizar `README.md` con instrucciones de configuración
- [ ] Documentar cómo conectar con backend FastAPI
- [ ] Agregar instrucciones de desarrollo local

### Fase 5: Verificación
- [ ] Verificar que el frontend compila sin errores
- [ ] Verificar que los tipos TypeScript están correctos
- [ ] Probar que los fallbacks funcionan cuando no hay backend
- [ ] Verificar que las variables de entorno se cargan correctamente

---

## 🔍 VERIFICACIONES POST-CAMBIOS

### 1. Build del Frontend
```bash
npm run build
```
**Debe:** Compilar sin errores

### 2. Verificar Variables de Entorno
En el código del frontend, verificar que:
```typescript
console.log(import.meta.env.VITE_API_BASE_URL);
```
Muestra la URL correcta

### 3. Verificar que No Hay Referencias al Backend
```bash
grep -r "server/" src/
grep -r "localhost:3001" src/
grep -r "express" src/
```
**Debe:** No encontrar resultados (excepto en comentarios/documentación)

### 4. Verificar Fallbacks
- Desconectar el backend FastAPI
- Probar todas las funcionalidades
- Verificar que los fallbacks funcionan correctamente

---

## 📌 NOTAS IMPORTANTES

### Compatibilidad con FastAPI

1. **Formato de Fechas:**
   - FastAPI devuelve fechas como strings ISO (ej: `"2025-01-20T10:30:00Z"`)
   - El frontend ya maneja esto correctamente con `new Date()`

2. **Formato de Respuestas:**
   - FastAPI debe devolver el mismo formato JSON que espera el frontend
   - Verificar que los tipos en `src/types/index.ts` coincidan con los modelos Pydantic

3. **CORS:**
   - FastAPI debe configurar CORS para permitir el origen del frontend
   - En desarrollo: `http://localhost:8080`
   - En producción: URL del frontend desplegado

4. **Manejo de Errores:**
   - FastAPI debe devolver errores en formato JSON:
   ```json
   {
     "error": "Mensaje de error",
     "message": "Descripción detallada"
   }
   ```

### Endpoints que FastAPI debe implementar

1. `POST /api/ai/generate`
2. `POST /api/ai/generate-material`
3. `GET /api/ai/status`
4. `POST /api/files/upload` (con FormData)
5. `GET /api/sessions`
6. `POST /api/sessions`
7. `GET /api/sessions/{id}`
8. `DELETE /api/sessions/{id}`
9. `POST /api/sessions/{id}/export`
10. `GET /health` (opcional, para health check)

---

## 🚀 Orden de Ejecución Recomendado

1. **Primero:** Hacer backup del proyecto o crear una rama Git
2. **Segundo:** Eliminar todo lo relacionado con el backend (Fase 1)
3. **Tercero:** Hacer los cambios en el código (Fase 2)
4. **Cuarto:** Configurar variables de entorno (Fase 3)
5. **Quinto:** Actualizar documentación (Fase 4)
6. **Sexto:** Verificar todo funciona (Fase 5)

---

## ⚠️ ADVERTENCIAS

1. **No eliminar `src/lib/storage.ts`** si existe - puede ser útil para fallbacks
2. **Mantener los tipos** en `src/types/index.ts` - FastAPI debe coincidir con estos
3. **Probar los fallbacks** antes de eliminar el backend - asegurar que funcionan
4. **Backup antes de eliminar** - crear una rama Git o backup completo

---

## 📞 Siguiente Paso

Una vez completados estos cambios, el frontend estará listo para conectarse a un backend FastAPI. El siguiente paso sería:

1. Crear el repositorio del backend FastAPI
2. Implementar los endpoints según los tipos definidos en `src/types/index.ts`
3. Configurar CORS en FastAPI
4. Probar la integración completa

---

*Documento creado para preparar el frontend para backend FastAPI separado*

