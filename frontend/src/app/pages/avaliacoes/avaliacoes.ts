import { Component, OnInit } from '@angular/core';
import { CommonModule, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalNovaAvaliacaoComponent } from '../../components/modal-nova-avaliacao/modal-nova-avaliacao';
import { ModalDetalhesAvaliacaoComponent } from '../../components/modal-detalhes-avaliacao/modal-detalhes-avaliacao'; // 👈 ADICIONAR
import { AvaliacaoService, Avaliacao } from '../../services/avaliacao.service';
import { CursoService } from '../../services/curso.service';
import { AlertVariant, AlertAction } from '../../models/alert.model';
import { AlertModalComponent } from '../../components/alert/alert.component';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    Header,
    ModalNovaAvaliacaoComponent,
    ModalDetalhesAvaliacaoComponent, 
    AlertModalComponent
  ],
  templateUrl: './avaliacoes.html',
  styleUrls: ['./avaliacoes.css']
})
export class AvaliacoesComponent implements OnInit {
  showModal: boolean = false;
  cursoId: string | null = null;
  cursoNome: string = 'Carregando...';
  carregandoCurso: boolean = false;
  
  avaliacoes: Avaliacao[] = [];
  carregandoAvaliacoes: boolean = false;
  
  showModalDetalhes = false;
  avaliacaoSelecionada: Avaliacao | null = null;

  // Estatísticas
  totalAvaliacoes: number = 0;
  agendadasCount: number = 0;
  emAndamentoCount: number = 0;
  finalizadasCount: number = 0;

  // Filtros e busca
  searchTerm: string = '';
  filtroStatus: string = 'todos';
  filtroTipo: string = 'todos';

  // Alert modal
  showAlert = false;
  alertTitle = '';
  alertMessage = '';
  alertVariant: AlertVariant = 'neutral';
  alertActions: AlertAction[] = [{ id: 'ok', label: 'OK', kind: 'primary', autofocus: true }];

  private lowercasePipe = new LowerCasePipe();

  constructor(
    private route: ActivatedRoute,
    private avaliacaoService: AvaliacaoService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.cursoId = params.get('id');
      if (this.cursoId) {
        this.carregarCursoENome();
        this.carregarAvaliacoes();
      }
    });
  }

  private carregarCursoENome(): void {
    if (!this.cursoId) return;
    
    this.carregandoCurso = true;
    
    this.cursoService.getById(this.cursoId).subscribe({
      next: (curso) => {
        this.cursoNome = curso.nome;
        this.carregandoCurso = false;
      },
      error: (error) => {
        console.error('Erro ao carregar curso:', error);
        this.cursoNome = 'Curso não encontrado';
        this.carregandoCurso = false;
        this.mostrarAlerta('Erro', 'Não foi possível carregar as informações do curso.', 'warning');
      }
    });
  }

  carregarAvaliacoes(): void {
    if (!this.cursoId) return;
    
    console.log('🔍 Carregando avaliações para curso:', this.cursoId);
    this.carregandoAvaliacoes = true;
    
    this.avaliacaoService.getAvaliacoesPorCurso(this.cursoId).subscribe({
      next: (response) => {
        console.log('✅ Resposta da API:', response);
        
        this.avaliacoes = response.data || [];
        this.calcularEstatisticas();
        this.carregandoAvaliacoes = false;
        
        console.log('📋 Avaliações carregadas:', this.avaliacoes.length);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar avaliações:', error);
        this.mostrarAlerta('Erro', 'Falha ao carregar avaliações.', 'warning');
        this.carregandoAvaliacoes = false;
        this.avaliacoes = [];
      }
    });
  }

  private calcularEstatisticas(): void {
    this.totalAvaliacoes = this.avaliacoes.length;
    this.agendadasCount = this.avaliacoes.filter(a => a.status === 'agendada').length;
    this.emAndamentoCount = this.avaliacoes.filter(a => a.status === 'em_andamento').length;
    this.finalizadasCount = this.avaliacoes.filter(a => a.status === 'finalizada').length;
  }

  // Filtros
  aplicarFiltros(): void {
    this.carregarAvaliacoes();
  }

  buscarAvaliacoes(): void {
    this.aplicarFiltros();
  }

  visualizar(avaliacao: Avaliacao): void {
    console.log('🎯 Abrindo modal para:', avaliacao.nome);
    this.avaliacaoSelecionada = avaliacao;
    this.showModalDetalhes = true;
  }

  fecharModalDetalhes(): void {
    this.showModalDetalhes = false;
    this.avaliacaoSelecionada = null;
  }

  editar(avaliacao: Avaliacao): void {
    console.log('Editar:', avaliacao.nome);
    this.mostrarAlerta('Editar', `Editando avaliação: ${avaliacao.nome}`, 'info');
  }

  excluir(avaliacao: Avaliacao): void {
    if (confirm(`Tem certeza que deseja excluir a avaliação "${avaliacao.nome}"?`)) {
      this.avaliacaoService.excluirAvaliacao(avaliacao.id).subscribe({
        next: () => {
          this.mostrarAlerta('Sucesso', 'Avaliação excluída com sucesso!', 'success');
          this.carregarAvaliacoes(); 
        },
        error: (error) => {
          this.mostrarAlerta('Erro', error.message, 'warning');
        }
      });
    }
  }

  relatorio(avaliacao: Avaliacao): void {
    console.log('Relatório:', avaliacao.nome);
    this.mostrarAlerta('Relatório', `Gerando relatório para: ${avaliacao.nome}`, 'info');
  }

  // Modal de nova avaliação
  abrirModalNovaAvaliacao(): void {
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  onAvaliacaoCriada(): void {
    this.fecharModal();
    this.mostrarAlerta('Sucesso', 'Avaliação criada com sucesso!', 'success');
    this.carregarAvaliacoes();
  }

  // Utilitários
  getStatusCssClass(status: string): string {
    const lower = this.lowercasePipe.transform(status);
    return lower.replace(/\s/g, '-').replace(/_/g, '-');
  }

  formatarData(data: string | undefined): string {
    if (!data) return 'Não agendada';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }

  calcularTempo(tempoMinutos: number | undefined): string {
    if (!tempoMinutos) return 'Não definido';
    const horas = Math.floor(tempoMinutos / 60);
    const minutos = tempoMinutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos} min`;
  }

  // Alert modal
  mostrarAlerta(titulo: string, mensagem: string, variante: AlertVariant = 'neutral'): void {
    this.alertTitle = titulo;
    this.alertMessage = mensagem;
    this.alertVariant = variante;
    this.showAlert = true;
  }

  onAlertAction(action: AlertAction): void {
    this.showAlert = false;
  }
  onAlertClosed(): void {
    this.showAlert = false;
  }
}