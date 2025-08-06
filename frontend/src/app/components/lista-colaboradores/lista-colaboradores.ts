// frontend/src/app/components/lista-colaboradores/lista-colaboradores.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// Importa CommonModule para diretivas estruturais (*ngIf, *ngFor) e pipes básicos.
import { CommonModule, LowerCasePipe } from '@angular/common'; 
// Importa FormsModule para o two-way data binding [(ngModel)].
import { FormsModule } from '@angular/forms'; 
// Importa HttpClient para fazer requisições HTTP para o backend.
import { HttpClient } from '@angular/common/http'; 
// Importa Observable e 'of' do RxJS para lidar com fluxos de dados assíncronos.
import { Observable, of } from 'rxjs'; 
// Importa operadores RxJS para manipulação de Observables (filtragem, transformação de dados).
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Header } from '../header/header'

// Interface para o modelo de dados do Colaborador.
// Define a estrutura esperada para cada objeto de colaborador.
interface Colaborador {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  status: 'Finalizado' | 'Em Aberto' | 'Vencido'; // Status do convite.
  // Campos opcionais para detalhes adicionais do colaborador (se for o caso).
  celular?: string;
  cep?: string;
  uf?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
  perfil?: string; // Perfil de acesso do colaborador.
}

@Component({
  selector: 'app-lista-colaboradores', // Seletor CSS para usar este componente no HTML.
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule, 
    Header,
    LowerCasePipe 
  ],
  templateUrl: './lista-colaboradores.html', 
  styleUrls: ['./lista-colaboradores.css'] 
})
// Classe do componente ListaColaboradores.
export class ListaColaboradoresComponent implements OnInit {
  // enviar dados (o colaborador selecionado) para o componente pai.
  @Output() viewColaboradorDetails = new EventEmitter<Colaborador>();

  colaboradores: Colaborador[] = []; // Armazena a lista completa de colaboradores.
  filteredColaboradores: Colaborador[] = []; // Lista de colaboradores após aplicar o filtro de pesquisa.
  paginatedColaboradores: Colaborador[] = []; // Lista de colaboradores da página atual.

  loading: boolean = false; // indica se os dados estão sendo carregados.
  searchTerm: string = ''; // Armazena o texto digitado na barra de pesquisa.

  // Propriedades de Paginação.
  currentPage: number = 1; // Página atual exibida.
  itemsPerPage: number = 10; // Número de itens por página.
  totalItems: number = 0; // Total de itens após a filtragem.
  totalPages: number = 1; // Total de páginas disponíveis.

  // Propriedades para o dialog
  showColaboradorDialog: boolean = false;
  selectedColaborador: Colaborador | null = null;

  // Propriedades para controle de acesso
  isAdmin: boolean = false;

  // Propriedades para o dialog de convite
  showInviteDialog: boolean = false;
  inviteEmail: string = '';
  inviteLoading: boolean = false;
  inviteSuccessMessage: string = '';
  inviteErrorMessage: string = '';

  // Construtor do componente: Usado para injetar dependências como HttpClient.
  constructor(private http: HttpClient) { }

  // Método de ciclo de vida: Executado uma vez após a inicialização do componente.
  ngOnInit(): void {
    console.log('ListaColaboradoresComponent inicializado.'); 
    this.loadColaboradores();
    this.checkUserRole(); // Verifica se o usuário é admin
  }

  // Verifica se o usuário logado é administrador
  checkUserRole(): void {
    // MOCK - substituir pela lógica real de verificação
    // this.isAdmin = this.authService.getUserRole() === 'Administrador';
    
    // VERSÃO MOCK PARA TESTE (sempre true para testar)
    this.isAdmin = true; // Altere para false para testar a restrição
    
    console.log('Usuário é admin:', this.isAdmin);
  }

