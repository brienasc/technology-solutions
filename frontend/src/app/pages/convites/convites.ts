// frontend/src/app/components/lista-convites/lista-convites.component.ts

import { Component, OnInit, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { InvitationService } from '../../services/invitation.service'; 
import { Invitation } from '../../interfaces/invitation.interface'; 
//  Importa o componente filho >>
import { ListaConvitesComponent } from '../lista-convites/lista-convites'; 
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-convites',
  standalone: true,
  imports: [CommonModule, ListaConvitesComponent, FormsModule, Header],
  templateUrl: './convites.html', // Caminho para o template HTML
  styleUrls: ['./convites.css'] // Caminho para os estilos CSS
})

export class ConvitesComponent implements OnInit, AfterViewInit {

  invitations: Invitation[] = [];
  loading: boolean = false;
  
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

  statusFilter: string = 'all';
  emailFilter: string = '';

    // Propriedades para o modal de convite 
  showInviteDialog: boolean = false;
  inviteEmail: string = '';
  inviteLoading: boolean = false;
  inviteSuccessMessage: string = '';
  inviteErrorMessage: string = '';
  isValidEmail: boolean = false;

  // PROPRIEDADES PARA OS SELECTS DO MODAL DE CONVITE
  selectedPerfilConvite: number = 3; // Default: Colaborador Comum
  selectedCursoConvite: number = 0; // Default: nenhum curso selecionado

  // Listas hardcoded para os selects
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

  // Novas propriedades para validação de e-mail mais rigorosa
  emailError: string = '';

  // Propriedades para controle do modal de convite
  isConvidarModalOpen: boolean = false;
  novoColaboradorEmail: string = ''; // Para compatibilidade

  // ADICIONAR estas propriedades após as existentes (não substituir):
  // Propriedades para mensagens estilizadas (igual ao lista-colaboradores)
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessageText: string = '';
  errorMessageText: string = '';

  constructor( 
    private renderer: Renderer2, 
    private el: ElementRef, 
    private router: Router, 
    private invitationService: InvitationService,
    private http: HttpClient // ADICIONAR esta linha
  ) { }

  ngOnInit(): void {
    this.loadInvitations();
     // Carrega o tema salvo no localStorage ao iniciar o componente
    // this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    // this.applyThemeClass();
  }
  //  Método para alternar o tema >>
  // toggleTheme(): void {
  //   this.isDarkTheme = !this.isDarkTheme; // Inverte o estado do tema
  //   this.applyThemeClass(); // Aplica a classe CSS correspondente
  //   localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Salva a preferência
  // }

  // //  Método privado para aplicar/remover a classe de tema no body >>
  // private applyThemeClass(): void {
  //   if (this.isDarkTheme) {
  //     this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
  //   } else {
  //     this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
  //   }
  // }


