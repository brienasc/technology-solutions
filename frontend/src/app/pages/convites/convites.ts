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
        this.invitations = response.data;

        this.totalItems = response.data.length;
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
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.isValidEmail = false;
    document.body.style.overflow = 'hidden'; // Previne scroll da página
  }

  closeInviteDialog(): void {
    this.showInviteDialog = false;
    this.inviteEmail = '';
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
    this.isValidEmail = false;
    this.inviteLoading = false;
    document.body.style.overflow = 'auto'; // Restaura o scroll
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

  async sendInvite(): Promise<void> {
    const email = this.inviteEmail.trim();
    if (!email || !this.isValidEmail) {
      this.inviteErrorMessage = 'Por favor, insira um e-mail válido.';
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

      this.invitationService.createInvitation(email).subscribe({
        next: (response: any) => {
          this.inviteLoading = false;
          if (response.status === 'success') {
            this.inviteSuccessMessage = response.message || 'Convite enviado com sucesso!';
            this.inviteEmail = '';
            // Recarrega a lista de convites para exibir o novo
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
}

