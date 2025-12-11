# 🔐 Plan de Autenticación Completa - CriterIA

## 🎯 Objetivo

Implementar autenticación completa para que:
- Cada usuario tenga su propia cuenta
- Solo vea sus propios contenidos generados
- Tenga personalización por usuario
- Los datos estén seguros y privados

---

## ✅ Ventajas de Autenticación Completa

### 1. **Privacidad y Seguridad**
- Cada usuario solo ve sus propias sesiones
- No puede acceder a contenido de otros usuarios
- Datos protegidos por autenticación

### 2. **Personalización**
- Preferencias por usuario
- Historial personalizado
- Configuraciones guardadas
- Estadísticas individuales

### 3. **Escalabilidad**
- Múltiples usuarios simultáneos
- Base de datos organizada por usuario
- Analytics por usuario
- Futuras funcionalidades sociales (compartir, colaborar)

### 4. **Experiencia de Usuario**
- Login persistente
- Sincronización entre dispositivos
- Recuperación de cuenta
- Perfil de usuario

---

## 📋 Cambios Necesarios en Backend FastAPI

### 1. Modelos de Base de Datos Nuevos

#### Tabla `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);
```

#### Modificación a Tabla `sessions`
```sql
ALTER TABLE sessions 
ADD COLUMN user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE;
```

**Nota:** Esto significa que cada sesión debe pertenecer a un usuario.

### 2. Modelos Pydantic Nuevos

#### User Models
```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Se hasheará antes de guardar
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos
```

#### Modificación a Session Model
```python
class Session(BaseModel):
    id: str
    nombre: str
    user_id: str  # ← NUEVO: Relación con usuario
    curriculum: CurriculumSelection
    classInfo: ClassInformation
    file: UploadedFile | None = None
    generation: AiGenerationResponse
    createdAt: datetime
    updatedAt: datetime
```

### 3. Endpoints de Autenticación (Nuevos)

#### `POST /api/auth/register`
**Descripción:** Registro de nuevo usuario

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Juan Pérez"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "created_at": "2025-01-20T10:30:00Z",
    "is_active": true
  },
  "token": {
    "access_token": "jwt-token-aqui",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### `POST /api/auth/login`
**Descripción:** Inicio de sesión

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  },
  "token": {
    "access_token": "jwt-token-aqui",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas",
  "message": "El email o contraseña son incorrectos"
}
```

#### `GET /api/auth/me`
**Descripción:** Obtiene información del usuario actual

**Headers:**
```
Authorization: Bearer jwt-token-aqui
```

**Response (200 OK):**
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "created_at": "2025-01-20T10:30:00Z",
  "is_active": true
}
```

#### `POST /api/auth/logout` (Opcional)
**Descripción:** Cierra sesión (invalidar token)

**Headers:**
```
Authorization: Bearer jwt-token-aqui
```

**Response (200 OK):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

#### `POST /api/auth/refresh` (Opcional pero recomendado)
**Descripción:** Renueva el token JWT

**Request:**
```json
{
  "refresh_token": "refresh-token-aqui"
}
```

---

### 4. Modificaciones a Endpoints Existentes

#### `GET /api/sessions`
**Cambio:** Filtrar por `user_id` del token JWT

**Antes:**
```python
@app.get("/api/sessions")
async def get_sessions():
    sessions = await get_all_sessions()
    return sessions
```

**Después:**
```python
@app.get("/api/sessions")
async def get_sessions(current_user: User = Depends(get_current_user)):
    sessions = await get_sessions_by_user_id(current_user.id)
    return sessions
```

#### `POST /api/sessions`
**Cambio:** Asignar automáticamente `user_id` del token

**Antes:**
```python
@app.post("/api/sessions")
async def create_session(session: Session):
    # Guardar sesión sin user_id
```

**Después:**
```python
@app.post("/api/sessions")
async def create_session(
    session: SessionCreate,  # Sin user_id
    current_user: User = Depends(get_current_user)
):
    # Asignar user_id automáticamente
    session.user_id = current_user.id
    # Guardar sesión
```

#### `GET /api/sessions/{id}`
**Cambio:** Verificar que la sesión pertenece al usuario

**Después:**
```python
@app.get("/api/sessions/{id}")
async def get_session(
    id: str,
    current_user: User = Depends(get_current_user)
):
    session = await get_session_by_id(id)
    
    # Verificar ownership
    if session.user_id != current_user.id:
        raise HTTPException(403, "No tienes acceso a esta sesión")
    
    return session
