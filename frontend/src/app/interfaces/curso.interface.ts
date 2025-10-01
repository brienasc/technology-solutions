export interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  carga_horaria?: number;
  status: 'Ativo' | 'Inativo';
  data_criacao?: string;
  data_atualizacao?: string;
}