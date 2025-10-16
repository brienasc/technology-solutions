import { Component, OnInit, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, CursoCard } from '../../interfaces/dashboard.interface';
import { Header } from '../../components/header/header';
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';
import { CursoModalComponent } from '../../components/curso-modal/curso-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    AccessibilityBarComponent,
    CursoModalComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dashboardData: DashboardData | null = null;
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  filteredCursos: CursoCard[] = [];
  hasAssociatedCursos: boolean = false;
  showEmptyStateForElaborador: boolean = false;
  
  // Modal
  selectedCurso: CursoCard | null = null;
  showModal: boolean = false;
  
  // Filtros e Visualização
  statusFilter: 'todos' | 'ativo' | 'inativo' = 'todos';
  viewMode: 'grid' | 'lista' = 'lista';
  
  // Tema e acessibilidade
  isDarkTheme: boolean = false;
  currentFontSize: number = 16;
  isHighContrast: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.loadThemeSettings();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.applyInitialStyles();
  }

  private loadThemeSettings(): void {
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.currentFontSize = parseInt(localStorage.getItem('fontSize') || '16');
    this.isHighContrast = localStorage.getItem('highContrast') === 'true';
    
    this.applyThemeClass();
    this.applyFontSize();
    this.applyHighContrast();
  }

  private applyInitialStyles(): void {

  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('Dashboard data received:', data);
        this.dashboardData = data;

        if (this.isElaborador()) {
          this.hasAssociatedCursos = data.cursos.length > 0;
          this.showEmptyStateForElaborador = !this.hasAssociatedCursos;
        }

        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard:', error);
        this.error = 'Erro ao carregar dados do dashboard. Tente novamente.';
        this.loading = false;
        
        if (error.status === 401) {
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  shouldShowFilters(): boolean {
    return this.isAdmin() || (this.isElaborador() && this.hasAssociatedCursos);
  }

  getWelcomeMessage(): string {
    if (this.isAdmin()) {
      return 'Painel Administrativo - Gerencie todos os cursos';
    } else if (this.isElaborador()) {
      return this.hasAssociatedCursos 
        ? 'Seus Cursos Associados - Elabore itens para os cursos atribuídos'
        : 'Aguardando Atribuição - Nenhum curso foi associado ao seu perfil ainda';
    }
    return 'Dashboard';
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.dashboardData) return;

    let filtered = this.dashboardData.cursos;

    if (this.statusFilter === 'ativo') {
      filtered = filtered.filter(curso => curso.status === true);
    } else if (this.statusFilter === 'inativo') {
      filtered = filtered.filter(curso => curso.status === false);
    }

    if (this.searchTerm.trim() !== '') {
      filtered = filtered.filter(curso =>
        curso.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        curso.descricao.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredCursos = filtered;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'lista' : 'grid';
  }

  onCursoClick(curso: CursoCard): void {
    this.selectedCurso = curso;
    this.showModal = true;
  }

  onCloseModal(): void {
    this.showModal = false;
    this.selectedCurso = null;
  }

  isAdmin(): boolean {
    return this.dashboardData?.perfil === 'Administrador';
  }

  isElaborador(): boolean {
    return this.dashboardData?.perfil === 'Elaborador de Itens';
  }

  trackByCursoFn(index: number, curso: CursoCard): string {
    return curso.id;
  }

  // Métodos de tema e acessibilidade
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyThemeClass();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  increaseFontSize(): void {
    if (this.currentFontSize < 24) {
      this.currentFontSize += 2;
      this.applyFontSize();
      localStorage.setItem('fontSize', this.currentFontSize.toString());
    }
  }

  decreaseFontSize(): void {
    if (this.currentFontSize > 12) {
      this.currentFontSize -= 2;
      this.applyFontSize();
      localStorage.setItem('fontSize', this.currentFontSize.toString());
    }
  }

  private applyFontSize(): void {
    document.documentElement.style.setProperty('--base-font-size', `${this.currentFontSize}px`);
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    this.applyHighContrast();
    localStorage.setItem('highContrast', this.isHighContrast.toString());
  }

  private applyHighContrast(): void {
    if (this.isHighContrast) {
      this.renderer.addClass(document.body, 'high-contrast');
    } else {
      this.renderer.removeClass(document.body, 'high-contrast');
    }
  }
}