```

#### `DELETE /api/sessions/{id}`
**Cambio:** Verificar ownership antes de eliminar

#### `POST /api/sessions/{id}/export`
**Cambio:** Verificar ownership antes de exportar

#### `POST /api/ai/generate`
**Cambio:** Opcional - puede guardar historial por usuario

#### `POST /api/files/upload`
**Cambio:** Asociar archivos al usuario

---

### 5. Middleware de Autenticación

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    
    user = await get_user_by_id(user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )
    
    return user
```

---

## 📋 Cambios Necesarios en Frontend

### 1. Nuevas Páginas

#### `src/pages/Login.tsx`
- Formulario de login (email + password)
- Link a registro
- Manejo de errores
- Redirección después de login

#### `src/pages/Register.tsx`
- Formulario de registro (email + password + name)
- Validación de contraseña
- Link a login
- Manejo de errores

### 2. Contexto de Autenticación

#### `src/contexts/AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Funcionalidades:**
- Guardar token en localStorage
- Verificar token al cargar app
- Refrescar token automáticamente
- Limpiar datos al logout

### 3. Componente de Ruta Protegida

#### `src/components/ProtectedRoute.tsx`
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

### 4. Modificaciones a Rutas

#### `src/App.tsx`
```typescript
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Rutas protegidas */}
  <Route path="/generar" element={
    <ProtectedRoute>
      <Generar />
    </ProtectedRoute>
  } />
  <Route path="/historial" element={
    <ProtectedRoute>
      <Historial />
    </ProtectedRoute>
  } />
</Routes>
```

### 5. Modificaciones a Navbar

#### `src/components/Navbar.tsx`
**Agregar:**
- Botón "Iniciar sesión" si no está autenticado
- Menú de usuario si está autenticado (nombre, logout)
- Indicador de estado de autenticación

### 6. Modificaciones a API Service

#### `src/lib/api.ts`
**Cambios:**
- Agregar token en headers de todas las requests
- Manejar errores 401 (redirigir a login)
- Refrescar token automáticamente

```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// En cada fetch:
headers: getAuthHeaders(),
```

### 7. Nuevos Tipos

