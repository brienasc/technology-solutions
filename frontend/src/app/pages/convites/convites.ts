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
        this.totalItems = response.meta.total;
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
    alert('Funcionalidade de Criar Novo Convite será implementada aqui.');
    // Aqui adicionar lógica para abrir um modal ou navegar para uma tela de criação de convite
  }

// Nesse aqui não vamos utilizar o método de logout, pois não é necessário para a tela de convites
  // onViewDetails(invitation: Invitation): void {
  //   alert(`Visualizar detalhes do convite: ${invitation.email}`);
  //   // Aqui adicionar lógica para abrir um modal de detalhes ou navegar para uma tela de detalhes
  // }
}

