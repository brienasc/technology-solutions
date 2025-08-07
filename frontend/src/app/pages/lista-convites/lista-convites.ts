// frontend/src/app/components/lista-convites/lista-convites.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa CommonModule e DatePipe
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel

// Importa a interface Invitation para tipagem dos dados
import { Invitation } from '../../interfaces/invitation.interface'; 



@Component({
  selector: 'app-lista-convites', // Seletor HTML para usar este componente
  standalone: true, // Componente autônomo
  imports: [CommonModule, DatePipe, FormsModule], // Módulos e pipes necessários
  templateUrl: './lista-convites.html', // Caminho para o template HTML
  styleUrls: ['./lista-convites.css'] // Caminho para os estilos CSS
})


export class ListaConvitesComponent implements OnInit {
  // Propriedades de entrada (@Input) que recebem dados do componente pai (ConvitesComponent)
  @Input() invitations: Invitation[] = []; // Lista de convites a ser exibida
  @Input() totalItems: number = 0; // Número total de itens (convites)
  @Input() pageSize: number = 10; // Quantidade de itens por página
  @Input() currentPage: number = 1; // Página atual
  
  // Propriedades de filtro e busca (também recebidas do pai, mas usadas com ngModel)
  @Input() statusFilter: string = 'all'; // Valor do filtro de status
  @Input() emailFilter: string = ''; // Valor do filtro de e-mail

  // Eventos de saída (@Output) que emitem dados para o componente pai
  @Output() filterApplied = new EventEmitter<{ status: string; email: string }>(); // Emite quando filtros são aplicados
  @Output() pageChanged = new EventEmitter<number>(); // Emite quando a página é alterada
  @Output() pageSizeChanged = new EventEmitter<number>(); // Emite quando o tamanho da página é alterado
  @Output() viewDetails = new EventEmitter<Invitation>(); // Emite quando detalhes de um convite são solicitados

  // Opções de tamanho de página para o select
  pageSizes = [10, 25, 50, 100];

  constructor() { }

  ngOnInit(): void {
    // Lógica de inicialização do componente, se houver
  }

  /**
   * Navega para a página anterior.
   * Emite o evento 'pageChanged' com o novo número da página.
   */
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChanged.emit(this.currentPage - 1);
    }
  }

  /**
   * Navega para a próxima página.
   * Emite o evento 'pageChanged' com o novo número da página.
   */
  goToNextPage(): void {
    // Verifica se não estamos na última página
    if (this.currentPage < this.totalPages()) {
      this.pageChanged.emit(this.currentPage + 1);
    }
  }

  /**
   * Calcula o número total de páginas com base no total de itens e no tamanho da página.
   * @returns O número total de páginas.
   */
  totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  /**
   * Dispara o evento 'filterApplied' com os valores atuais dos filtros de status e e-mail.
   * Chamado quando o usuário aplica um filtro ou busca.
   */
  applyFilter(): void {
    this.filterApplied.emit({ status: this.statusFilter, email: this.emailFilter });
  }

  /**
   * Dispara o evento 'pageSizeChanged' com o novo tamanho da página selecionado.
   * @param event O evento de mudança do elemento <select>.
   */
  onPageSizeChange(event: any): void {
    this.pageSizeChanged.emit(Number(event.target.value));
  }

  /**
   * Dispara o evento 'viewDetails' com o objeto do convite cujos detalhes foram solicitados.
   * @param invitation O objeto Invitation a ser visualizado.
   */
  onViewDetails(invitation: Invitation): void {
    this.viewDetails.emit(invitation);
  }
}


