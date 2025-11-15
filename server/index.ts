import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.js';
import sessionsRoutes from './routes/sessions.js';
import filesRoutes from './routes/files.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CriterIA API está funcionando' });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/files', filesRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message || 'Ocurrió un error inesperado',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.path} no existe`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor CriterIA API corriendo en http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 IA: http://localhost:${PORT}/api/ai/generate`);
  console.log(`📝 Sesiones: http://localhost:${PORT}/api/sessions`);
  console.log(`📁 Archivos: http://localhost:${PORT}/api/files`);
});

