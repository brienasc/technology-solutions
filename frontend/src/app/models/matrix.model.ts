export interface Matrix {
  id: string;
  name: string;
  version?: string;
  courseName: string;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface Category {
  id: string;
  name: string;
  order?: number | null;
  competencies?: Competency[];
}

export interface Competency {
  id: string;
  name: string;
  order?: number | null;
  knowledge?: Knowledge[];
}

export interface Knowledge {
  id: string;
  name: string;
  level?: string | null;
}

export interface Func {
  id: string;
  name: string;
  subfunctions?: Subfunction[];
}

export interface Subfunction {
  id: string;
  name: string;
}

export interface MatrixDetail {
  id: string;
  name: string;
  version: string;
  courseName: string | null;
  validFrom: string | null; // ISO
  validTo: string | null;   // ISO
  categorias: { id: string; nome: string; competencias: { id: string; nome: string }[] }[];
  funcoes: { id: string; nome: string; subfuncoes: { id: string; nome: string }[] }[];
  conhecimentos: { id: string; codigo: number; nome: string; competencias_ids: string[] }[];
  cruzamentos: {
    subfuncao_id: string;
    competencia_id: string;
    conhecimento_id: string;
    conhecimento: { id: string; codigo: number; nome: string };
  }[];
}

export interface ImportMatrixPayload {
  name: string;
  version: string;
  validFrom: string;
  validTo: string;
  courseId: string;
  file: File,
}
