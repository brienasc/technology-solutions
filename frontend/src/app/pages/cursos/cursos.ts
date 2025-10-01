import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../interfaces/curso.interface';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit, AfterViewInit {
  
  // Arrays de dados
  cursos: Curso[] = [];
  filteredCursos: Curso[] = [];
  paginatedCursos: Curso[] = [];

  // Filtros e busca
  statusFilter: string = 'all';
  searchTerm: string = '';

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Loading
  loading: boolean = false;

  // Propriedades do modal de curso
  showCursoDialog: boolean = false;
  isEditMode: boolean = false;
  cursoForm: Partial<Curso> = {};
  cursoLoading: boolean = false;
  
  // Propriedades para mensagens estilizadas
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessageText: string = '';
  errorMessageText: string = '';

  // Propriedades para validação
  formErrors: any = {};

  statusOptions = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' }
  ];

  constructor(
    private router: Router,
    private cursoService: CursoService
  ) { }

  ngOnInit(): void {
    this.loadCursos();
  }

  ngAfterViewInit(): void {
    // Observa mudanças no tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTimeout(() => {
            this.applyDarkThemeToSelects();
          }, 10);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // ============ CARREGAMENTO DE DADOS ============

  loadCursos(): void {
    this.loading = true;
    
    this.cursoService.getCursos(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.cursos = response.data.cursos;
          this.applyFiltersAndPaginate();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cursos:', err);
        this.showErrorMessage = true;
        this.errorMessageText = 'Erro ao carregar cursos. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // ============ FILTROS E PAGINAÇÃO ============

  applyFiltersAndPaginate(): void {
    let tempCursos = this.cursos;

    // Filtro por status
    if (this.statusFilter !== 'all') {
      tempCursos = tempCursos.filter(curso => curso.status === this.statusFilter);
    }

    // Filtro por pesquisa
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      tempCursos = tempCursos.filter(curso =>
        curso.nome.toLowerCase().includes(searchLower) ||
        curso.descricao?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCursos = tempCursos;
    this.totalItems = this.filteredCursos.length;

    // Ajusta página atual se necessário
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    this.updatePaginatedData();
  }

  // ============ PAGINAÇÃO ============

  // Navegar para página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  // Página anterior
  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  // Próxima página
  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  // Calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredCursos.length / this.itemsPerPage);
  }

  // Índice inicial dos itens exibidos
  getStartIndex(): number {
    if (this.filteredCursos.length === 0) return 0;
    return ((this.currentPage - 1) * this.itemsPerPage) + 1;
  }

  // Índice final dos itens exibidos
  getEndIndex(): number {
    const endIndex = this.currentPage * this.itemsPerPage;
    return Math.min(endIndex, this.filteredCursos.length);
  }

  // Atualizar dados paginados
  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCursos = this.filteredCursos.slice(startIndex, endIndex);
  }

  // Alterar tamanho da página
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  // ============ EVENTOS DE FILTRO ============

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPaginate();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPaginate();
  }

  onModalidadeFilterChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPaginate();
  }

  // ============ MODAL DE CURSO ============

  openCursoDialog(curso?: Curso): void {
    this.isEditMode = !!curso;
    this.cursoForm = curso ? { ...curso } : {
      nome: '',
      descricao: '',
      carga_horaria: 0,
      status: 'Ativo'
    };
    
    this.showCursoDialog = true;
    this.clearMessages();
    this.formErrors = {};
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      this.applyDarkThemeToSelects();
    }, 50);
  }

  closeCursoDialog(): void {
    this.showCursoDialog = false;
    this.isEditMode = false;
    this.cursoForm = {};
    this.formErrors = {};
    this.clearMessages();
    this.cursoLoading = false;
    document.body.style.overflow = 'auto';
  }

  // ============ VALIDAÇÃO E CRUD ============

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.cursoForm.nome?.trim()) {
      this.formErrors.nome = 'Nome do curso é obrigatório';
      isValid = false;
    }

    if (!this.cursoForm.status) {
      this.formErrors.status = 'Status é obrigatório';
      isValid = false;
    }

    if (this.cursoForm.carga_horaria && this.cursoForm.carga_horaria <= 0) {
      this.formErrors.carga_horaria = 'Carga horária deve ser maior que zero';
      isValid = false;
    }

    return isValid;
  }

  saveCurso(): void {
    if (!this.validateForm()) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Por favor, corrija os erros no formulário.';
      return;
    }

    this.cursoLoading = true;
    this.clearMessages();

    const cursoData = {
      nome: this.cursoForm.nome!.trim(),
      descricao: this.cursoForm.descricao?.trim() || '',
      carga_horaria: this.cursoForm.carga_horaria || 0,
      status: this.cursoForm.status as 'Ativo' | 'Inativo'
    };

    if (this.isEditMode && this.cursoForm.id) {
      // Atualizar curso existente
      this.cursoService.updateCurso(this.cursoForm.id, cursoData).subscribe({
        next: (response) => {
          this.cursoLoading = false;
          if (response.status === 'success') {
            this.showSuccessMessage = true;
            this.successMessageText = response.message || 'Curso atualizado com sucesso!';
            this.loadCursos();
            setTimeout(() => this.closeCursoDialog(), 2000);
          } else {
            this.showErrorMessage = true;
            this.errorMessageText = response.message || 'Erro ao atualizar curso.';
          }
        },
        error: (error) => {
          this.cursoLoading = false;
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao atualizar curso. Tente novamente.';
        }
      });
    } else {
      // Criar novo curso
      this.cursoService.createCurso(cursoData).subscribe({
        next: (response) => {
          this.cursoLoading = false;
          if (response.status === 'success') {
            this.showSuccessMessage = true;
            this.successMessageText = response.message || 'Curso criado com sucesso!';
            this.loadCursos();
            setTimeout(() => this.closeCursoDialog(), 2000);
          } else {
            this.showErrorMessage = true;
            this.errorMessageText = response.message || 'Erro ao criar curso.';
          }
        },
        error: (error) => {
          this.cursoLoading = false;
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao criar curso. Tente novamente.';
        }
      });
    }
  }

  deleteCurso(curso: Curso): void {
    if (confirm(`Tem certeza que deseja deletar o curso "${curso.nome}"?`)) {
      this.cursoService.deleteCurso(curso.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.showSuccessMessage = true;
            this.successMessageText = response.message || 'Curso deletado com sucesso!';
            this.loadCursos();
            setTimeout(() => this.clearMessages(), 3000);
          } else {
            this.showErrorMessage = true;
            this.errorMessageText = response.message || 'Erro ao deletar curso.';
          }
        },
        error: (error) => {
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao deletar curso. Tente novamente.';
        }
      });
    }
  }

  // ============ UTILITÁRIOS ============

  clearMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.successMessageText = '';
    this.errorMessageText = '';
  }

  private applyDarkThemeToSelects(): void {
    const selects = document.querySelectorAll('.modal-dialog select, .filters-container select') as NodeListOf<HTMLSelectElement>;
    const inputs = document.querySelectorAll('.modal-dialog input, .filters-container input') as NodeListOf<HTMLInputElement>;
    
    if (document.body.classList.contains('dark-theme')) {
      [...selects, ...inputs].forEach(element => {
        element.style.backgroundColor = '#2d3748';
        element.style.color = '#e2e8f0';
        element.style.borderColor = '#4a5568';
        
        if (element.tagName === 'SELECT') {
          const options = element.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
          options.forEach(option => {
            option.style.backgroundColor = '#2d3748';
            option.style.color = '#e2e8f0';
          });
        }
      });
    } else {
      [...selects, ...inputs].forEach(element => {
        element.style.backgroundColor = '';
        element.style.color = '';
        element.style.borderColor = '';
        
        if (element.tagName === 'SELECT') {
          const options = element.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
          options.forEach(option => {
            option.style.backgroundColor = '';
            option.style.color = '';
          });
        }
      });
    }
  }

  exportToExcel(): void {
    this.showSuccessMessage = true;
    this.successMessageText = 'Exportação de cursos em desenvolvimento...';
    setTimeout(() => this.clearMessages(), 3000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}