  loadInvitations(): void {
    this.loading = true;
    this.invitationService.getInvitations(this.currentPage, this.pageSize, this.statusFilter, this.emailFilter).subscribe({
      next: (response) => {
        this.invitations = response.data.invitations;

        this.totalItems = response.data.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar convites:', err);
        alert('Erro ao carregar convites. Por favor, tente novamente.');
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage = newPage;
      this.loadInvitations();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadInvitations();
  }

  onFilterApplied(filters: { status: string; email: string }): void {
    this.statusFilter = filters.status;
    this.emailFilter = filters.email;
    this.currentPage = 1;
    this.loadInvitations();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
  

  onCreateNewInvite(): void {
    this.openInviteDialog();
  }

  private applyDarkThemeToSelects(): void {
    // Seleciona todos os selects e inputs do modal
    const selects = document.querySelectorAll('.modal-dialog select') as NodeListOf<HTMLSelectElement>;
    const emailInputs = document.querySelectorAll('.modal-dialog input[type="email"]') as NodeListOf<HTMLInputElement>;
    
    if (document.body.classList.contains('dark-theme')) {
      // TEMA ESCURO - Aplicar estilos escuros
      selects.forEach(select => {
        select.style.backgroundColor = '#2d3748';
        select.style.color = '#e2e8f0';
        select.style.borderColor = '#4a5568';
        
        const options = select.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
        options.forEach(option => {
          option.style.backgroundColor = '#2d3748';
          option.style.color = '#e2e8f0';
        });
        
        // Event listeners para manter o estilo
        select.addEventListener('change', () => {
          if (document.body.classList.contains('dark-theme')) {
            select.style.backgroundColor = '#2d3748';
            select.style.color = '#e2e8f0';
          }
        });
        
        select.addEventListener('focus', () => {
          if (document.body.classList.contains('dark-theme')) {
            const opts = select.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
            opts.forEach(opt => {
              opt.style.backgroundColor = '#2d3748';
              opt.style.color = '#e2e8f0';
            });
          }
        });
      });

      // Aplicar estilos escuros aos inputs de email
      emailInputs.forEach(input => {
        input.style.backgroundColor = '#2d3748';
        input.style.color = '#e2e8f0';
        input.style.borderColor = '#4a5568';
      });
      
    } else {
      // TEMA CLARO
      selects.forEach(select => {
        select.style.backgroundColor = '';
        select.style.color = '';
        select.style.borderColor = '';
        
        const options = select.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
        options.forEach(option => {
          option.style.backgroundColor = '';
          option.style.color = '';
        });
      });

      // Limpar estilos dos inputs de email
      emailInputs.forEach(input => {
        input.style.backgroundColor = '';
        input.style.color = '';
        input.style.borderColor = '';
      });
    }
}

  private validateEmail(email: string): boolean {
    // Validação super rigorosa igual ao lista-colaboradores
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

  onEmailChange(): void {
    const email = this.inviteEmail.trim();
    
    if (!email) {
      this.inviteErrorMessage = '';
      this.emailError = '';
      this.showErrorMessage = false;
      this.errorMessageText = '';
      this.isValidEmail = false;
      return;
    }
    
    if (!this.validateEmail(email)) {
      this.showErrorMessage = false; // Não mostrar erro durante digitação
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.emailError = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.isValidEmail = false;
    } else {
      this.inviteErrorMessage = '';
      this.emailError = '';
      this.showErrorMessage = false;
      this.errorMessageText = '';
      this.isValidEmail = true;
    }
  }

  // Métodos para os selects
  onPerfilConviteChange(event: any): void {
    this.selectedPerfilConvite = +event.target.value;
    console.log('Perfil selecionado no convite:', this.selectedPerfilConvite);
    this.inviteErrorMessage = ''; // Limpar erro quando mudar
    this.emailError = '';
    this.showErrorMessage = false;
    this.errorMessageText = '';
  }

  onCursoConviteChange(event: any): void {
    this.selectedCursoConvite = +event.target.value;
    console.log('Curso selecionado no convite:', this.selectedCursoConvite);
    this.inviteErrorMessage = ''; // Limpar erro quando mudar
    this.emailError = '';
    this.showErrorMessage = false;
    this.errorMessageText = '';
  }

  // Abre o modal de convite (método adicional para compatibilidade)
  openConvidarModal(): void {
    this.isConvidarModalOpen = true;
    this.novoColaboradorEmail = '';
    this.openInviteDialog(); // Chama o método principal
  }

  // Fecha o modal de convite (método adicional para compatibilidade)
  closeConvidarModal(): void {
    this.isConvidarModalOpen = false;
    this.novoColaboradorEmail = '';
    this.closeInviteDialog(); // Chama o método principal
  }

  // Método chamado ao submeter o convite (adicional para compatibilidade)
  async onConvidarSubmit(): Promise<void> {
    const email = this.novoColaboradorEmail.trim();
    
    if (!email) {
      this.emailError = 'O e-mail é obrigatório.';
      this.inviteErrorMessage = 'O e-mail é obrigatório.';
      return;
    }
    
    if (!this.validateEmail(email)) {
      this.emailError = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      return;
    }
    
    this.emailError = '';
    this.inviteEmail = email; // Sincroniza com a propriedade principal
    
    // Chama o método principal de envio
    await this.sendInvite();
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

  // Método para mapear perfil (do lista-colaboradores):
  private mapearPerfil(perfilId: number): string {
    const perfis: { [key: number]: string } = {
      1: 'Administrador',
      2: 'Gente e Cultura',
      3: 'Colaborador Comum'
    };
    
    return perfis[perfilId] || `Perfil ${perfilId}`;
  }

  async sendInvite(): Promise<void> {
    const email = this.inviteEmail.trim();
    if (!email) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Por favor, insira um e-mail válido.';
      this.inviteErrorMessage = '';
      this.emailError = 'O e-mail é obrigatório.';
      return;
    }

    // Validação rigorosa de e-mail
    if (!this.validateEmail(email)) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.inviteErrorMessage = '';
      this.emailError = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.isValidEmail = false;
      return;
    }

    // VALIDAÇÕES DOS SELECTS
    if (this.selectedPerfilConvite === 0) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Por favor, selecione um perfil.';
      this.inviteErrorMessage = '';
      return;
    }

    if (this.selectedCursoConvite === 0) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Por favor, selecione um curso.';
      this.inviteErrorMessage = '';
      return;
    }

    this.inviteLoading = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.emailError = '';

    try {
      // Verificar se já existe convite em aberto para este email
      const conviteExiste = await this.verificarConviteExistente(email);
      
      if (conviteExiste) {
        this.inviteLoading = false;
        this.showErrorMessage = true;
        this.errorMessageText = 'Já existe um convite em aberto para este e-mail. Aguarde a resposta ou cancele o convite anterior.';
        this.inviteErrorMessage = '';
        return;
      }

      // LOG DOS DADOS QUE SERIAM ENVIADOS
      console.log('Dados do convite que seriam enviados:', {
        email: email,
        perfil_id: this.selectedPerfilConvite,
        curso_id: this.selectedCursoConvite
      });

      // Se não existe convite em aberto, prosseguir com o envio
      this.invitationService.createInvitation(email).subscribe({
        next: (response: any) => {
          this.inviteLoading = false;
          
          if (response.status === 'success') {
            this.showSuccessMessage = true;
            this.successMessageText = response.message || 'Convite enviado com sucesso!';
            this.inviteSuccessMessage = '';
            this.inviteEmail = '';
            this.selectedPerfilConvite = 3; // Reset
            this.selectedCursoConvite = 0; // Reset
            this.loadInvitations();
            
            setTimeout(() => {
              this.closeInviteDialog();
            }, 2000);
          } else {
            this.showErrorMessage = true;
            this.errorMessageText = response.message || 'Erro ao enviar convite.';
            this.inviteErrorMessage = '';
          }
        },
        error: (error: any) => {
          this.inviteLoading = false;
          
          if (error.status === 400 && error.error?.data) {
            if (error.error.data.email) {
              this.showErrorMessage = true;
              this.errorMessageText = error.error.data.email[0];
              this.inviteErrorMessage = '';
              this.emailError = error.error.data.email[0];
            } else {
              this.showErrorMessage = true;
              this.errorMessageText = error.error.message || 'Dados inválidos.';
              this.inviteErrorMessage = '';
            }
          } else if (error.status === 0) {
            this.showErrorMessage = true;
            this.errorMessageText = 'Erro de conexão. Verifique se a API está funcionando.';
            this.inviteErrorMessage = '';
          } else {
            this.showErrorMessage = true;
            this.errorMessageText = 'Erro ao enviar convite. Tente novamente.';
            this.inviteErrorMessage = '';
          }
        }
      });
    } catch (error) {
      this.inviteLoading = false;
      this.showErrorMessage = true;
      this.errorMessageText = 'Erro ao verificar convites existentes. Tente novamente.';
      this.inviteErrorMessage = '';
    }
  }

  openInviteDialog(): void {
    this.showInviteDialog = true;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset para Colaborador Comum
    this.selectedCursoConvite = 0; // Reset para nenhum curso
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.emailError = '';
    this.showSuccessMessage = false; 
    this.showErrorMessage = false; 
    this.successMessageText = ''; 
    this.errorMessageText = ''; 
    this.isValidEmail = false;
    document.body.style.overflow = 'hidden';
    
    // Força estilos do select no tema escuro após um pequeno delay
    setTimeout(() => {
      this.applyDarkThemeToSelects();
    }, 50);
}

  // SUBSTITUIR o método closeInviteDialog para incluir reset do emailError:
  closeInviteDialog(): void {
    this.showInviteDialog = false;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset
    this.selectedCursoConvite = 0; // Reset
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.emailError = '';
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.successMessageText = '';
    this.errorMessageText = '';
    this.isValidEmail = false;
    this.inviteLoading = false;
    document.body.style.overflow = 'auto';
  }

  ngAfterViewInit(): void {
    // Observa mudanças no tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTimeout(() => {
            this.applyDarkThemeToSelects();
          }, 10);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
}

