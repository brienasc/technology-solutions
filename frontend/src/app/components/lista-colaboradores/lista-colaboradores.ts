// frontend/src/app/components/lista-colaboradores/lista-colaboradores.ts
import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
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
import { ConvitesService } from '../../services/convite.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Interface para o modelo de dados do Colaborador.
// Define a estrutura esperada para cada objeto de colaborador.
interface Colaborador {
  id: string;
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
    LowerCasePipe,
    MatPaginatorModule,

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

  // Propriedades para o dialog de convite
  showInviteDialog: boolean = false;
  inviteEmail: string = '';
  inviteLoading: boolean = false;
  inviteSuccessMessage: string = '';
  inviteErrorMessage: string = '';

  // Propriedades para controle do modal de convite
  isConvidarModalOpen: boolean = false;

  // Novas propriedades para validação de e-mail
  emailError: string = '';
  isValidEmail: boolean = false;

  // Novas propriedades para alteração de perfil
  isEditingProfile: boolean = false;
  showPasswordField: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  isChangingProfile: boolean = false;
  profileChangeError: string = '';
  profileChangeSuccess: string = '';
  passwordError: string = '';

// NOVAS PROPRIEDADES PARA SELECTS NO MODAL DE CONVITE (APENAS ADICIONAR)
  selectedPerfilConvite: number = 3; // Default: Colaborador Comum
  selectedCursoConvite: number = 0; // Default: nenhum curso selecionado

  // Listas hardcoded APENAS para visual do modal de convite
  perfisConvite = [
    { id: 1, nome: 'Administrador' },
    { id: 2, nome: 'Gente e Cultura' },
    { id: 3, nome: 'Colaborador Comum' }
  ];

  cursosConvite = [
    { id: 1, nome: 'Desenvolvimento Web Full Stack' },
    { id: 2, nome: 'Análise e Desenvolvimento de Sistemas' },
    { id: 3, nome: 'Ciência da Computação' },
    { id: 4, nome: 'Engenharia de Software' },
    { id: 5, nome: 'Tecnologia da Informação' },
    { id: 6, nome: 'Marketing Digital' },
    { id: 7, nome: 'Gestão de Projetos' },
    { id: 8, nome: 'Design UX/UI' }
  ];

  // Lista de perfis disponíveis para alteração de perfil
  perfisDisponiveis = [
    { id: 1, nome: 'Administrador' },
    { id: 2, nome: 'Gente e Cultura' },
    { id: 3, nome: 'Colaborador Comum' }
  ];

  private http = inject(HttpClient);
  private conviteService = inject(ConvitesService);

  // Método de ciclo de vida: Executado uma vez após a inicialização do componente.
  ngOnInit(): void {
    this.loadColaboradores();
  }

