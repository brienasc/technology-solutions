
// frontend/src/app/pages/menu-gerencial/menu-gerencial.component.ts
import { Component, OnInit, Renderer2, ElementRef } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { ListaColaboradoresComponent } from '../../components/lista-colaboradores/lista-colaboradores'; 

@Component({
  selector: 'app-menu-gerencial',
  standalone: true, 
  imports: [
    CommonModule, 
    ListaColaboradoresComponent, 
  ],
  templateUrl: './menu-gerencial.html', 
  styleUrls: ['./menu-gerencial.css'] 
})
export class MenuGerencialComponent implements OnInit {
  showModal: boolean = false;
  selectedColaborador: any = null;
  isDarkTheme: boolean = false; //Propriedade para controlar o tema

  // Renderer2 e ElementRef no construtor
  constructor(private renderer: Renderer2, private el: ElementRef) { } 

  ngOnInit(): void {
    
    // Carrega o tema salvo no localStorage ao iniciar o componente
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass();
  }

  //  Método para alternar o tema >>
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // Inverte o estado do tema
    this.applyThemeClass(); // Aplica a classe CSS correspondente
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Salva a preferência
  }

  //  Método privado para aplicar/remover a classe de tema no body >>
  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
    }
  }

  onViewColaboradorDetails(colaborador: any): void {
    this.selectedColaborador = colaborador;
    this.showModal = true;
    console.log('Abrindo modal para:', colaborador);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedColaborador = null;
    console.log('Fechando modal.');
  }
}
