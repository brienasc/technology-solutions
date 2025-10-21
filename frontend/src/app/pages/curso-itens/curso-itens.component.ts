import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';
import { CreateItemModalComponent } from '../../components/create-item-modal/create-item-modal.component';
import { ItemAvaliacao } from '../../models/item-avaliacao.model';
import { CourseItemsService } from '../../services/cursos-itens.service';
import { CursoService } from '../../services/curso.service';
import { ItemViewEditModalComponent } from '../../components/item-view-edit-modal/item-view-edit-modal.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { NotificationService } from '../../services/notification.service';

type DataColumn = { label: string; property: keyof ItemAvaliacao; type?: undefined };
type ActionColumn = { label: string; type: 'action' };
type ColumnDef = DataColumn | ActionColumn;

@Component({
  selector: 'app-curso-itens',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    Header, 
    AccessibilityBarComponent, 
    CreateItemModalComponent,
    ItemViewEditModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './curso-itens.component.html',
  styleUrls: ['./curso-itens.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CursoItensComponent implements OnInit {
  courseId = '';
  courseName = '';
  loading = false;
  items: ItemAvaliacao[] = [];
  searchTerm = '';
  itemsPerPage = 10;
  currentPage = 1;
  showCreateModal = false;
  showViewModal = false;
  selectedItemId = '';
  
  // Modal de confirmação
  showDeleteModal = false;
  itemToDelete: ItemAvaliacao | null = null;
  deleteLoading = false;

  columns: ColumnDef[] = [
    { label: 'Código', property: 'code' },
    { label: 'Matriz', property: 'matriz_nome' },
    { label: 'Status', property: 'status_nome' },
    { label: 'Dificuldade', property: 'dificuldade_nome' },
    { label: 'Ações', type: 'action' }
  ];

  constructor(
    private route: ActivatedRoute,
    private service: CourseItemsService,
    private cursosService: CursoService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCourse();
    this.fetch();
  }

  loadCourse(): void {
    this.cursosService.getById(this.courseId).subscribe({
      next: curso => {
        this.courseName = curso?.nome || '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseName = '';
        this.cdr.markForCheck();
      }
    });
  }

  fetch(): void {
    this.loading = true;
    this.service.getByCurso(this.courseId).subscribe({
      next: data => {
        this.items = data;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.items = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filtered(): ItemAvaliacao[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.items;
    return this.items.filter(i =>
      (i.code || '').toLowerCase().includes(term) ||
      (i.status_nome || '').toLowerCase().includes(term) ||
      (i.dificuldade_nome || '').toLowerCase().includes(term) ||
      (i.matriz_nome || '').toLowerCase().includes(term)
    );
  }

  get totalItems(): number {
    return this.filtered.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get pageItems(): ItemAvaliacao[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filtered.slice(start, start + this.itemsPerPage);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  goToPrevious(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNext(): void {
    this.goToPage(this.currentPage + 1);
  }

  onBuscar(): void {
    this.currentPage = 1;
  }

  onAddItem(): void { 
    this.showCreateModal = true;
  }

  onModalClose(): void {
    this.showCreateModal = false;
  }

  onItemCreated(): void {
    this.fetch();
  }

  onRowAction(action: 'details' | 'delete', row: ItemAvaliacao): void {
    if (action === 'details') this.openItemDetails(row.id);
    else if (action === 'delete') this.confirmDelete(row);
  }

  openItemDetails(id: string): void {
    this.selectedItemId = id;
    this.showViewModal = true;
  }

  onViewModalClose(): void {
    this.showViewModal = false;
    this.selectedItemId = '';
  }

  onItemUpdated(): void {
    this.fetch();
  }

  // Métodos do modal de confirmação
  confirmDelete(item: ItemAvaliacao): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  onConfirmDelete(): void {
    if (!this.itemToDelete) return;
    
    this.deleteLoading = true;
    this.cdr.markForCheck();

    this.service.deleteItem(this.itemToDelete.id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== this.itemToDelete!.id);
        
        // Verificar se precisa voltar uma página
        if (this.getStartIndex() > this.getEndIndex()) {
          this.goToPage(Math.max(1, this.currentPage - 1));
        }
        
        // Mostrar notificação de sucesso
        this.notificationService.success(
          'Item excluído!', 
          `O item "${this.itemToDelete!.code}" foi removido com sucesso.`
        );
        
        // Fechar modal
        this.onCancelDelete();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.deleteLoading = false;
        this.notificationService.error(
          'Erro ao excluir',
          'Não foi possível excluir o item. Tente novamente.'
        );
        this.cdr.markForCheck();
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
    this.deleteLoading = false;
    this.cdr.markForCheck();
  }

  cell(row: ItemAvaliacao, col: ColumnDef): unknown {
    if ('property' in col) return row[col.property] ?? '—';
    return null;
  }

  get data(): ItemAvaliacao[] {
    return this.pageItems;
  }
}