#### `src/types/index.ts`
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}
```

---

## 🔒 Seguridad

### 1. Hash de Contraseñas
- Usar `bcrypt` o `argon2`
- Nunca guardar contraseñas en texto plano
- Salt automático

### 2. JWT Tokens
- Secret key fuerte
- Expiración razonable (1 hora)
- Refresh tokens para renovación
- Algoritmo: HS256 o RS256

### 3. Validación
- Validar email con regex
- Contraseña mínima (8 caracteres, mayúsculas, números)
- Rate limiting en login (prevenir brute force)

### 4. HTTPS
- Obligatorio en producción
- Nunca enviar tokens por HTTP

---

## 📊 Base de Datos - Cambios

### Migración de Datos Existentes

Si ya hay sesiones sin `user_id`, necesitas:

1. **Crear usuario "default" o "migrated"**
```sql
INSERT INTO users (id, email, name, password_hash)
VALUES ('00000000-0000-0000-0000-000000000000', 'migrated@system.local', 'Sesiones Migradas', 'no-password');
```

2. **Asignar todas las sesiones existentes a este usuario**
```sql
UPDATE sessions 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;
```

3. **Hacer user_id NOT NULL después de migración**
```sql
ALTER TABLE sessions 
ALTER COLUMN user_id SET NOT NULL;
```

---

## 🎨 Personalización por Usuario (Futuro)

### Campos que puedes agregar después:

#### Tabla `user_preferences`
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    theme VARCHAR(20) DEFAULT 'light',  -- light, dark, auto
    language VARCHAR(10) DEFAULT 'es',  -- es, en
    default_area VARCHAR(50),  -- Área curricular favorita
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Endpoints futuros:
- `GET /api/user/preferences` - Obtener preferencias
- `PUT /api/user/preferences` - Actualizar preferencias
- `GET /api/user/stats` - Estadísticas del usuario
- `GET /api/user/activity` - Actividad reciente

---

## 📝 Checklist de Implementación

### Backend FastAPI
- [ ] Crear tabla `users` en base de datos
- [ ] Agregar columna `user_id` a tabla `sessions`
- [ ] Crear modelos Pydantic para auth
- [ ] Implementar hash de contraseñas (bcrypt)
- [ ] Implementar generación de JWT
- [ ] Crear middleware de autenticación
- [ ] Implementar `POST /api/auth/register`
- [ ] Implementar `POST /api/auth/login`
- [ ] Implementar `GET /api/auth/me`
- [ ] Modificar `GET /api/sessions` para filtrar por usuario
- [ ] Modificar `POST /api/sessions` para asignar user_id
- [ ] Modificar `GET /api/sessions/{id}` para verificar ownership
- [ ] Modificar `DELETE /api/sessions/{id}` para verificar ownership
- [ ] Modificar `POST /api/sessions/{id}/export` para verificar ownership
- [ ] Agregar validación de email y contraseña
- [ ] Agregar rate limiting en login
- [ ] Configurar CORS para incluir credentials

### Frontend React
- [ ] Crear página `Login.tsx`
- [ ] Crear página `Register.tsx`
- [ ] Crear `AuthContext.tsx`
- [ ] Crear `ProtectedRoute.tsx`
- [ ] Agregar tipos de autenticación
- [ ] Modificar `App.tsx` para proteger rutas
- [ ] Modificar `Navbar.tsx` para mostrar auth state
- [ ] Modificar `api.ts` para incluir token en headers
- [ ] Manejar errores 401 (redirigir a login)
- [ ] Guardar token en localStorage
- [ ] Verificar token al cargar app
- [ ] Limpiar datos al logout

### Testing
- [ ] Test de registro
- [ ] Test de login
- [ ] Test de protección de rutas
- [ ] Test de filtrado por usuario
- [ ] Test de ownership verification

---

## ⏱️ Tiempo Estimado

### Backend
- Modelos y base de datos: 2-3 horas
- Endpoints de auth: 3-4 horas
- Middleware y seguridad: 2-3 horas
- Modificar endpoints existentes: 2-3 horas
- **Total Backend: 9-13 horas**

### Frontend
- Páginas de auth: 3-4 horas
- Contexto y protección: 2-3 horas
- Modificaciones a componentes: 2-3 horas
- Integración con API: 2-3 horas
- **Total Frontend: 9-13 horas**

### Testing y Ajustes
- Tests básicos: 2-3 horas
- Ajustes y bug fixes: 2-3 horas
- **Total Testing: 4-6 horas**

### **TOTAL: 22-32 horas**

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Backend Básico (Sin Auth)
1. Implementar las 10 APIs básicas
2. Todo funciona sin usuarios
3. **Tiempo: 20-30 horas**

### Fase 2: Autenticación Backend
1. Crear modelos de usuario
2. Implementar endpoints de auth
3. Agregar middleware
4. Modificar endpoints existentes
5. **Tiempo: 9-13 horas**

### Fase 3: Autenticación Frontend
1. Crear páginas de login/register
2. Implementar AuthContext
3. Proteger rutas
4. Integrar con backend
5. **Tiempo: 9-13 horas**

### Fase 4: Testing y Refinamiento
1. Tests de autenticación
2. Ajustes de UX
3. Bug fixes
4. **Tiempo: 4-6 horas**

---

## 💡 Recomendaciones

### 1. **Empezar sin Auth, Agregar Después**
- Implementa las APIs básicas primero
- Luego agrega autenticación
- Es más fácil agregar que quitar

### 2. **Usar Librerías Probadas**
- `python-jose` para JWT
- `passlib` para hash de contraseñas
- `react-router-dom` para protección de rutas

### 3. **Planificar Migración de Datos**
- Si ya hay datos, planifica la migración
- Crea usuario "default" para datos existentes
- Documenta el proceso

### 4. **Seguridad desde el Inicio**
- HTTPS obligatorio
- Validación robusta
- Rate limiting
- No exponer información sensible en errores

---

## 📌 Conclusión

**Autenticación completa es la mejor opción** porque:
- ✅ Privacidad y seguridad
- ✅ Personalización por usuario
- ✅ Escalabilidad
- ✅ Base sólida para futuras funcionalidades

**Tiempo total:** 22-32 horas adicionales después del backend básico

**Recomendación:** Implementar backend básico primero, luego agregar autenticación en una segunda fase.

---

*Plan creado para implementación de autenticación completa en CriterIA*

