export interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  carga_horaria?: number;
  status: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
}
