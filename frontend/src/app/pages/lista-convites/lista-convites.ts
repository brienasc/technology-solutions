// frontend/src/app/components/lista-convites/lista-convites.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa CommonModule e DatePipe
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Importa a interface Invitation para tipagem dos dados
import { Invitation } from '../../interfaces/invitation.interface'; 



@Component({
  selector: 'app-lista-convites', // Seletor HTML para usar este componente
  standalone: true, // Componente autônomo
  imports: [CommonModule, DatePipe, FormsModule, MatPaginatorModule], // Módulos e pipes necessários
  templateUrl: './lista-convites.html', // Caminho para o template HTML
  styleUrls: ['./lista-convites.css'] // Caminho para os estilos CSS
})


export class ListaConvitesComponent implements OnInit {
  // Dados de entrada que virão do componente pai (ConvitesComponent)
  @Input() invitations: Invitation[] = [];
  
  // Propriedades para paginação (adaptadas para MatPaginator)
  @Input() totalItems: number = 0; // totalItems do pai será 'length' no paginator
  @Input() pageSize: number = 10; // pageSize do pai
  @Input() currentPage: number = 1; // currentPage do pai (pageIndex no paginator)

  // Propriedades para filtro e busca
  @Input() statusFilter: string = 'all';
  @Input() emailFilter: string = '';

  // Eventos de saída para comunicar com o componente pai
  @Output() filterApplied = new EventEmitter<{ status: string; email: string }>();
  @Output() pageChanged = new EventEmitter<number>(); // Emite apenas o novo número da página
  @Output() pageSizeChanged = new EventEmitter<number>(); // Emite apenas o novo tamanho da página
  @Output() viewDetails = new EventEmitter<Invitation>(); // Mantido caso precise no futuro

  // Opções de tamanho de página para o MatPaginator
  pageSizes: number[] = [5, 10, 25, 50]; // Opções de itens por página

  constructor() { }

  ngOnInit(): void {
    // Lógica de inicialização do componente
  }

  /**
   * Manipula o evento de mudança de página ou tamanho de página do MatPaginator.
   * @param event O objeto PageEvent do MatPaginator.
   */
  handlePageEvent(event: PageEvent): void {
    const newPageSize = event.pageSize;
    const newPageIndex = event.pageIndex + 1; // pageIndex é base 0, currentPage é base 1

    if (this.pageSize !== newPageSize) {
      this.pageSizeChanged.emit(newPageSize);
    }
    if (this.currentPage !== newPageIndex) {
      this.pageChanged.emit(newPageIndex);
    }
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


