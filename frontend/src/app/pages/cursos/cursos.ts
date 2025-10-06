// cursos.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CursoService, CursosIndex } from '../../services/curso.service';
import { Curso } from '../../interfaces/curso.interface';
import { Header } from '../../components/header/header';
import { AccessibilityBarComponent } from "../../components/accessibility-bar/accessibility-bar";

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, AccessibilityBarComponent],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit, AfterViewInit {

  // Dados vindos da API
  cursos: Curso[] = [];
  filteredCursos: Curso[] = [];   // mantém filtro de status no cliente (opcional)
  paginatedCursos: Curso[] = [];  // exibição atual (já vem paginado da API)

  // Filtros e busca
  statusFilter: string = 'all';
  searchTerm: string = '';

  // Paginação (servidor)
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  lastPage: number = 1;

  // Loading & mensagens
  loading = false;
  showCursoDialog = false;
  isEditMode = false;
  cursoForm: Partial<Curso> = {};
  cursoLoading = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  successMessageText = '';
  errorMessageText = '';
  formErrors: any = {};

  // Somente para UI (mantive suas labels)
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
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'class') {
          setTimeout(() => this.applyDarkThemeToSelects(), 10);
        }
      });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // ============ CARREGAMENTO DE DADOS ============


  loadCursos(): void {
    this.loading = true;
    const statusBool = this.statusFilterToBool();

    this.cursoService.getCursos(this.currentPage, this.itemsPerPage, this.searchTerm, statusBool)
      .subscribe({
        next: (res: CursosIndex) => {
          this.cursos = res.cursos;
          this.paginatedCursos = res.cursos;
          this.currentPage = res.currentPage;
          this.itemsPerPage = res.perPage;
          this.totalItems = res.total;
          this.lastPage = res.lastPage;
          this.loading = false;
        },
        error: () => {
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao carregar cursos. Tente novamente.';
          this.loading = false;
        }
      });
  }


  private applyStatusFilter(list: Curso[]): Curso[] {
    if (this.statusFilter === 'all') return list;

    return list.filter(c =>
      (this.statusFilter === 'Ativo' && !!c.status) ||
      (this.statusFilter === 'Inativo' && !c.status)
    );
  }

  private statusFilterToBool(): boolean | undefined {
    if (this.statusFilter === 'Ativo') return true;
    if (this.statusFilter === 'Inativo') return false;
    return undefined; // 'all' -> sem filtro
  }

  // ============ EVENTOS/FILTROS ============

  onModalidadeFilterChange(): void {
    this.onStatusFilterChange();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadCursos();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadCursos();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadCursos();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.loadCursos();
    }
  }
  goToPrevious(): void { if (this.currentPage > 1) { this.currentPage--; this.loadCursos(); } }
  goToNext(): void { if (this.currentPage < this.lastPage) { this.currentPage++; this.loadCursos(); } }

  // ============ MODAL DE CURSO ============

  openCursoDialog(curso?: Curso): void {
    this.isEditMode = !!curso;

    const statusLabel = curso
      ? (curso.status ? 'Ativo' : 'Inativo')
      : 'Ativo';

    this.cursoForm = curso ? { ...curso, status: statusLabel as any } : {
      nome: '',
      descricao: '',
      carga_horaria: 0,
      status: 'Ativo' as any
    };

    this.showCursoDialog = true;
    this.clearMessages();
    this.formErrors = {};
    document.body.style.overflow = 'hidden';

    setTimeout(() => this.applyDarkThemeToSelects(), 50);
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

  private statusToBool(val: any): boolean {
    // aceita 'Ativo'/'Inativo' ou boolean
    if (typeof val === 'boolean') return val;
    return String(val).toLowerCase() === 'ativo' || val === '1' || val === 1;
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
      status: this.statusToBool(this.cursoForm.status), // ← envia boolean
    };

    if (this.isEditMode && this.cursoForm.id) {
      this.cursoService.updateCurso(this.cursoForm.id, cursoData).subscribe({
        next: () => {
          this.cursoLoading = false;
          this.showSuccessMessage = true;
          this.successMessageText = 'Curso atualizado com sucesso!';
          this.loadCursos();
          setTimeout(() => this.closeCursoDialog(), 1500);
        },
        error: () => {
          this.cursoLoading = false;
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao atualizar curso. Tente novamente.';
        }
      });
    } else {
      this.cursoService.createCurso(cursoData).subscribe({
        next: () => {
          this.cursoLoading = false;
          this.showSuccessMessage = true;
          this.successMessageText = 'Curso criado com sucesso!';
          this.loadCursos();
          setTimeout(() => this.closeCursoDialog(), 1500);
        },
        error: () => {
          this.cursoLoading = false;
          this.showErrorMessage = true;
          this.errorMessageText = 'Erro ao criar curso. Tente novamente.';
        }
      });
    }
  }

  deleteCurso(curso: Curso): void {
    if (!confirm(`Tem certeza que deseja deletar o curso "${curso.nome}"?`)) return;

    this.cursoService.deleteCurso(curso.id).subscribe({
      next: () => {
        // DELETE 204 não tem corpo; tratamos como sucesso direto
        this.showSuccessMessage = true;
        this.successMessageText = 'Curso deletado com sucesso!';
        this.loadCursos();
        setTimeout(() => this.clearMessages(), 2000);
      },
      error: () => {
        this.showErrorMessage = true;
        this.errorMessageText = 'Erro ao deletar curso. Tente novamente.';
      }
    });
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

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    if (this.totalItems === 0) return 0;
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
  }
}

