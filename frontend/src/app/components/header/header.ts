
import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef} from '@angular/core'; 
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    CommonModule 
  ],
  templateUrl: './header.html', 
  styleUrls: ['./header.css'] 
})
export class Header implements OnInit { // << usarei o OnInit que importei

  isDarkTheme: boolean = false; // Propriedade para controlar o tema, vai armazenar como ta o estado atual do tema

  // agora uso private renderer para adicionar ou remover classes diretamente do body da pagina
  constructor(private renderer: Renderer2, private el: ElementRef) { } 

  ngOnInit(): void { // aqui vou assumir o tema claro por padrão, mas carregar o dark quando for preciso
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass(); //aplico
  }

  // Método que ALTERNA O TEMA
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // inverto o estado do tema
    this.applyThemeClass(); // aplico a classe CSS dele
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Salvo o que será usado agora, se é o dark ou light
  }

  // Método que adiciona ou remove o dark do body, usando o renderer2 para garantir que é seguro
  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
    }
  }
}

