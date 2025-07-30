// frontend/src/app/components/header/header.component.ts (assumindo este caminho)

import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef} from '@angular/core'; 
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // << Adicionado CommonModule para ngIf/ngClass se necessário no futuro

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
export class Header implements OnInit { // << Implementa OnInit
  isDarkTheme: boolean = false; // Propriedade para controlar o tema

  // Injete Renderer2 e ElementRef no construtor
  constructor(private renderer: Renderer2, private el: ElementRef) { } 

  ngOnInit(): void { 
    // Verifica o localStorage para definir o tema inicial
    // Se não houver tema salvo, assume o tema claro por padrão
    // Carrega o tema salvo no localStorage ao iniciar o componente
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass();
  }

  // Método para alternar o tema
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // Inverte o estado do tema
    this.applyThemeClass(); // Aplica a classe CSS correspondente
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Salva a preferência
  }

  // Método privado para aplicar/remover a classe de tema no body
  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
    }
  }
}

