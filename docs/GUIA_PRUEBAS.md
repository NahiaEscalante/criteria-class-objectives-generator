# 🧪 Guía para Probar el Proyecto CriterIA

## 📋 Requisitos Previos

- ✅ Node.js instalado (v24.2.0 detectado)
- ✅ npm instalado (v11.3.0 detectado)
- ✅ Dependencias instaladas (node_modules existe)

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Verificar Dependencias

Si no tienes las dependencias instaladas o quieres actualizarlas:

```bash
npm install
```

### 2. Configurar Variables de Entorno

El proyecto necesita la variable `VITE_API_BASE_URL` para conectarse al backend.

**Opción A: Si tienes backend FastAPI corriendo**

Crea o edita `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

**Opción B: Si NO tienes backend (modo desarrollo con fallback)**

El proyecto funciona sin backend usando datos hardcodeados. Puedes dejar `.env.local` vacío o usar:

```bash
VITE_API_BASE_URL=/api
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará en: **http://localhost:8080**

### 4. Abrir en el Navegador

Abre tu navegador y ve a: **http://localhost:8080**

---

## ✅ Qué Esperar

### Sin Backend (Modo Fallback)

El proyecto está diseñado para funcionar **sin backend** usando:

1. **Datos hardcodeados** para generación de IA
2. **localStorage** para guardar sesiones
3. **Simulación** de autenticación (pero necesitarás backend para login real)

**Funcionalidades que SÍ funcionan sin backend:**
- ✅ Navegación entre páginas
- ✅ Generación de objetivos y criterios (datos hardcodeados)
- ✅ Guardado de sesiones en localStorage
- ✅ Historial de sesiones (desde localStorage)
- ✅ Edición de objetivos y criterios
- ✅ Generación de material educativo (básico)

**Funcionalidades que NO funcionan sin backend:**
- ❌ Login/Registro real (necesita backend)
- ❌ Subida real de archivos PPT
- ❌ Exportación PDF real
- ❌ Generación real con OpenAI

### Con Backend

Si tienes el backend FastAPI corriendo en `http://localhost:8000`:

1. Todas las funcionalidades funcionarán completamente
2. Login/Registro funcionará
3. Generación real con IA
4. Subida real de archivos
5. Exportación PDF

---

## 🧪 Cómo Probar las Funcionalidades

### 1. Página de Inicio (Landing)

- ✅ Deberías ver la página de inicio con información del proyecto
- ✅ Botones para "Iniciar sesión" o "Comenzar gratis"
- ✅ Sección de beneficios y "Cómo funciona"

### 2. Registro/Login (Sin Backend)

**⚠️ Nota:** Sin backend, el login/registro fallará, pero puedes:

- Ver los formularios
- Probar la validación de campos
- Ver los mensajes de error

**Para probar con backend:**
- Asegúrate de tener el backend corriendo
- Usa credenciales válidas del backend

### 3. Generar Objetivos y Criterios

**Sin backend (funciona con fallback):**

1. Ve a `/generar` (si no estás autenticado, te redirigirá a login)
2. **Para probar sin autenticación:** Comenta temporalmente `ProtectedRoute` en `App.tsx`
3. Completa el formulario:
   - Selecciona área, competencia, capacidad, desempeño, grado
   - Ingresa producto, evidencia, contexto
4. Haz clic en "Generar objetivos y criterios con IA"
5. **Resultado esperado:** Verás objetivos y criterios generados (datos hardcodeados)

**Funcionalidades a probar:**
- ✅ Editar objetivos y criterios
- ✅ Agregar nuevos criterios
- ✅ Ver recursos sugeridos (videos, audios, imágenes)
- ✅ Generar material educativo
- ✅ Guardar sesión (se guardará en localStorage)
- ✅ Copiar criterios al portapapeles

### 4. Historial

1. Ve a `/historial`
2. Deberías ver las sesiones guardadas en localStorage
3. Prueba:
   - Ver detalles de una sesión
   - Eliminar una sesión
   - Editar una sesión (navega a Generar)

---

## 🔍 Verificar que Todo Funciona

### Checklist de Pruebas

#### Navegación
- [ ] La página de inicio carga correctamente
- [ ] Los enlaces del navbar funcionan
- [ ] Las rutas protegidas redirigen a login si no estás autenticado

#### Generación (Modo Fallback)
- [ ] El formulario de generación se muestra
- [ ] La validación de campos funciona
- [ ] Al generar, aparecen objetivos y criterios (hardcodeados)
- [ ] Puedes editar objetivos y criterios
- [ ] Puedes agregar nuevos criterios
- [ ] Los recursos sugeridos se muestran en tabs
- [ ] Puedes generar material educativo
- [ ] Puedes guardar la sesión

#### Historial
- [ ] Las sesiones guardadas aparecen en el historial
- [ ] Puedes ver detalles de una sesión
- [ ] Puedes eliminar una sesión
- [ ] Puedes navegar a editar una sesión

#### UI/UX
- [ ] El diseño es responsive (prueba en móvil)
- [ ] Los toasts/notificaciones aparecen
- [ ] Los estados de carga se muestran
- [ ] Los errores se manejan correctamente

---

## 🐛 Solución de Problemas

### El servidor no inicia

```bash
# Verifica que el puerto 8080 esté libre
lsof -i :8080

# O cambia el puerto en vite.config.ts
```

### Errores de módulos no encontrados

```bash
# Reinstala las dependencias
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript

```bash
# Verifica la configuración
npm run lint
```

### La página está en blanco

1. Abre la consola del navegador (F12)
2. Revisa los errores en la consola
3. Verifica que todos los archivos se carguen correctamente

### No se generan objetivos/criterios

**Sin backend:** Esto es normal, deberías ver datos hardcodeados. Si no aparecen:
- Abre la consola del navegador
- Verifica que no haya errores de JavaScript
- Verifica que el fallback se active (timeout de 2 segundos)

---

## 📝 Notas Importantes

1. **Modo Desarrollo:** El proyecto funciona sin backend para desarrollo
2. **localStorage:** Las sesiones se guardan en el navegador (localStorage)
3. **Autenticación:** Sin backend, el login fallará pero puedes ver la UI
4. **Datos Hardcodeados:** Los objetivos/criterios son ejemplos, no son generados por IA real

---

## 🎯 Próximos Pasos

1. **Probar todas las funcionalidades** siguiendo esta guía
2. **Conectar con backend** cuando esté listo
3. **Configurar variables de entorno** para producción
4. **Revisar el análisis completo** en `docs/ANALISIS_COMPLETO_PROYECTO.md`

---

**¡Listo para probar!** 🚀

Ejecuta `npm run dev` y abre http://localhost:8080