  // Método para carregar os colaboradores do backend.
  loadColaboradores(): void {
    this.loading = true;
    
    const apiUrl = 'http://localhost:8080/api/colabs';

    this.http.get<any>(apiUrl).pipe(
      map(response => {
        // A API retorna um objeto com propriedade 'data'
        const colaboradores = response.data.colabs || response;
        
        // Verificar se é array válido
        if (!Array.isArray(colaboradores)) {
          return [];
        }
        
        // Mapear os dados da API para o formato do frontend
        return colaboradores.map((colab: any): Colaborador => {
          return {
            id: colab.id || "",
            nome: colab.nome || 'Nome não informado',
            email: colab.email || 'Email não informado',
            cpf: colab.cpf || 'CPF não informado',
            celular: colab.celular,
            perfil: this.mapearPerfil(colab.perfil_id),
            status: 'Finalizado',
            cep: colab.cep,
            uf: colab.uf,
            localidade: colab.cidade,
            bairro: colab.bairro,
            logradouro: colab.numero ? `${colab.logradouro}, ${colab.numero}` : colab.logradouro
          };
        })
        .filter((colaborador: Colaborador) => colaborador.nome && colaborador.nome !== 'Nome não informado')
        .sort((a: Colaborador, b: Colaborador) => {
          if (!a.nome || !b.nome) return 0;
          return a.nome.localeCompare(b.nome);
        });
      }),
      catchError(error => {
        console.error('Erro ao carregar colaboradores:', error);
        
        if (error.status === 0) {
          alert('❌ Backend não está rodando!');
        } else if (error.status === 404) {
          alert('❌ Rota de colaboradores não encontrada!');
        } else if (error.status === 500) {
          alert('❌ Erro interno do servidor!');
        } else {
          alert(`❌ Erro ${error.status}: ${error.message}`);
        }
        
        return of([]);
      })
    ).subscribe({
      next: (colaboradores) => {
        this.colaboradores = colaboradores;
        this.totalItems = this.colaboradores.length;
        this.applyFilterAndPaginate();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro na subscription:', error);
        this.loading = false;
      }
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
  exportToExcel(): void {
    // Verificar se há dados para exportar
    if (this.filteredColaboradores.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    this.loading = true;
    
    // Preparar parâmetros para enviar ao backend
    const params: any = {};
    
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    // Chamar o endpoint do backend
    this.http.get('http://localhost:8080/api/colabs/export', { 
      params: params,
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => {
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
        
        // Limpar URL temporária
        window.URL.revokeObjectURL(url);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao exportar:', error);
        this.loading = false;
        
        // Se o erro veio como blob (JSON), vamos ler o conteúdo
        if (error.error instanceof Blob && error.error.type === 'application/json') {
          error.error.text().then((errorText: string) => {
            try {
              const errorObj = JSON.parse(errorText);
              alert(`❌ Erro do servidor: ${errorObj.message || errorObj.error}`);
            } catch (e) {
              alert('❌ Erro interno do servidor ao gerar arquivo Excel.');
            }
          });
        } else {
          if (error.status === 0) {
            alert('Erro de conexão. Verifique se o backend está rodando.');
          } else if (error.status === 404) {
            alert('Endpoint de exportação não encontrado.');
          } else if (error.status === 500) {
            alert('Erro interno do servidor ao gerar o arquivo Excel.');
          } else {
            alert('Erro ao gerar arquivo Excel. Tente novamente.');
          }
        }
      }
    });
  }

  // Método para gerar nome do arquivo baseado na pesquisa e data
  private generateFileName(): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const searchSuffix = this.searchTerm && this.searchTerm.trim() ? '_filtrado' : '';
    return `colaboradores_${timestamp}${searchSuffix}.csv`;
  }

  // Método para abrir o dialog com os detalhes do colaborador
  openColaboradorDialog(colaborador: Colaborador): void {
    this.selectedColaborador = colaborador;
    this.showColaboradorDialog = true;
    // Previne scroll da página quando o modal está aberto
    document.body.style.overflow = 'hidden';
  }

  // Método para fechar o dialog
  closeColaboradorDialog(): void {
    this.showColaboradorDialog = false;
    this.selectedColaborador = null;
    //  Limpar estados de edição
    this.resetEditingState();
    // Restaura o scroll da página
    document.body.style.overflow = 'auto';
  }

  // Atualizar o método viewDetails para usar o dialog
  viewDetails(colaborador: Colaborador): void {
    this.openColaboradorDialog(colaborador);
    this.viewColaboradorDetails.emit(colaborador);
  }

  // Abre o dialog de convite
  openInviteDialog(): void {
    this.showInviteDialog = true;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset para Colaborador Comum
    this.selectedCursoConvite = 0; // Reset para nenhum curso
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    document.body.style.overflow = 'hidden';
  }

  // Fecha o dialog de convite
  closeInviteDialog(): void {
    this.showInviteDialog = false;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset
    this.selectedCursoConvite = 0; // Reset
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.inviteLoading = false;
    document.body.style.overflow = 'auto';
  }

  // NOVOS MÉTODOS APENAS PARA OS SELECTS DO MODAL DE CONVITE
  onPerfilConviteChange(event: any): void {
    this.selectedPerfilConvite = +event.target.value;
    console.log('Perfil selecionado no convite:', this.selectedPerfilConvite);
    this.inviteErrorMessage = ''; // Limpar erro quando mudar
  }

  onCursoConviteChange(event: any): void {
    this.selectedCursoConvite = +event.target.value;
    console.log('Curso selecionado no convite:', this.selectedCursoConvite);
    this.inviteErrorMessage = ''; // Limpar erro quando mudar
  }

  // ATUALIZAR APENAS O MÉTODO sendInvite (adicionar validação dos selects)
  async sendInvite(): Promise<void> {
    if (!this.inviteEmail.trim()) {
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    // NOVAS VALIDAÇÕES PARA OS SELECTS
    if (this.selectedPerfilConvite === 0) {
      this.inviteErrorMessage = 'Por favor, selecione um perfil.';
      return;
    }

    if (this.selectedCursoConvite === 0) {
      this.inviteErrorMessage = 'Por favor, selecione um curso.';
      return;
    }

    this.inviteLoading = true;
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';

    try {
      // Verificar se já existe convite em aberto para este email
      const conviteExiste = await this.verificarConviteExistente(this.inviteEmail);
      
      if (conviteExiste) {
        this.inviteLoading = false;
        this.inviteErrorMessage = 'Já existe um convite em aberto para este e-mail. Aguarde a resposta ou cancele o convite anterior.';
        return;
      }

      // ADICIONAR LOG DOS DADOS QUE SERIAM ENVIADOS
      console.log('Dados do convite que seriam enviados:', {
        email: this.inviteEmail.trim(),
        perfil_id: this.selectedPerfilConvite,
        curso_id: this.selectedCursoConvite
      });

      // Se não existe convite em aberto, prosseguir com o envio
      this.conviteService.enviarConvite(this.inviteEmail).subscribe({
        next: (response: any) => {
          this.inviteLoading = false;
          
          if (response.status === 'success') {
            this.inviteSuccessMessage = response.message || 'Convite enviado com sucesso!';
            this.inviteEmail = '';
            this.selectedPerfilConvite = 3; // Reset
            this.selectedCursoConvite = 0; // Reset
            
            setTimeout(() => {
              this.closeInviteDialog();
            }, 2000);
          } else {
            this.inviteErrorMessage = response.message || 'Erro ao enviar convite.';
          }
        },
        error: (error: any) => {
          this.inviteLoading = false;
          
          if (error.status === 400 && error.error?.data) {
            if (error.error.data.email) {
              this.inviteErrorMessage = error.error.data.email[0];
            } else {
              this.inviteErrorMessage = error.error.message || 'Dados inválidos.';
            }
          } else if (error.status === 0) {
            this.inviteErrorMessage = 'Erro de conexão. Verifique se a API está funcionando.';
          } else {
            this.inviteErrorMessage = 'Erro ao enviar convite. Tente novamente.';
          }
        }
      });
    } catch (error) {
      this.inviteLoading = false;
      this.inviteErrorMessage = 'Erro ao verificar convites existentes. Tente novamente.';
    }
  }

  // Abre o modal de convite
  openConvidarModal(): void {
    this.isConvidarModalOpen = true;
    this.novoColaboradorEmail = '';
    document.body.style.overflow = 'hidden';
  }

  // Fecha o modal de convite
  closeConvidarModal(): void {
    this.isConvidarModalOpen = false;
    this.novoColaboradorEmail = '';
    document.body.style.overflow = 'auto';
  }

  novoColaboradorEmail: string = ''; // Novo colaborador a ser convidado (campo de entrada)

  // Método para validar formato do email:
  private validateEmail(email: string): boolean {
    // Validação super rigorosa
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
    // Verificações adicionais
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Não pode começar ou terminar com ponto
    if (email.startsWith('.') || email.endsWith('.')) {
      return false;
    }
    
    // Não pode ter pontos consecutivos
    if (email.includes('..')) {
      return false;
    }
    
    // Domínio não pode começar ou terminar com hífen
    const domain = email.split('@')[1];
    if (domain.startsWith('-') || domain.endsWith('-')) {
      return false;
    }
    
    return true;
  }

  // Método para validação em tempo real:
  onEmailChange(): void {
    const email = this.novoColaboradorEmail.trim();
    
    if (!email) {
      this.emailError = '';
      this.isValidEmail = false;
      return;
    }
    
    if (!this.validateEmail(email)) {
      this.emailError = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.isValidEmail = false;
    } else {
      this.emailError = '';
      this.isValidEmail = true;
    }
  }

  // Método chamado ao submeter o convite
  async onConvidarSubmit(): Promise<void> {
    const email = this.novoColaboradorEmail.trim();
    
    if (!email) {
      this.emailError = 'O e-mail é obrigatório.';
      return;
    }
    
    if (!this.validateEmail(email)) {
      this.emailError = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      return;
    }
    
    this.emailError = '';

    try {
      // Verificar se já existe convite em aberto para este email
      const conviteExiste = await this.verificarConviteExistente(email);
      
      if (conviteExiste) {
        this.emailError = 'Já existe um convite em aberto para este e-mail. Aguarde a resposta ou cancele o convite anterior.';
        return;
      }

      // Se não existe convite em aberto, prosseguir com o envio
      this.conviteService.enviarConvite(email).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            alert(response.message || 'Convite enviado com sucesso!');
            this.novoColaboradorEmail = '';
            this.emailError = '';
            this.closeConvidarModal();
          } else {
            this.emailError = response.message || 'Erro ao enviar convite.';
          }
        },
        error: (error) => {
          if (error.status === 400 && error.error?.data?.email) {
            this.emailError = error.error.data.email[0];
          } else if (error.status === 400) {
            this.emailError = error.error?.message || 'E-mail inválido ou já cadastrado.';
          } else {
            this.emailError = 'Erro ao enviar convite. Tente novamente.';
          }
        }
      });
    } catch (error) {
      this.emailError = 'Erro ao verificar convites existentes. Tente novamente.';
    }
  }

