import { Router } from 'express';
import { aiSimulator } from '../services/aiSimulator.js';
import { openaiService } from '../services/openaiService.js';
import type { AiGenerationRequest, AiGenerationResponse, MaterialGenerationRequest, MaterialGenerationResponse } from '../types.js';

const router = Router();

/**
 * POST /api/ai/generate
 * Genera objetivos, criterios y recursos usando simulación de IA
 */
router.post('/generate', async (req, res) => {
  try {
    const request = req.body as AiGenerationRequest;

    // Validación básica
    if (!request.curriculum || !request.classInfo) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren curriculum y classInfo',
      });
    }

    // Validar campos requeridos del currículo
    const { area, competencia, capacidad, desempeno, grado } = request.curriculum;
    if (!area || !competencia || !capacidad || !desempeno || !grado) {
      return res.status(400).json({
        error: 'Campos del currículo incompletos',
        message: 'Todos los campos del currículo son requeridos',
      });
    }

    // Validar campos requeridos de la clase
    const { producto, evidencia, contexto } = request.classInfo;
    if (!producto || !evidencia || !contexto) {
      return res.status(400).json({
        error: 'Campos de la clase incompletos',
        message: 'Producto, evidencia y contexto son requeridos',
      });
    }

    // Generar con IA (simulada)
    const response: AiGenerationResponse = await aiSimulator.generateAsync(request);

    res.json(response);
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo generar el contenido',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai/generate-material
 * Genera material educativo (rúbrica, ejercicios, guía, ejemplos) basado en los criterios
 */
router.post('/generate-material', async (req, res) => {
  try {
    const request = req.body as MaterialGenerationRequest;

    // Validación
    if (!request.criteria || !Array.isArray(request.criteria) || request.criteria.length === 0) {
      return res.status(400).json({
        error: 'Criterios requeridos',
        message: 'Se requiere un array de criterios de evaluación',
      });
    }

    if (!request.curriculum || !request.classInfo) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren curriculum y classInfo',
      });
    }

    if (!request.materialType || !['rubrica', 'ejercicios', 'guia', 'ejemplos'].includes(request.materialType)) {
      return res.status(400).json({
        error: 'Tipo de material inválido',
        message: 'El tipo debe ser: rubrica, ejercicios, guia o ejemplos',
      });
    }

    // Generar material con OpenAI (o simulación si no está disponible)
    const material = await openaiService.generateMaterial(
      request.criteria,
      request.curriculum,
      request.classInfo,
      request.materialType
    );

    const response: MaterialGenerationResponse = {
      material,
      materialType: request.materialType,
      generatedAt: new Date(),
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error generating material:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo generar el material',
      details: error.message,
    });
  }
});

/**
 * GET /api/ai/status
 * Verifica si OpenAI está disponible
 */
router.get('/status', (req, res) => {
  res.json({
    openaiAvailable: openaiService.isOpenAIAvailable(),
    message: openaiService.isOpenAIAvailable()
      ? 'OpenAI está configurado y disponible'
      : 'OpenAI no está configurado. Se usará modo simulación.',
  });
});

export default router;

