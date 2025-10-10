// src/app/components/accessibility-bar/accessibility-bar.component.ts
import { Component, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'; // Para estilização Material
// IMPORTAR MatIconModule SE VOCÊ OPTAR POR ÍCONES SVG DO MATERIAL
import { OnDestroy } from '@angular/core'; //cancelar a fala quando mudar de pagina

// Defina os limites e o valor inicial para o recurso de Fonte
// const MAX_FONT_LEVEL = 3; 
// const MIN_FONT_LEVEL = 0; // Nível 0 é o padrão (sem classe)

@Component({
  selector: 'app-accessibility-bar',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule // Incluir MatButtonModule
  ],
  templateUrl: './accessibility-bar.html',
  styleUrls: ['./accessibility-bar.css'],
})
export class AccessibilityBarComponent implements OnInit {
  
    readonly MAX_FONT_LEVEL = 3; 
  readonly MIN_FONT_LEVEL = 0; 
  
  // 1. PROPRIEDADES DE ESTADO
  isMenuOpen: boolean = false;
  isHighContrast: boolean = false;
  isDarkTheme: boolean = false;
  
  // Propriedades para rastrear o zoom
  fontSizeLevel: number = 0; 
  displayFontSize: string = '16px'; 

  constructor(private renderer: Renderer2) {}

  // 2. INICIALIZAÇÃO (ngOnInit)
  ngOnInit(): void {
    // Carrega o estado do Tema Escuro e Contraste do LocalStorage
    this.isHighContrast = localStorage.getItem('contrast') === 'high';
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    
    // Aplica as classes iniciais
    this.applyContrastClass();
    this.applyThemeClass();

    // Carrega o estado do Tamanho da Fonte
    const storedLevel = localStorage.getItem('fontSizeLevel');
    if (storedLevel !== null) {
      this.fontSizeLevel = parseInt(storedLevel, 10);
      this.applyFontSizeClass();
    }
  }

  // 3. MÉTODOS DE CONTROLE (Chamados pelo HTML)

  // LÓGICA DE ALTO CONTRASTE
  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    this.applyContrastClass();
    localStorage.setItem('contrast', this.isHighContrast ? 'high' : 'normal');
  }
  
  // LÓGICA DE TEMA ESCURO/CLARO
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; 
    this.applyThemeClass(); 
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); 
  }

  // AUMENTAR FONTE
  increaseFontSize(): void {
    if (this.fontSizeLevel < this.MAX_FONT_LEVEL) {
      this.fontSizeLevel++;
      this.applyFontSizeClass();
    }
    // this.isMenuOpen = false;
  }

  // DIMINUIR FONTE
  decreaseFontSize(): void {
    if (this.fontSizeLevel > this.MIN_FONT_LEVEL) {
      this.fontSizeLevel--;
      this.applyFontSizeClass();
    }
      // this.isMenuOpen = false;
  }
  
    // método para fechar o menu
  closeAccessibilityMenu(): void {
    this.isMenuOpen = false;
  }
  
  // Fecha o menu após a ação e executa o método
  // executeAction(action: () => void): void {
  //   action();
  //   this.isMenuOpen = false;
  // }
  // ------- jac- pra scrollar na tela
scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.focus(); // foco para acessibilidade (opcional, importante para leitores de tela)
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isMenuOpen = false; // opcional: fecha barra após clicar no botão
  }
}
//---- fim de scrolar na tela

  // 4. MÉTODOS PRIVADOS DE APLICAÇÃO (Manipulação do DOM)

  private applyContrastClass(): void {
    if (this.isHighContrast) {
      this.renderer.addClass(document.body, 'high-contrast');
    } else {
      this.renderer.removeClass(document.body, 'high-contrast');
    }
  }

  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
  
  private applyFontSizeClass(): void {
    // Remove todas as classes de fonte primeiro
    for (let i = this.MIN_FONT_LEVEL + 1; i <= this.MAX_FONT_LEVEL; i++) {
      this.renderer.removeClass(document.body, `font-size-level-${i}`);
    }

    // Adiciona a classe correspondente (se não for o nível base)
    if (this.fontSizeLevel > this.MIN_FONT_LEVEL) {
      this.renderer.addClass(document.body, `font-size-level-${this.fontSizeLevel}`);
    }
    
    // Atualiza o display visual
    this.displayFontSize = `${16 + (this.fontSizeLevel * 2)}px`; 
    localStorage.setItem('fontSizeLevel', this.fontSizeLevel.toString());
  }


  // 5. MÉTODO DE RESET (Final da Classe)
  
  resetAcessibilitySettings(): void {
    // Reseta Contraste
    if (this.isHighContrast) {
        this.toggleHighContrast(); 
    }
    
    // Reseta Tema
    if (this.isDarkTheme) {
        this.toggleTheme();
    }
    
    // Reseta Fonte
    if (this.fontSizeLevel !== this.MIN_FONT_LEVEL) {
      this.fontSizeLevel = this.MIN_FONT_LEVEL;
      this.applyFontSizeClass();
      localStorage.removeItem('fontSizeLevel');
    }
    //pra parar quando reseto
    window.speechSynthesis.cancel();





  //   this.isMenuOpen = false;
  //   alert("Configurações de acessibilidade resetadas para o padrão.");
  // }
  }
    readPageAloud(): void {
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = document.body.innerText;
        speech.lang = 'pt-BR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      } else {
        alert('Navegador não suporta síntese de voz.');
    }
  }
  ngOnDestroy(): void {
    window.speechSynthesis.cancel();
  }

}