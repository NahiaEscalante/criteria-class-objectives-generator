import type { Session, SessionListItem } from "@/types";

const STORAGE_KEY = "criteria_sessions";

export const storageService = {
  // Guardar una nueva sesión
  saveSession(session: Session): void {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex((s) => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving session:", error);
      throw new Error("No se pudo guardar la sesión");
    }
  },

  // Obtener todas las sesiones
  getAllSessions(): Session[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const sessions = JSON.parse(data) as Session[];
      // Convertir fechas de string a Date
      return sessions.map((session) => ({
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
    } catch (error) {
      console.error("Error loading sessions:", error);
      return [];
    }
  },

  // Obtener lista de sesiones (resumen)
  getSessionList(): SessionListItem[] {
    const sessions = this.getAllSessions();
    return sessions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((session) => ({
        id: session.id,
        nombre: session.nombre,
        area: session.curriculum.area,
        grado: session.curriculum.grado,
        fecha: session.createdAt.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));
  },

  // Obtener una sesión por ID
  getSessionById(id: string): Session | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  // Eliminar una sesión
  deleteSession(id: string): void {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting session:", error);
      throw new Error("No se pudo eliminar la sesión");
    }
  },

  // Generar un ID único
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};

