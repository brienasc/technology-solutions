import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  AvaliacaoService, 
  Avaliacao, 
  ItemAvaliacaoDetalhado
} from '../../services/avaliacao.service';

@Component({
  selector: 'app-modal-detalhes-avaliacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalhes-avaliacao.html',
  styleUrls: ['./modal-detalhes-avaliacao.css']
})
export class ModalDetalhesAvaliacaoComponent implements OnInit {
  @Input() avaliacao: Avaliacao | null = null;
  @Output() closeModal = new EventEmitter<void>();

  carregandoItens: boolean = false;
  itens: ItemAvaliacaoDetalhado[] = [];
  itemExpandido: number | null = null;

  // Colunas para a tabela (igual à página de cursos itens)
  columns = [
    { label: 'Código', property: 'code' },
    { label: 'Matriz', property: 'matriz_nome' },
    { label: 'Status', property: 'status_nome' },
    { label: 'Dificuldade', property: 'dificuldade_nome' }
  ];

  constructor(private avaliacaoService: AvaliacaoService) {}

  ngOnInit(): void {
    if (this.avaliacao?.id) {
      this.carregarItensAvaliacao();
    }
  }

  carregarItensAvaliacao(): void {
    if (!this.avaliacao?.id) return;

    this.carregandoItens = true;
    
    this.avaliacaoService.getItensAvaliacaoDetalhados(this.avaliacao.id).subscribe({
      next: (itens: ItemAvaliacaoDetalhado[]) => {
        console.log('📦 Itens detalhados carregados:', itens);
        this.itens = itens;
        this.carregandoItens = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar itens detalhados:', error);
        this.carregandoItens = false;
        this.itens = [];
      }
    });
  }

  alternarItem(index: number): void {
    this.itemExpandido = this.itemExpandido === index ? null : index;
  }

  fecharModal(): void {
    this.closeModal.emit();
  }

  getDificuldadeCor(dificuldade: number): string {
    const cores = {
      1: '#28a745', // Verde - Muito Fácil
      2: '#7cc47c', // Verde claro - Fácil
      3: '#ffc107', // Amarelo - Médio
      4: '#fd7e14', // Laranja - Difícil
      5: '#dc3545'  // Vermelho - Muito Difícil
    };
    return cores[dificuldade as keyof typeof cores] || '#666';
  }

  getStatusCor(status: number): string {
    const cores = {
      0: '#6c757d', // Cinza - Rascunho
      1: '#198754', // Verde - Finalizado
      2: '#0d6efd'  // Azul - Calibrado
    };
    return cores[status as keyof typeof cores] || '#6c757d';
  }

  formatarLetraAlternativa(ordem: number): string {
    return String.fromCharCode(64 + ordem); // 65 = 'A' em ASCII
  }

  // Método para exibir o valor da célula (igual à página de cursos itens)
  cell(row: any, col: any): any {
    return row[col.property] ?? '—';
  }
}