// frontend/src/app/components/lista-convites/lista-convites.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Invitation } from '../../interfaces/invitation.interface'; 

@Component({
  selector: 'app-lista-convites',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './lista-convites.html',
  styleUrls: ['./lista-convites.css']
})

export class ListaConvitesComponent implements OnInit {
  // Dados de entrada que virão do componente pai (ConvitesComponent)
  @Input() invitations: Invitation[] = [];
  
  // Propriedades para paginação customizada
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;

  // Propriedades para filtro e busca
  @Input() statusFilter: string = 'all';
  @Input() emailFilter: string = '';

  // Eventos de saída para comunicar com o componente pai
  @Output() filterApplied = new EventEmitter<{ status: string; email: string }>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<Invitation>();

  // Opções de tamanho de página para o paginator customizado
  pageSizes: number[] = [5, 10, 25, 50];

  constructor() { }

  ngOnInit(): void {
  }

  // ============ MÉTODOS DO PAGINATOR CUSTOMIZADO ============

  // Atualizar tamanho da página
  updatePageSize() {
    this.currentPage = 1; // Reset para primeira página
    this.pageSizeChanged.emit(this.pageSize);
    this.pageChanged.emit(this.currentPage);
  }

  // Navegar para página específica
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(this.currentPage);
    }
  }

  // Página anterior
  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
    }
  }

  // Próxima página
  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage);
    }
  }

  // Calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  // Índice inicial dos itens exibidos
  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  // Índice final dos itens exibidos
  getEndIndex(): number {
    const endIndex = this.currentPage * this.pageSize;
    return Math.min(endIndex, this.totalItems);
  }

  /**
   * Dispara o evento 'filterApplied' com os valores atuais dos filtros de status e e-mail.
   */
  applyFilter(): void {
    this.filterApplied.emit({ status: this.statusFilter, email: this.emailFilter });
  }

  /**
   * Dispara o evento 'viewDetails' (mantido caso seja reintroduzido).
   * @param invitation O objeto Invitation a ser visualizado.
   */
  onViewDetails(invitation: Invitation): void {
    this.viewDetails.emit(invitation);
  }
}


