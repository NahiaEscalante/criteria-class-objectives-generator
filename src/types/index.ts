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

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  url?: string;
}

export interface AiGenerationResponse {
  objectives: LearningObjective[];
  criteria: EvaluationCriterion[];
  resources: Resource[];
  generatedAt: Date;
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


