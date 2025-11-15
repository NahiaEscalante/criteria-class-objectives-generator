import { Router } from 'express';
import { storageService } from '../services/storage.js';
import type { Session } from '../types.js';

const router = Router();

/**
 * POST /api/sessions
 * Guarda una nueva sesión
 */
router.post('/', async (req, res) => {
  try {
    const session = req.body as Session;

    // Validación básica
    if (!session.id || !session.nombre || !session.curriculum || !session.classInfo || !session.generation) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Todos los campos de la sesión son requeridos',
      });
    }

    // Si no tiene fecha de creación, agregarla
    if (!session.createdAt) {
      session.createdAt = new Date();
    }
    session.updatedAt = new Date();

    // Guardar sesión
    const savedSession = await storageService.saveSession(session);

    res.status(201).json(savedSession);
  } catch (error: any) {
    console.error('Error saving session:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo guardar la sesión',
      details: error.message,
    });
  }
});

/**
 * GET /api/sessions
 * Lista todas las sesiones (resumen)
 */
router.get('/', async (req, res) => {
  try {
    const sessions = await storageService.getSessionList();
    res.json(sessions);
  } catch (error: any) {
    console.error('Error loading sessions:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron cargar las sesiones',
      details: error.message,
    });
  }
});

/**
 * GET /api/sessions/:id
 * Obtiene una sesión completa por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await storageService.getSessionById(id);

    if (!session) {
      return res.status(404).json({
        error: 'Sesión no encontrada',
        message: `No se encontró una sesión con ID: ${id}`,
      });
    }

    res.json(session);
  } catch (error: any) {
    console.error('Error loading session:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo cargar la sesión',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Elimina una sesión
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storageService.deleteSession(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Sesión no encontrada',
        message: `No se encontró una sesión con ID: ${id}`,
      });
    }

    res.json({
      success: true,
      message: 'Sesión eliminada correctamente',
    });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar la sesión',
      details: error.message,
    });
  }
});

/**
 * POST /api/sessions/:id/export
 * Exporta una sesión a PDF/DOCX (simulación)
 */
router.post('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body as { format?: 'pdf' | 'docx' };

    const session = await storageService.getSessionById(id);

    if (!session) {
      return res.status(404).json({
        error: 'Sesión no encontrada',
        message: `No se encontró una sesión con ID: ${id}`,
      });
    }

    // Simulación de exportación
    // En producción real, aquí se generaría el PDF/DOCX
    const exportFormat = format || 'pdf';
    
    res.json({
      success: true,
      message: `Exportación ${exportFormat.toUpperCase()} iniciada`,
      sessionId: id,
      format: exportFormat,
      downloadUrl: `/api/exports/${id}.${exportFormat}`, // Simulado
      note: 'En producción, aquí se generaría el archivo real',
    });
  } catch (error: any) {
    console.error('Error exporting session:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo exportar la sesión',
      details: error.message,
    });
  }
});

export default router;