  // Método para carregar os colaboradores do backend.
  loadColaboradores(): void {
    this.loading = true; // Ativa o estado de carregamento.

    // MOCK DE DADOS - Remover quando a API estiver pronta
  const mockColaboradores: Colaborador[] = [
    {
      id: 1,
      nome: 'Maria Silva Santos',
      email: 'maria.silva@empresa.com',
      cpf: '123.456.789-00',
      celular: '(11) 99999-1234',
      perfil: 'Administrador',
      status: 'Finalizado',
      cep: '01234-567',
      uf: 'SP',
      localidade: 'São Paulo',
      bairro: 'Centro',
      logradouro: 'Rua das Flores, 123'
    },
    {
      id: 2,
      nome: 'João Pedro Oliveira',
      email: 'joao.pedro@empresa.com',
      cpf: '987.654.321-00',
      celular: '(11) 88888-5678',
      perfil: 'Gente e Cultura',
      status: 'Finalizado',
      cep: '12345-678',
      uf: 'RJ',
      localidade: 'Rio de Janeiro',
      bairro: 'Copacabana',
      logradouro: 'Av. Atlântica, 456'
    },
    {
      id: 3,
      nome: 'Ana Carolina Ferreira',
      email: 'ana.carolina@empresa.com',
      cpf: '456.789.123-00',
      celular: '(11) 77777-9012',
      perfil: 'Colaborador Comum',
      status: 'Finalizado',
      cep: '23456-789',
      uf: 'MG',
      localidade: 'Belo Horizonte',
      bairro: 'Savassi',
      logradouro: 'Rua da Bahia, 789'
    },
    {
      id: 4,
      nome: 'Carlos Eduardo Lima',
      email: 'carlos.eduardo@empresa.com',
      cpf: '789.123.456-00',
      celular: '(11) 66666-3456',
      perfil: 'Administrador',
      status: 'Finalizado',
      cep: '34567-890',
      uf: 'RS',
      localidade: 'Porto Alegre',
      bairro: 'Moinhos de Vento',
      logradouro: 'Rua Padre Chagas, 321'
    },
    {
      id: 5,
      nome: 'Fernanda Costa Almeida',
      email: 'fernanda.costa@empresa.com',
      cpf: '321.654.987-00',
      celular: '(11) 55555-7890',
      perfil: 'Gente e Cultura',
      status: 'Finalizado',
      cep: '45678-901',
      uf: 'PR',
      localidade: 'Curitiba',
      bairro: 'Batel',
      logradouro: 'Av. Batel, 654'
    },
    {
      id: 6,
      nome: 'Roberto Machado Junior',
      email: 'roberto.machado@empresa.com',
      cpf: '654.321.789-00',
      celular: '(11) 44444-2468',
      perfil: 'Colaborador Comum',
      status: 'Em Aberto',
      cep: '56789-012',
      uf: 'SC',
      localidade: 'Florianópolis',
      bairro: 'Centro',
      logradouro: 'Rua Felipe Schmidt, 987'
    }
  ];

  // Simula delay de requisição (1.5 segundos)
  setTimeout(() => {
    // Filtra colaboradores com status "Finalizado" e ordena alfabeticamente
    const colaboradoresFiltrados = mockColaboradores
      .filter(colaborador => colaborador.status === 'Finalizado')
      .sort((a, b) => a.nome.localeCompare(b.nome));

    this.colaboradores = colaboradoresFiltrados;
    this.totalItems = this.colaboradores.length;
    this.applyFilterAndPaginate();
    this.loading = false;
    
    console.log('✅ Mock de colaboradores carregado:', this.colaboradores.length, 'colaboradores');
  }, 1500);

    // FIM DO MOCK DE DADOS (APAGAR ATÉ AQUI)


    // VOLTAR AQUI: Substituir a  'SUA_URL_DA_API/colaboradores' pela URL real da API de colaboradores.
    // Esperamos que o backend retorne apenas colaboradores com status "Finalizado" e ordenados por nome.
    this.http.get<Colaborador[]>('SUA_URL_DA_API/colaboradores?status=finalizado').pipe(
      map(data => {
        // Mapeia os dados recebidos. Se o backend não ordenar, ordena aqui.
        return data
        .filter(colaborador => colaborador.status === 'Finalizado')
        .sort((a, b) => a.nome.localeCompare(b.nome));
      }),
      catchError(error => {
        console.error('Erro ao carregar colaboradores:', error);
        return of([]); 
      })
    ).subscribe(data => {
      // Quando os dados são recebidos com sucesso:
      this.colaboradores = data; // Armazena a lista completa.
      this.totalItems = this.colaboradores.length; // Atualiza o total de itens.
      this.applyFilterAndPaginate(); // Aplica qualquer filtro de pesquisa e a paginação inicial.
      this.loading = false; // Desativa o estado de carregamento.
    });
  }

  // Aplica o filtro de pesquisa (se houver um termo) e recalcula a paginação.
  applyFilterAndPaginate(): void {
    let tempColaboradores = this.colaboradores;

    // Se o usuário digitou algo na barra de pesquisa, filtra a lista.
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      tempColaboradores = tempColaboradores.filter(colaborador =>
        // Verifica se o termo de pesquisa está presente no nome, e-mail ou CPF do colaborador.
        colaborador.nome.toLowerCase().includes(lowerSearchTerm) ||
        colaborador.email.toLowerCase().includes(lowerSearchTerm) ||
        colaborador.cpf.includes(lowerSearchTerm) 
      );
    }

