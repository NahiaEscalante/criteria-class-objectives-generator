import { Router } from 'express';
import type { UploadedFile } from '../types.js';
import { storageService } from '../services/storage.js';

const router = Router();

/**
 * POST /api/files/upload
 * Sube un archivo PPT (simulación - solo guarda metadatos)
 */
router.post('/upload', async (req, res) => {
  try {
    // En una implementación real, aquí se usaría multer u otro middleware
    // Por ahora, simulamos la subida recibiendo metadatos del archivo
    
    const { name, size, type } = req.body as {
      name?: string;
      size?: number;
      type?: string;
    };

    if (!name) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre del archivo es requerido',
      });
    }

    // Validar que sea un archivo PPT
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
    ];
    
    const fileType = type || 'application/vnd.ms-powerpoint';
    
    if (!allowedTypes.some(t => fileType.includes('powerpoint') || fileType.includes('presentation'))) {
      // Si no es PPT, permitirlo de todos modos (para simulación)
      // En producción, validar estrictamente
    }

    // Crear objeto de archivo simulado
    const file: UploadedFile = {
      id: storageService.generateId(),
      name: name,
      size: size || 0,
      type: fileType,
      uploadedAt: new Date(),
    };

    // En producción real, aquí se guardaría el archivo en el sistema de archivos o S3
    // Por ahora, solo retornamos los metadatos

    res.status(201).json({
      success: true,
      file: file,
      message: 'Archivo subido correctamente (simulación)',
      note: 'En producción, el archivo se guardaría físicamente',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo subir el archivo',
      details: error.message,
    });
  }
});

/**
 * GET /api/files/:id
 * Obtiene información de un archivo subido
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // En producción real, aquí se buscaría el archivo en la base de datos
    // Por ahora, retornamos un error ya que no tenemos un sistema de archivos persistente
    
    res.status(404).json({
      error: 'Archivo no encontrado',
      message: 'El sistema de archivos persistente no está implementado',
      note: 'Los archivos se guardan como parte de las sesiones',
    });
  } catch (error: any) {
    console.error('Error loading file:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo cargar el archivo',
      details: error.message,
    });
  }
});

export default router;

