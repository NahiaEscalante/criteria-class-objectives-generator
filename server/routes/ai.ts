import { Router } from 'express';
import { aiSimulator } from '../services/aiSimulator.js';
import type { AiGenerationRequest, AiGenerationResponse } from '../types.js';

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

export default router;

