# Configuración de OpenAI para Generación de Material

## ¿Qué hace OpenAI en CriterIA?

OpenAI se usa para generar material educativo avanzado basado en los criterios de evaluación que generas. Puedes crear:

- **Rúbricas de evaluación**: Tablas detalladas con niveles de desempeño
- **Ejercicios prácticos**: Actividades de evaluación específicas
- **Guías de retroalimentación**: Cómo evaluar y dar feedback
- **Ejemplos de trabajos**: Ejemplos en diferentes niveles de logro

## Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (empieza con `sk-`)

### 2. Configurar la API Key

Crea un archivo `.env` en la raíz del proyecto:

```bash
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o-mini
```

**Importante:** 
- El archivo `.env` ya está en `.gitignore`, así que no se subirá al repositorio
- Nunca compartas tu API key públicamente

### 3. Instalar dependencias

```bash
npm install
```

### 4. Reiniciar el servidor

Si el servidor ya está corriendo, reinícialo:

```bash
npm run dev:all
```

## Modo Simulación

Si **NO** configuras la API key, el sistema funcionará en **modo simulación**:
- Generará material educativo básico usando reglas predefinidas
- No hará llamadas a OpenAI
- Funciona completamente, pero con contenido menos personalizado

## Verificar Estado

Puedes verificar si OpenAI está configurado visitando:

```
GET http://localhost:3001/api/ai/status
```

O desde el código:

```typescript
const status = await apiService.getAIStatus();
console.log(status.openaiAvailable); // true o false
```

## Costos

OpenAI cobra por uso. El modelo `gpt-4o-mini` es económico:
- Aproximadamente $0.15 por cada 1M tokens de entrada
- Aproximadamente $0.60 por cada 1M tokens de salida

Una generación típica de material usa aproximadamente:
- 500-1000 tokens de entrada
- 500-1500 tokens de salida
- **Costo aproximado: $0.0005 - $0.001 por generación**

## Modelos Disponibles

Puedes cambiar el modelo en `.env`:

- `gpt-4o-mini` (recomendado): Más económico, buena calidad
- `gpt-4o`: Más caro, mejor calidad
- `gpt-3.5-turbo`: Más económico, calidad básica

## Solución de Problemas

### Error: "OPENAI_API_KEY no configurada"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que la variable se llama exactamente `OPENAI_API_KEY`
- Reinicia el servidor después de crear/modificar `.env`

### Error: "Invalid API key"
- Verifica que la API key es correcta
- Asegúrate de que no hay espacios antes/después de la key
- Verifica que la key no haya expirado en OpenAI

### El material generado es básico
- Verifica que OpenAI está disponible: `GET /api/ai/status`
- Si está en modo simulación, configura la API key
- Prueba con un modelo más avanzado (gpt-4o)

## Seguridad

- ✅ Nunca subas el archivo `.env` al repositorio
- ✅ No compartas tu API key públicamente
- ✅ Usa variables de entorno en producción
- ✅ Considera usar límites de rate limiting en producción