    this.filteredColaboradores = tempColaboradores; // Atualiza a lista de colaboradores filtrados.
    this.totalItems = this.filteredColaboradores.length; // Atualiza o total de itens filtrados.
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage); // Recalcula o total de páginas.

    // Garante que a página atual seja válida após a filtragem (evita página em branco se o filtro reduzir muito os itens).
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) { // Se não houver itens, volta para a página 1.
      this.currentPage = 1;
    }
    this.paginate(); // Aplica a paginação para a página atual.
  }

  // Aplica a lógica de paginação para exibir apenas os itens da página atual.
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage; // Índice de início da fatia.
    const endIndex = startIndex + this.itemsPerPage; // Índice de fim da fatia.
    this.paginatedColaboradores = this.filteredColaboradores.slice(startIndex, endIndex); // Pega a fatia de colaboradores para a página atual.
  }

  // Navega para a próxima página na paginação.
  nextPage(): void {
    if (this.currentPage < this.totalPages) { // Verifica se não é a última página.
      this.currentPage++; // Incrementa a página atual.
      this.paginate(); // Atualiza os itens paginados.
    }
  }

  // Navega para a página anterior na paginação.
  previousPage(): void {
    if (this.currentPage > 1) { // Verifica se não é a primeira página.
      this.currentPage--; // Decrementa a página atual.
      this.paginate(); // Atualiza os itens paginados.
    }
  }

  // Chamada a cada digitação no campo de pesquisa.
  onSearchChange(): void {
    of(this.searchTerm).pipe(
      debounceTime(300), // Espera 300ms após a última digitação antes de emitir o valor.
                         // Isso evita que a pesquisa seja disparada a cada tecla.
      distinctUntilChanged(), // Só emite o valor se ele for diferente do último valor emitido.
      switchMap(term => {
        // Reinicia a paginação para a primeira página ao pesquisar.
        this.currentPage = 1; 
        this.applyFilterAndPaginate(); // Aplica o filtro e a paginação com o novo termo de pesquisa.
        return of(true); // Retorna um Observable para completar o pipe.
      })
    ).subscribe(); // Assina o Observable para que o fluxo de dados seja executado.
  }

  // Método para exportar os dados da tabela para um arquivo Excel.
/*DESCOMENTAR QUANDO A API ESTIVER PRONTA
  exportToExcel(): void {
    
    console.log('Exportar para Excel clicado. Termo de pesquisa:', this.searchTerm);
    
    // Verificar se há dados para exportar
    if (this.filteredColaboradores.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // Ativar loading durante a exportação
    this.loading = true;
    
    // Preparar parâmetros para enviar ao backend
    const params: any = {
      status: 'Finalizado' // Apenas colaboradores finalizados
    };
    
    // Adicionar termo de pesquisa se houver
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    console.log('Enviando parâmetros para o backend:', params);

    // Chamar o endpoint do backend para gerar e baixar o arquivo Excel
    this.http.get('SUA_URL_DA_API/colaboradores/export', { 
      params: params,
      responseType: 'blob' // Importante: tipo blob para arquivos binários
    }).subscribe({
      next: (response: Blob) => {
        console.log('✅ Arquivo Excel recebido do backend');
        
        // Criar URL temporária para o blob
        const url = window.URL.createObjectURL(response);
        
        // Criar elemento <a> temporário para forçar o download
        const link = document.createElement('a');
        link.href = url;
        link.download = this.generateFileName();
        link.style.display = 'none';
        
        // Adicionar ao DOM, clicar e remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpar URL temporária para liberar memória
        window.URL.revokeObjectURL(url);
        
        this.loading = false;
        console.log(`✅ Download concluído: ${this.filteredColaboradores.length} colaboradores exportados`);
      },
      error: (error) => {
        console.error('❌ Erro ao exportar para Excel:', error);
        this.loading = false;
        
        // Mensagens de erro mais específicas
        if (error.status === 0) {
          alert('Erro de conexão. Verifique se o backend está rodando.');
        } else if (error.status === 404) {
          alert('Endpoint de exportação não encontrado. Verifique a URL da API.');
        } else if (error.status === 500) {
          alert('Erro interno do servidor ao gerar o arquivo Excel.');
        } else {
          alert('Erro ao gerar arquivo Excel. Tente novamente.');
        }
      }
    });
  }

  // Método para gerar nome do arquivo baseado na pesquisa e data
  private generateFileName(): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const searchSuffix = this.searchTerm ? `_filtrado` : '';
    return `colaboradores_${timestamp}${searchSuffix}.xlsx`;
  }

  */

  // VERSÃO TEMPORÁRIA PARA TESTAR COM MOCK
  exportToExcel(): void {
    console.log('Exportar para Excel clicado. Termo de pesquisa:', this.searchTerm);
    
    if (this.filteredColaboradores.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    this.loading = true;
    
    // SIMULAR CHAMADA AO BACKEND (remover quando a API estiver pronta)
    setTimeout(() => {
      // Gerar CSV dos dados filtrados para simular o backend
      const dadosParaExportar = this.filteredColaboradores.map(colaborador => ({
        'Nome': colaborador.nome,
        'E-mail': colaborador.email,
        'CPF': colaborador.cpf,
        'Celular': colaborador.celular || '',
        'Perfil': colaborador.perfil || '',
        'Status': colaborador.status,
        'CEP': colaborador.cep || '',
        'UF': colaborador.uf || '',
        'Cidade': colaborador.localidade || '',
        'Bairro': colaborador.bairro || '',
        'Endereço': colaborador.logradouro || ''
      }));

      const csvContent = this.convertToCSV(dadosParaExportar);
      this.downloadCsvFile(csvContent, this.generateFileName());
      
      this.loading = false;
      console.log(`✅ MOCK: ${this.filteredColaboradores.length} colaboradores exportados`);
    }, 2000); // Simula 2 segundos de processamento no backend
  }

  private generateFileName(): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const searchSuffix = this.searchTerm ? `_filtrado` : '';
    return `colaboradores_${timestamp}${searchSuffix}.xlsx`;
  }

  // Métodos auxiliares para a versão mock
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header] || '';
        const escapedValue = String(value).replace(/"/g, '""');
        return /[",\n\r]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
      }).join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
  }

  private downloadCsvFile(content: string, fileName: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.replace('.xlsx', '.csv'));
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

