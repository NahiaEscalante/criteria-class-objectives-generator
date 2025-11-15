// Tipos compartidos para el backend (compatibles con los del frontend)

export interface CurriculumSelection {
  area: string;
  competencia: string;
  capacidad: string;
  desempeno: string;
  grado: string;
}

export interface ClassInformation {
  producto: string;
  evidencia: string;
  contexto: string;
  objetivo?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

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

