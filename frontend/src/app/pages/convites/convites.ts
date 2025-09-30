// frontend/src/app/components/lista-convites/lista-convites.component.ts

import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { InvitationService } from '../../services/invitation.service'; 
import { Invitation } from '../../interfaces/invitation.interface'; 
//  Importa o componente filho >>
import { ListaConvitesComponent } from '../lista-convites/lista-convites'; 
import { FormsModule } from '@angular/forms'; // Necessário para ngModel, embora não usado diretamente aqui, pode ser útil para futuros controles no pai.
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-convites', // Seletor HTML para usar este componente
  standalone: true, // Componente autônomo
  imports: [CommonModule, ListaConvitesComponent, FormsModule, Header], // Módulos e pipes necessários
  templateUrl: './convites.html', // Caminho para o template HTML
  styleUrls: ['./convites.css'] // Caminho para os estilos CSS
})

export class ConvitesComponent implements OnInit {

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

  // isDarkTheme: boolean = false; //Propriedade para controlar o tema

  constructor( private renderer: Renderer2, private el: ElementRef, private router: Router, private invitationService: InvitationService) { }

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
    // alert('Funcionalidade de Criar Novo Convite será implementada aqui.');
    // Aqui adicionar lógica para abrir um modal ou navegar para uma tela de criação de convite
  }

  openInviteDialog(): void {
    this.showInviteDialog = true;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset para Colaborador Comum
    this.selectedCursoConvite = 0; // Reset para nenhum curso
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.isValidEmail = false;
    document.body.style.overflow = 'hidden';
    
    // Força estilos do select no tema escuro após um pequeno delay
    setTimeout(() => {
      this.applyDarkThemeToSelects();
    }, 50);
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
      // TEMA CLARO - Remover estilos inline para voltar ao CSS padrão
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

  closeInviteDialog(): void {
    this.showInviteDialog = false;
    this.inviteEmail = '';
    this.selectedPerfilConvite = 3; // Reset
    this.selectedCursoConvite = 0; // Reset
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.isValidEmail = false;
    this.inviteLoading = false;
    document.body.style.overflow = 'auto';
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  onEmailChange(): void {
    const email = this.inviteEmail.trim();
    if (!email) {
      this.inviteErrorMessage = '';
      this.isValidEmail = false;
      return;
    }
    if (!this.validateEmail(email)) {
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido (ex: usuario@exemplo.com)';
      this.isValidEmail = false;
    } else {
      this.inviteErrorMessage = '';
      this.isValidEmail = true;
    }
  }

  // Métodos para os selects
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

  async sendInvite(): Promise<void> {
    const email = this.inviteEmail.trim();
    if (!email || !this.isValidEmail) {
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    // VALIDAÇÕES DOS SELECTS
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
      const conviteExiste = await this.verificarConviteExistente(email);
      if (conviteExiste) {
        this.inviteLoading = false;
        this.inviteErrorMessage = 'Já existe um convite em aberto para este e-mail. Aguarde a resposta ou cancele o convite anterior.';
        return;
      }

      // LOG DOS DADOS
      console.log('Dados do convite que seriam enviados:', {
        email: email,
        perfil_id: this.selectedPerfilConvite,
        curso_id: this.selectedCursoConvite
      });

      this.invitationService.createInvitation(email).subscribe({
        next: (response: any) => {
          this.inviteLoading = false;
          if (response.status === 'success') {
            this.inviteSuccessMessage = response.message || 'Convite enviado com sucesso!';
            this.inviteEmail = '';
            this.selectedPerfilConvite = 3; // Reset
            this.selectedCursoConvite = 0; // Reset
            this.loadInvitations(); 
            setTimeout(() => {
              this.closeInviteDialog();
            }, 2000);
          } else {
            this.inviteErrorMessage = response.message || 'Erro ao enviar convite.';
          }
        },
        error: (error: any) => {
          this.inviteLoading = false;
          if (error.status === 400 && error.error?.data?.email) {
            this.inviteErrorMessage = error.error.data.email[0];
          } else if (error.status === 400) {
            this.inviteErrorMessage = error.error?.message || 'E-mail inválido ou já cadastrado.';
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

  private async verificarConviteExistente(email: string): Promise<boolean> {
    try {
      // Busca convites com status 'Em Aberto' para o e-mail
      const response = await this.invitationService.getInvitations(1, 1, 'Em Aberto', email).toPromise();
      return response.data && response.data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar convites existentes:', error);
      return false; // Em caso de erro, assume que não existe para não bloquear o envio
    }
  }

  onViewDetails(invitation: Invitation): void {
    alert(`Visualizar detalhes do convite: ${invitation.email_colab}`);
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

