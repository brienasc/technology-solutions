// frontend/src/app/components/lista-colaboradores/lista-colaboradores.ts
import { Component, OnInit, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Header } from '../header/header';

// ⭐ IMPORTAR TIPOS E SERVICES NECESSÁRIOS
import { Curso } from '../../interfaces/curso.interface'; // ⭐ CAMINHO CORRETO
import { CursoService } from '../../services/curso.service'; // ⭐ CAMINHO CORRETO

import { environment } from '../../../environments/environment';

// ⭐ INTERFACES ATUALIZADAS COM CURSOS
interface CursoColaborador {
  id: string;
  nome: string;
  status: boolean;
  descricao?: string;
  carga_horaria?: number;
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  status: 'Finalizado' | 'Em Aberto' | 'Vencido';
  celular?: string;
  cep?: string;
  uf?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
  perfil?: string;
  cursos?: CursoColaborador[];
}

interface Perfil {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-lista-colaboradores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    LowerCasePipe
  ],
  templateUrl: './lista-colaboradores.html',
  styleUrls: ['./lista-colaboradores.css']
})
export class ListaColaboradoresComponent implements OnInit {
  @Output() viewColaboradorDetails = new EventEmitter<Colaborador>();

  // ========== PROPRIEDADES PRINCIPAIS ==========

  private readonly baseUrl = environment.apiUrl;

  colaboradores: Colaborador[] = [];
  filteredColaboradores: Colaborador[] = [];
  paginatedColaboradores: Colaborador[] = [];

  loading: boolean = false;
  searchTerm: string = '';

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Dialog de colaborador
  showColaboradorDialog: boolean = false;
  selectedColaborador: Colaborador | null = null;

  // Alteração de perfil
  isEditingProfile: boolean = false;
  showPasswordField: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  isChangingProfile: boolean = false;
  profileChangeError: string = '';
  profileChangeSuccess: string = '';
  passwordError: string = '';

  // PROPRIEDADES PARA CURSOS
  isManagingCursos: boolean = false;
  selectedColaboradorCursos: CursoColaborador[] = [];
  availableCursos: CursoColaborador[] = [];
  selectedCursoToAdd: string = '';
  cursosLoading: boolean = false;
  cursosError: string = '';
  cursosSuccess: string = '';

  // PROPRIEDADES PARA TODOS OS CURSOS
  todosOsCursos: Curso[] = [];
  cursoSearchTerm: string = '';
  showCursoDropdown: boolean = false;
  filteredCursosDisponiveis: Curso[] = [];

  // Dados para perfis
  perfisDisponiveis: Perfil[] = [
    { id: 1, nome: 'Administrador' },
    { id: 2, nome: 'Elaborador de Itens' },
  ];

  // INJETAR DEPENDÊNCIAS
  private http = inject(HttpClient);
  private cursoService = inject(CursoService);

  // ========== MÉTODOS DO CICLO DE VIDA ==========
  ngOnInit(): void {
    this.loadColaboradores();
    this.loadAllCursos();
  }

  // ========== MÉTODOS DE CARREGAMENTO ==========
  loadColaboradores(): void {
    this.loading = true;

    const apiUrl = `${this.baseUrl}/colabs`;

    this.http.get<any>(apiUrl).pipe(
      map(response => {
        const colaboradores = response.data.colabs || response;

        if (!Array.isArray(colaboradores)) {
          return [];
        }

        return colaboradores.map((colab: any): Colaborador => {
          return {
            id: colab.id || "",
            nome: colab.nome || 'Nome não informado',
            email: colab.email || 'Email não informado',
            cpf: colab.cpf || 'CPF não informado',
            celular: colab.celular,
            perfil: this.mapearPerfil(colab.perfil_id),
            status: 'Finalizado',
            cep: colab.cep,
            uf: colab.uf,
            localidade: colab.cidade,
            bairro: colab.bairro,
            logradouro: colab.numero ? `${colab.logradouro}, ${colab.numero}` : colab.logradouro,
            cursos: colab.cursos ? colab.cursos.map((curso: any) => ({
              id: curso.id,
              nome: curso.nome,
              status: curso.status,
              descricao: curso.descricao,
              carga_horaria: curso.carga_horaria
            })) : []
          };
        })
          .filter((colaborador: Colaborador) => colaborador.nome && colaborador.nome !== 'Nome não informado')
          .sort((a: Colaborador, b: Colaborador) => {
            if (!a.nome || !b.nome) return 0;
            return a.nome.localeCompare(b.nome);
          });
      }),
      catchError(error => {
        console.error('Erro ao carregar colaboradores:', error);
        this.handleApiError(error);
        return of([]);
      })
    ).subscribe({
      next: (colaboradores) => {
        this.colaboradores = colaboradores;
        this.totalItems = this.colaboradores.length;
        this.applyFilterAndPaginate();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro na subscription:', error);
        this.loading = false;
      }
    });
  }

