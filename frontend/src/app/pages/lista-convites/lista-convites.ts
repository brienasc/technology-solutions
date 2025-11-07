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
  
  // Propriedades para paginação (mantidas apenas para compatibilidade com o pai)
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;

  // Propriedades para filtro (mantidas apenas para compatibilidade com o pai)
  @Input() statusFilter: string = 'all';
  @Input() emailFilter: string = '';

  // Eventos de saída para comunicar com o componente pai
  @Output() filterApplied = new EventEmitter<{ status: string; email: string }>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<Invitation>();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Dispara o evento 'viewDetails' (mantido para funcionalidade futura).
   * @param invitation O objeto Invitation a ser visualizado.
   */
  onViewDetails(invitation: Invitation): void {
    this.viewDetails.emit(invitation);
  }
}


