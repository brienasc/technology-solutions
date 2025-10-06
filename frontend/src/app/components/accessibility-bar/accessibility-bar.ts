// src/app/components/accessibility-bar/accessibility-bar.component.ts
import { Component, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf
// Importe RouterLink e outros módulos de navegação, se for usar

@Component({
  selector: 'app-accessibility-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-bar.html',
  styleUrls: ['./accessibility-bar.css'],
})
export class AccessibilityBarComponent implements OnInit {
  isMenuOpen: boolean = false;
  isHighContrast: boolean = false;
  isDarkTheme: boolean = false;

  constructor(private renderer: Renderer2) {}

     resetAcessibilitySettings(): void {
        // Reseta Contraste
        if (this.isHighContrast) {
            this.toggleHighContrast(); // Volta para o estado 'normal'
        }
        
        // Reseta Tema (Volta para o modo light se estiver em dark)
        if (this.isDarkTheme) {
            this.toggleTheme();
        }
        
        // Limpar Fontes (Se você adicionar lógica de fonte)
        // localStorage.removeItem('fontSize'); 
        
        // Fecha o menu
        this.isMenuOpen = false;
        alert("Configurações de acessibilidade resetadas para o padrão.");
    }

  ngOnInit(): void {
    // Carrega o estado do Tema Escuro e Contraste do LocalStorage ao iniciar
    this.isHighContrast = localStorage.getItem('contrast') === 'high';
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    
    // Aplica as classes iniciais para garantir que o tema persista na recarga
    this.applyContrastClass();
    this.applyThemeClass();
  }

  // --- LÓGICA DE ALTO CONTRASTE ---
  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    this.applyContrastClass();
    localStorage.setItem('contrast', this.isHighContrast ? 'high' : 'normal');
  }

  private applyContrastClass(): void {
    if (this.isHighContrast) {
      this.renderer.addClass(document.body, 'high-contrast');
    } else {
      this.renderer.removeClass(document.body, 'high-contrast');
    }
  }
  
  // --- LÓGICA DE TEMA ESCURO/CLARO (Movida para cá) ---
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; 
    this.applyThemeClass(); 
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); 
  }

  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  // Fecha o menu após a ação
  executeAction(action: () => void): void {
    action();
    this.isMenuOpen = false;
  }
}