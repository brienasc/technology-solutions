export interface CursoCard {
  id: string;
  nome: string;
  descricao: string;
  carga_horaria: number;
  quantidade_itens: number;
  status: boolean;
}

export interface DashboardData {
  cursos: CursoCard[];
  perfil: 'Administrador' | 'Elaborador de Itens';
  total_cursos: number;
}