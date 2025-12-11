# ✅ Resumen: Datos de Prueba Implementados

## 📦 Archivos Creados

### 1. `src/lib/mockData.ts`
Contiene todos los datos embebidos (JSONs) para pruebas:
- ✅ 3 usuarios de prueba
- ✅ Respuestas de autenticación
- ✅ 2 respuestas de generación de IA (Comunicación y Matemática)
- ✅ 3 sesiones de ejemplo pre-cargadas
- ✅ 4 tipos de materiales educativos (rúbrica, ejercicios, guía, ejemplos)
- ✅ Funciones helper para obtener datos

### 2. `src/lib/mockService.ts`
Servicios que usan los datos embebidos:
- ✅ `mockAuthService`: Login, registro, obtener usuario
- ✅ `mockApiService`: Todas las operaciones de API
- ✅ Función `shouldUseMockData()`: Detecta automáticamente si usar datos de prueba

### 3. `docs/DATOS_PRUEBA.md`
Documentación completa sobre cómo usar los datos de prueba

## 🔧 Modificaciones Realizadas

### `src/lib/auth.ts`
- ✅ Integrado con `mockAuthService`
- ✅ Usa datos de prueba automáticamente cuando no hay backend

### `src/lib/api.ts`
- ✅ Integrado con `mockApiService`
- ✅ Todas las funciones usan datos de prueba cuando corresponde

## 🎯 Funcionalidades Disponibles

### Autenticación
- ✅ Login con usuarios de prueba
- ✅ Registro de nuevos usuarios
- ✅ Obtener usuario actual

**Usuarios de prueba:**
- `docente1@example.com` / `password123`
- `docente2@example.com` / `password123`
- `docente3@example.com` / `password123`

### Generación de IA
- ✅ Generación de objetivos y criterios
- ✅ Respuestas personalizadas según el área (Comunicación/Matemática)
- ✅ Recursos sugeridos (videos, audios, imágenes)

### Sesiones
- ✅ 3 sesiones de ejemplo pre-cargadas
- ✅ Guardar nuevas sesiones
- ✅ Listar sesiones (combina datos de prueba + localStorage)
- ✅ Obtener sesión por ID
- ✅ Eliminar sesiones

### Materiales Educativos
- ✅ Rúbricas de evaluación
- ✅ Ejercicios prácticos
- ✅ Guías de retroalimentación
- ✅ Ejemplos de trabajos

## 🚀 Cómo Funciona

### Activación Automática
El modo de prueba se activa automáticamente si:
1. No hay `VITE_API_BASE_URL` configurado, o
2. `VITE_API_BASE_URL` está configurado como `/api`

### Activación Manual
Agrega a `.env.local`:
```bash
VITE_USE_MOCK_DATA=true
```

### Flujo de Datos
1. La aplicación intenta usar el backend real
2. Si no está disponible o `shouldUseMockData()` es true:
   - Usa `mockAuthService` para autenticación
   - Usa `mockApiService` para todas las operaciones
3. Los datos se combinan con localStorage para persistencia

## 📊 Datos Incluidos

### Sesiones de Ejemplo
1. **Texto descriptivo sobre mi comunidad**
   - Comunicación, 4to Primaria
   - Objetivos y criterios completos

2. **Problemas de suma y resta**
   - Matemática, 3ro Primaria
   - Objetivos y criterios específicos

3. **Afiche informativo sobre el reciclaje**
   - Comunicación, 5to Primaria
   - Objetivos y criterios para afiches

### Materiales Educativos
- Rúbricas con niveles de desempeño
- Ejercicios prácticos con ejemplos
- Guías de retroalimentación detalladas
- Ejemplos de trabajos de estudiantes

## ✅ Ventajas

1. **Sin dependencias externas:** Funciona completamente offline
2. **Datos realistas:** Datos basados en casos de uso reales
3. **Fácil de probar:** Usuarios y sesiones pre-configurados
4. **Persistencia:** Se combina con localStorage
5. **Automático:** Se activa cuando no hay backend

## 🎓 Próximos Pasos

1. **Probar el proyecto:**
   ```bash
   npm run dev
   ```

2. **Iniciar sesión:**
   - Email: `docente1@example.com`
   - Contraseña: `password123`

3. **Explorar:**
   - Generar nuevos objetivos y criterios
   - Ver las sesiones de ejemplo en Historial
   - Generar materiales educativos
   - Guardar nuevas sesiones

---

**¡Todo listo para probar!** 🚀

Los datos de prueba están completamente integrados y funcionan automáticamente.
