// ===== CURRICULUM TYPES =====

export interface CurriculumSelection {
  area: string;
  competencia: string;
  capacidad: string;
  desempeno: string;
  grado: string;
}

// ===== CLASS INFORMATION TYPES =====

export interface ClassInformation {
  producto: string;
  evidencia: string;
  contexto: string;
  objetivo?: string;
}

// ===== FILE UPLOAD TYPES =====

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

// ===== AI GENERATION TYPES =====

export interface AiGenerationRequest {
  curriculum: CurriculumSelection;
  classInfo: ClassInformation;
  fileId?: string;
}

export interface LearningObjective {
  id: string;
  text: string;
  order: number;
}

export interface EvaluationCriterion {
  id: string;
  text: string;
  order: number;
}

export type ResourceType = 'video' | 'audio' | 'image';
export type ResourceStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  url?: string;                    // URL del recurso generado (cuando esté listo)
  status?: ResourceStatus;         // Estado de generación
  thumbnail?: string;               // Miniatura para videos
  duration?: number;               // Duración en segundos (videos/audios)
  error?: string;                  // Mensaje de error si falla la generación
  progress?: number;               // Progreso de generación (0-100)
}

export interface AiGenerationResponse {
  objectives: LearningObjective[];
  criteria: EvaluationCriterion[];
  resources: Resource[];
  generatedAt: Date;
  generationId?: string;           // ID para rastrear generación asíncrona
  resourcesGenerating?: boolean;   // Indica si los recursos se están generando en background
}

// ===== SESSION TYPES =====

export interface Session {
  id: string;
  nombre: string;
  curriculum: CurriculumSelection;
  classInfo: ClassInformation;
  file?: UploadedFile;
  generation: AiGenerationResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionListItem {
  id: string;
  nombre: string;
  area: string;
  grado: string;
  fecha: string;
}

// ===== EXPORT TYPES =====

export interface ExportRequest {
  sessionId: string;
  format: 'pdf' | 'docx';
}

// ===== CURRICULUM DATA TYPES =====

export interface CurriculumArea {
  id: string;
  nombre: string;
  competencias: CurriculumCompetencia[];
}

export interface CurriculumCompetencia {
  id: string;
  nombre: string;
  capacidades: CurriculumCapacidad[];
}

export interface CurriculumCapacidad {
  id: string;
  nombre: string;
  desempenos: CurriculumDesempeno[];
}

export interface CurriculumDesempeno {
  id: string;
  descripcion: string;
  grados: string[];
}

// ===== MATERIAL GENERATION TYPES =====

export type MaterialType = 'rubrica' | 'ejercicios' | 'guia' | 'ejemplos';

export interface MaterialGenerationRequest {
  criteria: EvaluationCriterion[];
  curriculum: CurriculumSelection;
  classInfo: ClassInformation;
  materialType: MaterialType;
}

export interface MaterialGenerationResponse {
  material: string; // Markdown content
  materialType: MaterialType;
  generatedAt: Date;
}

