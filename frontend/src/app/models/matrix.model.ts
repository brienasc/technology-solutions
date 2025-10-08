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
