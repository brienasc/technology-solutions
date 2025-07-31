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

  // Construtor do componente: Usado para injetar dependências como HttpClient.
  constructor(private http: HttpClient) { }

  // Método de ciclo de vida: Executado uma vez após a inicialização do componente.
  ngOnInit(): void {
    console.log('ListaColaboradoresComponent inicializado.'); 
    this.loadColaboradores(); 
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


  // Método para visualizar detalhes de um colaborador.
  // Emite um evento 'viewColaboradorDetails' para o componente pai (MenuGerencialComponent),
  // passando os dados do colaborador selecionado.
  viewDetails(colaborador: Colaborador): void {
    console.log('Visualizar detalhes do colaborador:', colaborador);
    this.viewColaboradorDetails.emit(colaborador); // Notifica o pai para abrir o modal de detalhes.
  }
}