export interface ItemAvaliacao {
  id: string;
  code?: string;
  curso_id?: string;
  curso_nome?: string;
  matriz_id?: string;
  matriz_nome?: string;
  cruzamento_id?: string;
  status?: number | string;
  status_nome?: string;
  dificuldade?: number;
  dificuldade_nome?: string;
  contexto?: string;
  created_at?: string;
  updated_at?: string;
}