  // MÉTODO PARA CARREGAR TODOS OS CURSOS
  private loadAllCursos(): void {
    console.log('Carregando todos os cursos...');

    this.cursoService.getAllCursos().subscribe({
      next: (cursos: Curso[]) => {
        this.todosOsCursos = cursos;
        console.log('Todos os cursos carregados:', this.todosOsCursos.length, this.todosOsCursos);
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.todosOsCursos = [];

        // FALLBACK: Tentar com o método original
        this.cursoService.getCursos(1, 1000).subscribe({
          next: (response) => {
            this.todosOsCursos = response.cursos;
            console.log('Cursos carregados via fallback:', this.todosOsCursos.length);
          },
          error: (fallbackError) => {
            console.error('Erro no fallback:', fallbackError);
          }
        });
      }
    });
  }

  // ========== MÉTODOS DE CURSOS ==========

  getCursosDisponiveis(): Curso[] {
    if (!this.todosOsCursos || this.todosOsCursos.length === 0) {
      console.log('Nenhum curso carregado ainda');
      return [];
    }

    if (!this.selectedColaboradorCursos) {
      console.log('Retornando todos os cursos (sem colaborador selecionado)');
      return this.todosOsCursos;
    }

    // Filtrar cursos que não estão associados ao colaborador
    const cursosAssociados = this.selectedColaboradorCursos.map(c => c.id);
    const cursosDisponiveis = this.todosOsCursos.filter(curso =>
      !cursosAssociados.includes(curso.id)
    );

    console.log('Cursos disponíveis:', cursosDisponiveis.length, 'de', this.todosOsCursos.length);
    return cursosDisponiveis;
  }

  onCursoSearch(): void {
    const cursosDisponiveis = this.getCursosDisponiveis();
    console.log('Pesquisando cursos. Termo:', this.cursoSearchTerm, 'Disponíveis:', cursosDisponiveis.length);

    if (!this.cursoSearchTerm.trim()) {
      this.filteredCursosDisponiveis = cursosDisponiveis;
    } else {
      this.filteredCursosDisponiveis = cursosDisponiveis.filter(curso =>
        curso.nome.toLowerCase().includes(this.cursoSearchTerm.toLowerCase())
      );
    }

    console.log('Cursos filtrados:', this.filteredCursosDisponiveis.length);
    this.showCursoDropdown = true;
  }

  onCursoInputFocus(): void {
    console.log('Input focado, mostrando dropdown');
    this.onCursoSearch();
    this.showCursoDropdown = true;
  }

  selectCurso(curso: Curso): void {
    console.log('Curso selecionado:', curso);
    this.selectedCursoToAdd = curso.id;
    this.cursoSearchTerm = curso.nome;
    this.showCursoDropdown = false;
  }

  startManagingCursos(): void {
    console.log('Iniciando gerenciamento de cursos');
    this.isManagingCursos = true;
    this.selectedColaboradorCursos = [...(this.selectedColaborador?.cursos || [])];
    this.cursosSuccess = '';
    this.cursosError = '';
    this.cursoSearchTerm = '';
    this.selectedCursoToAdd = '';

    // Garantir que todos os cursos estão carregados
    if (this.todosOsCursos.length === 0) {
      console.log('Recarregando cursos...');
      this.loadAllCursos();
    }

    // Aguardar um momento para os cursos carregarem
    setTimeout(() => {
      this.filteredCursosDisponiveis = this.getCursosDisponiveis();
      console.log('Cursos disponíveis para associar:', this.filteredCursosDisponiveis.length);
    }, 500);
  }

