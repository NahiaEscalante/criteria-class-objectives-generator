import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Session, SessionListItem } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_FILE = path.join(__dirname, '..', 'data', 'sessions.json');
const STORAGE_DIR = path.dirname(STORAGE_FILE);

/**
 * Servicio de almacenamiento de sesiones usando archivo JSON
 * (simula una base de datos simple)
 */
export class StorageService {
  /**
   * Asegura que el directorio de datos existe
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (error) {
      // El directorio ya existe o hay un error
      console.error('Error creating data directory:', error);
    }
  }

  /**
   * Lee todas las sesiones del archivo
   */
  private async readSessions(): Promise<Session[]> {
    await this.ensureDataDir();
    
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      const sessions = JSON.parse(data) as Session[];
      
      // Convertir strings de fecha a Date objects
      return sessions.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        generation: {
          ...session.generation,
          generatedAt: new Date(session.generation.generatedAt),
        },
        file: session.file
          ? {
              ...session.file,
              uploadedAt: new Date(session.file.uploadedAt),
            }
          : undefined,
      }));
    } catch (error: any) {
      // Si el archivo no existe, retornar array vacío
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Error reading sessions:', error);
      throw new Error('No se pudieron cargar las sesiones');
    }
  }

  /**
   * Escribe las sesiones al archivo
   */
  private async writeSessions(sessions: Session[]): Promise<void> {
    await this.ensureDataDir();
    
    try {
      await fs.writeFile(STORAGE_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing sessions:', error);
      throw new Error('No se pudieron guardar las sesiones');
    }
  }

  /**
   * Guarda una nueva sesión o actualiza una existente
   */
  async saveSession(session: Session): Promise<Session> {
    const sessions = await this.readSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    await this.writeSessions(sessions);
    return session;
  }

  /**
   * Obtiene todas las sesiones
   */
  async getAllSessions(): Promise<Session[]> {
    return this.readSessions();
  }

  /**
   * Obtiene una lista resumida de sesiones
   */
  async getSessionList(): Promise<SessionListItem[]> {
    const sessions = await this.getAllSessions();
    
    return sessions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(session => ({
        id: session.id,
        nombre: session.nombre,
        area: session.curriculum.area,
        grado: session.curriculum.grado,
        fecha: session.createdAt.toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }));
  }

  /**
   * Obtiene una sesión por ID
   */
  async getSessionById(id: string): Promise<Session | null> {
    const sessions = await this.readSessions();
    return sessions.find(s => s.id === id) || null;
  }

  /**
   * Elimina una sesión
   */
  async deleteSession(id: string): Promise<boolean> {
    const sessions = await this.readSessions();
    const filtered = sessions.filter(s => s.id !== id);
    
    if (filtered.length === sessions.length) {
      // No se encontró la sesión
      return false;
    }
    
    await this.writeSessions(filtered);
    return true;
  }

  /**
   * Genera un ID único
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storageService = new StorageService();