// MOCK TEMPORÁRIO ACABA AQUI

  // Método para abrir o dialog com os detalhes do colaborador
  openColaboradorDialog(colaborador: Colaborador): void {
    console.log('Abrindo dialog para colaborador:', colaborador);
    this.selectedColaborador = colaborador;
    this.showColaboradorDialog = true;
    // Previne scroll da página quando o modal está aberto
    document.body.style.overflow = 'hidden';
  }

  // Método para fechar o dialog
  closeColaboradorDialog(): void {
    console.log('Fechando dialog do colaborador');
    this.showColaboradorDialog = false;
    this.selectedColaborador = null;
    // Restaura o scroll da página
    document.body.style.overflow = 'auto';
  }

  // Atualizar o método viewDetails para usar o dialog
  viewDetails(colaborador: Colaborador): void {
    console.log('Visualizar detalhes do colaborador:', colaborador);
    this.openColaboradorDialog(colaborador);
    this.viewColaboradorDetails.emit(colaborador); // Mantém a emissão para o pai se necessário
  }

  // Abre o dialog de convite
  openInviteDialog(): void {
    this.showInviteDialog = true;
    this.inviteEmail = '';
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    document.body.style.overflow = 'hidden';
  }

  // Fecha o dialog de convite
  closeInviteDialog(): void {
    this.showInviteDialog = false;
    this.inviteEmail = '';
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.inviteLoading = false;
    document.body.style.overflow = 'auto';
  }

  // Envia o convite
  sendInvite(): void {
    if (!this.inviteEmail || this.inviteLoading) {
      return;
    }

    this.inviteLoading = true;
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';

    // MOCK - substitua pela chamada real da API
    /*
    const inviteData = {
      email: this.inviteEmail
    };

    this.http.post('http://localhost:8000/api/convites', inviteData).subscribe({
      next: (response: any) => {
        this.inviteSuccessMessage = `Convite enviado com sucesso para ${this.inviteEmail}!`;
        this.inviteEmail = '';
        this.inviteLoading = false;
        
        // Fecha o dialog após 2 segundos
        setTimeout(() => {
          this.closeInviteDialog();
        }, 2000);
      },
      error: (error) => {
        this.inviteLoading = false;
        
        if (error.status === 400) {
          this.inviteErrorMessage = 'E-mail inválido ou já possui convite pendente.';
        } else if (error.status === 409) {
          this.inviteErrorMessage = 'Este e-mail já possui um convite ativo.';
        } else if (error.status === 0) {
          this.inviteErrorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
        } else {
          this.inviteErrorMessage = 'Erro ao enviar convite. Tente novamente.';
        }
      }
    });
    */

    // VERSÃO MOCK PARA TESTE
    setTimeout(() => {
      // Simula diferentes cenários para teste
      const random = Math.random();
      
      if (random < 0.7) { // 70% de sucesso
        this.inviteSuccessMessage = `Convite enviado com sucesso para ${this.inviteEmail}!`;
        this.inviteEmail = '';
        
        // Fecha o dialog após 2 segundos
        setTimeout(() => {
          this.closeInviteDialog();
        }, 2000);
      } else if (random < 0.9) { // 20% erro de email duplicado
        this.inviteErrorMessage = 'Este e-mail já possui um convite ativo.';
      } else { // 10% erro genérico
        this.inviteErrorMessage = 'Erro ao enviar convite. Tente novamente.';
      }
      
      this.inviteLoading = false;
    }, 1500); // Simula delay de 1.5 segundos
  }
}