  cancelManagingCursos(): void {
    this.isManagingCursos = false;
    this.selectedColaboradorCursos = [];
    this.selectedCursoToAdd = '';
    this.cursosError = '';
    this.cursosSuccess = '';
    this.cursoSearchTerm = '';
    this.showCursoDropdown = false;
  }

  saveManagingCursos(): void {
    if (!this.selectedColaborador) return;

    this.cursosLoading = true;

    const cursoIds = this.selectedColaboradorCursos.map(c => c.id);
    const requestData = { curso_ids: cursoIds };

    this.http.put(`${this.baseUrl}/colabs/${this.selectedColaborador.id}/cursos`, requestData)
      .subscribe({
        next: (response: any) => {
          if (this.selectedColaborador) {
            this.selectedColaborador.cursos = [...this.selectedColaboradorCursos];
          }

          const index = this.colaboradores.findIndex(c => c.id === this.selectedColaborador!.id);
          if (index !== -1) {
            this.colaboradores[index].cursos = [...this.selectedColaboradorCursos];
          }

          this.cursosSuccess = 'Cursos atualizados com sucesso!';
          this.cursosLoading = false;
          this.isManagingCursos = false;

          setTimeout(() => {
            this.cursosSuccess = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Erro ao salvar cursos:', error);
          this.cursosLoading = false;
          this.cursosError = 'Erro ao salvar alterações. Tente novamente.';
        }
      });
  }

  addCursoToColaborador(): void {
    if (!this.selectedCursoToAdd) {
      this.cursosError = 'Selecione um curso para adicionar.';
      return;
    }

    // BUSCAR CURSO NA LISTA COMPLETA
    const curso = this.todosOsCursos.find(c => c.id === this.selectedCursoToAdd);
    if (!curso) {
      this.cursosError = 'Curso não encontrado.';
      return;
    }

    const jaAssociado = this.selectedColaboradorCursos.find(c => c.id === this.selectedCursoToAdd);
    if (jaAssociado) {
      this.cursosError = 'Este colaborador já está associado a este curso.';
      return;
    }

    // ADICIONAR DIRETAMENTE À LISTA (SEM API)
    const novoCurso: CursoColaborador = {
      id: curso.id,
      nome: curso.nome,
      status: curso.status,
      descricao: curso.descricao,
      carga_horaria: curso.carga_horaria
    };

    this.selectedColaboradorCursos.push(novoCurso);
    this.selectedCursoToAdd = '';
    this.cursoSearchTerm = '';
    this.cursosSuccess = 'Curso associado com sucesso! Clique em "Salvar Alterações" para confirmar.';

    // Atualizar lista filtrada
    this.filteredCursosDisponiveis = this.getCursosDisponiveis();

    setTimeout(() => {
      this.cursosSuccess = '';
    }, 3000);
  }

  removeCursoFromColaborador(cursoId: string): void {
    this.selectedColaboradorCursos = this.selectedColaboradorCursos.filter(c => c.id !== cursoId);
    this.cursosSuccess = 'Curso removido! Clique em "Salvar Alterações" para confirmar.';

    // Atualizar lista filtrada
    this.filteredCursosDisponiveis = this.getCursosDisponiveis();

    setTimeout(() => {
      this.cursosSuccess = '';
    }, 3000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.curso-select-container')) {
      this.showCursoDropdown = false;
    }
  }

  // ========== MÉTODOS DE FILTRO E PAGINAÇÃO ==========
  applyFilterAndPaginate(): void {
    let tempColaboradores = this.colaboradores;

    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      tempColaboradores = tempColaboradores.filter(colaborador =>
        colaborador.nome.toLowerCase().includes(lowerSearchTerm) ||
        colaborador.email.toLowerCase().includes(lowerSearchTerm) ||
        colaborador.cpf.includes(lowerSearchTerm)
      );
    }

    this.filteredColaboradores = tempColaboradores;
    this.totalItems = this.filteredColaboradores.length;

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedColaboradores = this.filteredColaboradores.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    of(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.currentPage = 1;
        this.applyFilterAndPaginate();
        return of(true);
      })
    ).subscribe();
  }

  // ========== MÉTODOS DE MODAL ==========
  openColaboradorDialog(colaborador: Colaborador): void {
    this.selectedColaborador = colaborador;
    this.showColaboradorDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeColaboradorDialog(): void {
    this.showColaboradorDialog = false;
    this.selectedColaborador = null;
    this.resetEditingState();
    document.body.style.overflow = 'auto';
  }

  viewDetails(colaborador: Colaborador): void {
    this.openColaboradorDialog(colaborador);
    this.viewColaboradorDetails.emit(colaborador);
  }

  // ========== MÉTODOS DE PERFIL ==========
  canChangeProfile(): boolean {
    return true;
  }

  startEditingProfile(): void {
    this.isEditingProfile = true;
    this.resetPasswordFields();
    this.clearMessages();
  }

  cancelEditingProfile(): void {
    this.resetEditingState();
  }

  onPerfilChange(event: any): void {
    const novoPerfilId = +event.target.value;

    this.showPasswordField = false;
    this.resetPasswordFields();
    this.clearMessages(); this.passwordError = '';
  }

  saveProfileChange(): void {
    if (!this.selectedColaborador) return;

    const selectElement = document.querySelector('.perfil-select') as HTMLSelectElement;
    if (!selectElement) return;

    const novoPerfilId = +selectElement.value;
    const perfilAtualId = this.getPerfilId(this.selectedColaborador.perfil || '');

    if (novoPerfilId === perfilAtualId) {
      this.cancelEditingProfile();
      return;
    }

    this.isChangingProfile = true;
    this.clearMessages();

    const updateData = { perfil: novoPerfilId };

    this.http.put(`${this.baseUrl}/colabs/${this.selectedColaborador.id}`, updateData)
      .subscribe({
        next: (response: any) => {
          const novoPerfilNome = this.mapearPerfilPorId(novoPerfilId);

          const index = this.colaboradores.findIndex(c => c.id === this.selectedColaborador!.id);
          if (index !== -1) {
            this.colaboradores[index].perfil = novoPerfilNome;
          }

          if (this.selectedColaborador) {
            this.selectedColaborador.perfil = novoPerfilNome;
          }

          this.profileChangeSuccess = 'Perfil atualizado com sucesso!';
          this.isChangingProfile = false;
          this.resetEditingState();
          this.applyFilterAndPaginate();

          setTimeout(() => {
            this.profileChangeSuccess = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Erro ao alterar perfil:', error);
          this.isChangingProfile = false;
          this.profileChangeError = 'Erro ao alterar perfil. Tente novamente.';
        }
      });
  }

  private validatePassword(): boolean {
    this.passwordError = '';
    return true;
  }

  getPerfisPermitidos(): Perfil[] {
    return this.perfisDisponiveis;
  }

  getPerfilId(perfilNome: string): number {
    const perfil = this.perfisDisponiveis.find(p => p.nome === perfilNome);
    return perfil ? perfil.id : 1;
  }

  private mapearPerfilPorId(perfilId: number): string {
    return this.mapearPerfil(perfilId);
  }

  private resetEditingState(): void {
    this.isEditingProfile = false;
    this.isManagingCursos = false;
    this.showPasswordField = false;
    this.resetPasswordFields();
    this.clearMessages();
  }

  private resetPasswordFields(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  private clearMessages(): void {
    this.profileChangeError = '';
    this.profileChangeSuccess = '';
    this.cursosError = '';
    this.cursosSuccess = '';
  }

  // ========== MÉTODOS DE EXPORTAÇÃO ==========
  exportToExcel(): void {
    this.loading = true;

    try {
      this.applyFilterAndPaginate();

      let dadosParaExportar: Colaborador[] = [];

      if (this.searchTerm && this.searchTerm.trim()) {
        if (this.filteredColaboradores.length > 0) {
          dadosParaExportar = this.filteredColaboradores;
        } else if (this.paginatedColaboradores.length > 0) {
          dadosParaExportar = this.paginatedColaboradores;
        } else {
          dadosParaExportar = this.filtrarManualmente();
        }
      } else {
        dadosParaExportar = this.colaboradores;
      }

      if (dadosParaExportar.length === 0) {
        this.loading = false;
        alert('❌ Nenhum colaborador encontrado para exportar.');
        return;
      }

      this.gerarEBaixarCSV(dadosParaExportar);

    } catch (error) {
      this.loading = false;
      alert('❌ Erro ao exportar dados.');
    }
  }

  private filtrarManualmente(): Colaborador[] {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      return this.colaboradores;
    }

    const termo = this.searchTerm.toLowerCase().trim();

    return this.colaboradores.filter(colaborador =>
      (colaborador.nome && colaborador.nome.toLowerCase().includes(termo)) ||
      (colaborador.email && colaborador.email.toLowerCase().includes(termo)) ||
      (colaborador.cpf && colaborador.cpf.includes(termo)) ||
      (colaborador.celular && colaborador.celular.includes(termo))
    );
  }

  private gerarEBaixarCSV(colaboradores: Colaborador[]): void {
    try {
      const cabecalho = [
        'Nome',
        'Email',
        'CPF',
        'Celular',
        'Perfil',
        'CEP',
        'Estado',
        'Cidade',
        'Bairro',
        'Endereço'
      ];

      const linhas = colaboradores.map(colab => [
        colab.nome || '',
        colab.email || '',
        colab.cpf || '',
        colab.celular || '',
        colab.perfil || '',
        colab.cep || '',
        colab.uf || '',
        colab.localidade || '',
        colab.bairro || '',
        colab.logradouro || ''
      ]);

      const todasLinhas = [cabecalho, ...linhas];

      const csvContent = todasLinhas
        .map(linha =>
          linha.map(campo => this.limparCampoCSV(campo)).join(';')
        )
        .join('\n');

      const csvFinal = '\uFEFF' + csvContent;

      const blob = new Blob([csvFinal], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = this.gerarNomeArquivo();
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.loading = false;

      const filtroInfo = this.searchTerm ? ` (filtro: "${this.searchTerm}")` : '';
      alert(`✅ CSV baixado com sucesso! ${colaboradores.length
        } registros${filtroInfo} `);

    } catch (error) {
      this.loading = false;
      alert('❌ Erro ao gerar arquivo CSV.');
    }
  }

  private limparCampoCSV(campo: any): string {
    if (campo == null || campo === undefined) {
      return '';
    }

    let valor = String(campo).trim();
    valor = valor.replace(/[\r\n]/g, ' ');

    if (valor.includes(';') || valor.includes(',') || valor.includes('"')) {
      valor = valor.replace(/"/g, '""');
      valor = `"${valor}"`;
    }

    return valor;
  }

  private gerarNomeArquivo(): string {
    const agora = new Date();
    const data = agora.toISOString().slice(0, 10);
    const hora = agora.toTimeString().slice(0, 8).replace(/:/g, '-');

    let nome = `colaboradores_${data}_${hora} `;

    if (this.searchTerm && this.searchTerm.trim()) {
      const filtro = this.searchTerm.trim()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 15);
      nome += `_filtro_${filtro} `;
    }

    return `${nome}.csv`;
  }

  // ========== MÉTODOS AUXILIARES ==========
  trackByColaborador(index: number, colaborador: Colaborador): string {
    return colaborador.id;
  }

  private mapearPerfil(perfilId: number): string {
    const perfis: { [key: number]: string } = {
      1: 'Administrador',
      2: 'Elaborador de Itens',
    };
    return perfis[perfilId] || `Perfil ${perfilId} `;
  }

  private handleApiError(error: any): void {
    if (error.status === 0) {
      alert('❌ Backend não está rodando!');
    } else if (error.status === 404) {
      alert('❌ Rota não encontrada!');
    } else if (error.status === 500) {
      alert('❌ Erro interno do servidor!');
    } else {
      alert(`❌ Erro ${error.status}: ${error.message} `);
    }
  }

  // ========== MÉTODOS DE PAGINAÇÃO ==========
  updateItemsPerPage() {
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return ((this.currentPage - 1) * this.itemsPerPage) + 1;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.itemsPerPage;
    return Math.min(endIndex, this.totalItems);
  }
}
