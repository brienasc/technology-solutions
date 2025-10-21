import { Component, OnInit } from '@angular/core';
import { CommonModule, LowerCasePipe } from '@angular/common'; // Inclui LowerCasePipe
import { ActivatedRoute } from '@angular/router';

// Importe o Modal de Criação de Avaliação (você vai criá-lo na próxima seção)
import { ModalNovaAvaliacaoComponent } from '../../components/modal-nova-avaliacao/modal-nova-avaliacao';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [
    CommonModule, 
    ModalNovaAvaliacaoComponent // Torna o modal de criação disponível
  ],
  templateUrl: './avaliacoes.html', 
  styleUrls: ['./avaliacoes.css'] // Certifique-se de criar este arquivo
})
export class AvaliacoesComponent implements OnInit {
  // Estado para controlar a exibição do modal de nova avaliação
  showModal: boolean = false;
  
  // Armazena o ID do curso da URL
  cursoId: string | null = null;
  cursoNome: string = 'Curso Carregando...'; // Mock para exibir no título

  // Lista mockada de avaliações (para simular a tela 111111.jpg)
  avaliacoes = [
    { nome: 'Avaliação de HTML e CSS', data: '24/10/2025', tempo: '120 min', questoes: 30, alunos: 45, status: 'Agendadas', tipo: 'Prova' },
    { nome: 'Simulado de JavaScript', data: '19/10/2025', tempo: '90 min', questoes: 25, alunos: 42, status: 'Em Andamento', tipo: 'Simulado' },
    { nome: 'Atividade de React', data: '14/10/2025', tempo: '60 min', questoes: 15, alunos: 45, status: 'Finalizadas', tipo: 'Atividade' },
  ];

  // Instancia o pipe LowerCasePipe para uso em métodos de classe
  private lowercasePipe = new LowerCasePipe();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Captura o ID do curso da URL (necessário para a lógica)
    this.route.paramMap.subscribe(params => {
      this.cursoId = params.get('id');
      // **AQUI você faria a chamada ao serviço para buscar o nome do curso e as avaliações**
      if (this.cursoId) {
         this.cursoNome = `ID ${this.cursoId}`; // Exemplo de uso do ID
      }
    });
  }
  
  /**
   * Mapeia o status da avaliação para um nome de classe CSS válido.
   * Por exemplo: "Em Andamento" -> "em-andamento"
   * @param status O status original da avaliação.
   * @returns O nome da classe CSS.
   */
  getStatusCssClass(status: string): string {
    // 1. Converte para minúsculas usando o pipe injetado ou a string nativa
    const lower = this.lowercasePipe.transform(status);
    // 2. Substitui todos os espaços por hífens.
    return lower.replace(/\s/g, '-');
  }
  
  // Abre o modal de criação de nova avaliação
  abrirModalNovaAvaliacao(): void {
    this.showModal = true;
  }
  
  // Fecha o modal de criação de nova avaliação (chamado pelo EventEmitter do modal)
  fecharModal(): void {
    this.showModal = false;
  }

  // Métodos de Ação (Mock para botões)
  visualizar(avaliacao: any): void { console.log('Visualizar:', avaliacao.nome); }
  editar(avaliacao: any): void { console.log('Editar:', avaliacao.nome); }
  excluir(avaliacao: any): void { console.log('Excluir:', avaliacao.nome); }
  relatorio(avaliacao: any): void { console.log('Relatório:', avaliacao.nome); }
}
