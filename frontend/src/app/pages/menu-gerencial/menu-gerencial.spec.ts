// frontend/src/app/pages/menu-gerencial/menu-gerencial.spec.ts

// O que temos que fazer - Painel Administrativo (Administrador e Gente e Cultura):

// Menu "Gerencial".

// Lista de Colaboradores: Exibir todos (status "Finalizado"), ordem alfabética, paginação, pesquisa (nome, e-mail, CPF).

// Exportação para Excel (obedecendo filtro).

// Visualização de Informações detalhadas do colaborador.

// Alteração de Perfil: Select para mudar perfil (Administrador pode mudar para qualquer um; Gente e Cultura para Gente e Cultura/Colaborador Comum).

// Campo de senha para perfis Administrador/Gente e Cultura.


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para standalone components
import { ListaColaboradoresComponent } from '../../components/lista-colaboradores/lista-colaboradores'; // Importa o sub-componente
// import { ModalDetalhesComponent } from '../../components/modal-detalhes/modal-detalhes.component'; // Importa o modal (será usado depois)

@Component({
  selector: 'app-menu-gerencial',
  standalone: true, // Indica que é um componente standalone
  imports: [
    CommonModule, // Fornece diretivas como ngIf, ngFor
    ListaColaboradoresComponent, // Torna o componente de lista disponível no template
    // ModalDetalhesComponent // Será adicionado aqui quando o modal for implementado
  ],
  templateUrl: './menu-gerencial.html',
  styleUrls: ['./menu-gerencial.css']
})
export class MenuGerencialComponent implements OnInit {
  showModal: boolean = false;
  selectedColaborador: any = null; 

  constructor() { }

  ngOnInit(): void {
    // Lógica de inicialização da página, se houver.
  }

  // Método chamado quando o componente ListaColaboradores emite o evento 'viewColaboradorDetails'.
  // Ele recebe os dados do colaborador e abre o modal.
  onViewColaboradorDetails(colaborador: any): void {
    this.selectedColaborador = colaborador;
    this.showModal = true;
    console.log('Abrindo modal para:', colaborador);
  }

  // Método para fechar o modal
  closeModal(): void {
    this.showModal = false;
    this.selectedColaborador = null;
    console.log('Fechando modal.');
  }
}



// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-menu-gerencial',
//   imports: [],
//   templateUrl: './menu-gerencial.html',
//   styleUrl: './menu-gerencial.css'
// })
// export class MenuGerencial {

// }

