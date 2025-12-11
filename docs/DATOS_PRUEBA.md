# 🧪 Datos de Prueba Embebidos

Este documento describe los datos de prueba embebidos que permiten probar la aplicación sin necesidad de backend.

## 📋 Usuarios de Prueba

Puedes usar estos usuarios para iniciar sesión en modo de prueba:

| Email | Contraseña | Nombre |
|-------|------------|--------|
| `docente1@example.com` | `password123` | María González |
| `docente2@example.com` | `password123` | Juan Pérez |
| `docente3@example.com` | `password123` | Ana Martínez |

**Nota:** También puedes registrar nuevos usuarios. Cualquier contraseña con al menos 6 caracteres funcionará en modo de prueba.

## 🎯 Sesiones de Prueba Pre-cargadas

El sistema incluye 3 sesiones de ejemplo que se cargan automáticamente:

### 1. Texto descriptivo sobre mi comunidad
- **Área:** Comunicación
- **Grado:** 4to de Primaria
- **Producto:** Texto descriptivo
- **Incluye:** Objetivos, criterios y recursos sugeridos

### 2. Problemas de suma y resta
- **Área:** Matemática
- **Grado:** 3ro de Primaria
- **Producto:** Resolución de problemas
- **Incluye:** Objetivos y criterios específicos de matemática

### 3. Afiche informativo sobre el reciclaje
- **Área:** Comunicación
- **Grado:** 5to de Primaria
- **Producto:** Afiche informativo
- **Incluye:** Objetivos y criterios para afiches

## 🔧 Cómo Activar el Modo de Prueba

### Opción 1: Automático (Recomendado)
El modo de prueba se activa automáticamente si:
- No hay `VITE_API_BASE_URL` configurado, o
- `VITE_API_BASE_URL` está configurado como `/api`

### Opción 2: Manual
Agrega a tu `.env.local`:

```bash
VITE_USE_MOCK_DATA=true
```

## 📊 Datos Disponibles

### Respuestas de Generación de IA

El sistema incluye respuestas predefinidas para diferentes áreas:

- **Comunicación (default):** Objetivos y criterios para textos descriptivos
- **Matemática:** Objetivos y criterios para resolución de problemas

### Materiales Educativos

Se incluyen ejemplos de:
- ✅ Rúbricas de evaluación
- ✅ Ejercicios prácticos
- ✅ Guías de retroalimentación
- ✅ Ejemplos de trabajos

## 🚀 Cómo Probar

1. **Iniciar sesión:**
   - Usa uno de los emails de prueba
   - Contraseña: `password123`

2. **Generar objetivos y criterios:**
   - Completa el formulario en `/generar`
   - Los datos generados serán de prueba (embebidos)

3. **Ver historial:**
   - Ve a `/historial`
   - Verás las 3 sesiones de ejemplo pre-cargadas

4. **Guardar nuevas sesiones:**
   - Las sesiones se guardan en localStorage
   - Se combinan con las sesiones de prueba

## 📝 Notas Importantes

- Los datos de prueba se combinan con datos de localStorage
- Las sesiones guardadas persisten entre recargas
- Puedes eliminar sesiones de prueba (se eliminan de la lista)
- Los nuevos registros se agregan a la lista de usuarios de prueba

## 🔄 Sincronización

Los datos de prueba se sincronizan con localStorage:
- Las sesiones guardadas se combinan con las de prueba
- Si eliminas una sesión de prueba, se elimina de ambos lugares
- Las nuevas sesiones se guardan en localStorage

---

**¡Listo para probar!** 🎉

Usa los usuarios de prueba para iniciar sesión y explorar todas las funcionalidades.