  // Método para mapear ID do perfil para nome
  private mapearPerfil(perfilId: number): string {
    const perfis: { [key: number]: string } = {
      1: 'Administrador',
      2: 'Gente e Cultura',
      3: 'Colaborador Comum'
    };
    
    return perfis[perfilId] || `Perfil ${perfilId}`;
  }

  private async verificarConviteExistente(email: string): Promise<boolean> {
    try {
      const response = await this.http.get<any>('http://localhost:8080/api/convites').toPromise();
      
      if (response.status === 'success' && response.data) {
        // Verificar se já existe convite "Em Aberto" (status_code: 0) para este email
        const conviteExistente = response.data.find((convite: any) => 
          convite.email_colab.toLowerCase() === email.toLowerCase() && 
          convite.status_code === 0
        );
        
        return !!conviteExistente; // Retorna true se encontrou convite em aberto
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar convites existentes:', error);
      return false; // Em caso de erro, permite o envio
    }
  }

  // ==================== NOVOS MÉTODOS PARA ALTERAÇÃO DE PERFIL ====================

  // Verifica se o usuário pode alterar perfis
  canChangeProfile(): boolean {
    // Por enquanto, sempre retorna true para teste visual
    // No futuro: integrar com AuthService quando backend estiver pronto
    return true;
  }

  // Inicia a edição de perfil
  startEditingProfile(): void {
    this.isEditingProfile = true;
    this.resetPasswordFields();
    this.clearMessages();
  }

  // Cancela a edição de perfil
  cancelEditingProfile(): void {
    this.resetEditingState();
  }

  // Método chamado quando o select de perfil muda
  onPerfilChange(event: any): void {
    const novoPerfilId = +event.target.value;
    
    // Verificar se precisa mostrar campo de senha
    this.showPasswordField = (novoPerfilId === 1 || novoPerfilId === 2);
    
    if (!this.showPasswordField) {
      this.resetPasswordFields();
    } else {
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordError = '';
    }
  }

  // Salva a alteração de perfil
  saveProfileChange(): void {
    if (!this.selectedColaborador) return;
    
    const selectElement = document.querySelector('.perfil-select') as HTMLSelectElement;
    if (!selectElement) return;
    
    const novoPerfilId = +selectElement.value;
    const perfilAtualId = this.getPerfilId(this.selectedColaborador.perfil || '');

    // Se não mudou o perfil, apenas cancela
    if (novoPerfilId === perfilAtualId) {
      this.cancelEditingProfile();
      return;
    }

    // Validar senha se necessário
    if (this.showPasswordField) {
      if (!this.validatePassword()) {
        return;
      }
    }

    let payload: { perfil: number; password?: string } = {
      perfil: novoPerfilId
    };

    const colaboradorComum = this.perfisDisponiveis.find(perfil => perfil.nome === 'Colaborador Comum');
    if (!colaboradorComum) {
      return; 
    }

    if (novoPerfilId !== colaboradorComum.id) {
      payload.password = this.newPassword;
    }
    
    const apiUrl = `http://localhost:8080/api/colabs/${this.selectedColaborador.id}`;
    this.http.put(apiUrl, payload).subscribe({
      next: (resposta) => {
        if (this.selectedColaborador) {
          this.selectedColaborador.perfil = this.mapearPerfilPorId(novoPerfilId)
        }
        
        this.profileChangeSuccess = 'Perfil atualizado com sucesso!';
        this.isChangingProfile = false;
        this.resetEditingState();
      },
      error: (error) => {
        console.error('Erro ao alterar perfil', error);
      }
    });

  }

  // Valida os campos de senha
  private validatePassword(): boolean {
    if (!this.newPassword) {
      this.passwordError = 'A senha é obrigatória para este perfil.';
      return false;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'A senha deve ter pelo menos 6 caracteres.';
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'As senhas não coincidem.';
      return false;
    }

    this.passwordError = '';
    return true;
  }

  // SIMULAÇÃO - Aplica mudança apenas no frontend (sem backend)
  private simulateProfileChange(novoPerfilId: number): void {
    if (!this.selectedColaborador) return;

    this.isChangingProfile = true;
    this.clearMessages();

    // Simular delay de 1 segundo (como se fosse uma chamada de API)
    setTimeout(() => {
      try {
        // Atualizar o perfil localmente
        const novoPerfilNome = this.mapearPerfilPorId(novoPerfilId);
        
        // Atualizar na lista de colaboradores
        const index = this.colaboradores.findIndex(c => c.id === this.selectedColaborador!.id);
        if (index !== -1) {
          this.colaboradores[index].perfil = novoPerfilNome;
        }
        
        // Atualizar no modal
        if (this.selectedColaborador) {
          this.selectedColaborador.perfil = novoPerfilNome;
        }
        
        this.profileChangeSuccess = 'Perfil atualizado com sucesso! (Simulação)';
        this.isChangingProfile = false;
        this.resetEditingState();
        
        // Reaplica filtros para atualizar a tabela
        this.applyFilterAndPaginate();
        
        // Limpar mensagem após 3 segundos
        setTimeout(() => {
          this.profileChangeSuccess = '';
        }, 3000);
        
      } catch (error) {
        this.isChangingProfile = false;
        this.profileChangeError = 'Erro na simulação. Tente novamente.';
      }
    }, 1000); // Simula 1 segundo de loading
  }

  // Método para obter perfis permitidos
  getPerfisPermitidos(): { id: number, nome: string }[] {
    // Simulação - definir perfil do usuário logado hardcoded
    // No futuro: pegar de AuthService quando backend estiver pronto
    const userProfile = 'Administrador'; // ou 'Gente e Cultura' para testar
    
    if (userProfile === 'Administrador') {
      return this.perfisDisponiveis; // Pode alterar todos
    } else if (userProfile === 'Gente e Cultura') {
      return this.perfisDisponiveis.filter(p => p.id !== 1); // Não pode criar Administrador
    } else {
      return []; // Colaborador comum não pode alterar perfis
    }
  }

  // Método público para obter ID do perfil pelo nome
  getPerfilId(perfilNome: string): number {
    if (!perfilNome) return 3;
    
    const perfil = this.perfisDisponiveis.find(p => 
      p.nome.toLowerCase() === perfilNome.toLowerCase()
    );
    return perfil ? perfil.id : 3;
  }

  // Novo método para mapear ID para nome (diferente do existente)
  private mapearPerfilPorId(perfilId: number): string {
    const perfil = this.perfisDisponiveis.find(p => p.id === perfilId);
    return perfil ? perfil.nome : 'Colaborador Comum';
  }

  // Reseta o estado de edição
  private resetEditingState(): void {
    this.isEditingProfile = false;
    this.showPasswordField = false;
    this.resetPasswordFields();
    this.clearMessages();
  }

  // Reseta os campos de senha
  private resetPasswordFields(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  // Limpa as mensagens de feedback
  private clearMessages(): void {
    this.profileChangeError = '';
    this.profileChangeSuccess = '';
  }

  
  updatePaginatedColaboradores() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedColaboradores = this.filteredColaboradores.slice(startIndex, endIndex);
  }

  handlePageEvent(event: PageEvent) {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1; // pageIndex é 0-based
    this.updatePaginatedColaboradores();
  }

  // Atualizar apenas o método closeColaboradorDialog para limpar estado de edição
  // closeColaboradorDialog(): void {
  //   this.showColaboradorDialog = false;
  //   this.selectedColaborador = null;
  //   // Limpar estados de edição
  //   this.resetEditingState();
  //   // Restaura o scroll da página
  //   document.body.style.overflow = 'auto';
  // }
}