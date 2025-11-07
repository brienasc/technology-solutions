// src/app/components/accessibility-bar/accessibility-bar.component.ts
import { Component, Renderer2, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'; // Para estilização Material
// IMPORTAR MatIconModule SE VOCÊ OPTAR POR ÍCONES SVG DO MATERIAL
import { OnDestroy } from '@angular/core'; //cancelar a fala quando mudar de pagina
import { MatIconModule } from '@angular/material/icon';

// Defina os limites e o valor inicial para o recurso de Fonte
// const MAX_FONT_LEVEL = 3; 
// const MIN_FONT_LEVEL = 0; // Nível 0 é o padrão (sem classe)

@Component({
  selector: 'app-accessibility-bar',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './accessibility-bar.html',
  styleUrls: ['./accessibility-bar.css'],
})
export class AccessibilityBarComponent implements OnInit{
  
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

  // 2.1 DESTRUIÇÃO (ngOnDestroy)
    ngOnDestroy(): void {
      // Cancela a fala quando o usuário navegar para fora desta página
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

  // 3. MÉTODOS DE CONTROLE (Chamados pelo HTML)

  // LÓGICA DE ALTO CONTRASTE
  public toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    this.applyContrastClass();
    localStorage.setItem('contrast', this.isHighContrast ? 'high' : 'normal');
  }
  
  // LÓGICA DE TEMA ESCURO/CLARO
  public toggleDarkTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; 
    this.applyThemeClass(); 
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); 
  }

  // // AUMENTAR FONTE
  // public changeFontSize(): void {
  //   if (this.fontSizeLevel < this.MAX_FONT_LEVEL) {
  //     this.fontSizeLevel++;
  //     this.applyFontSizeClass();
  //   }
  //   // this.isMenuOpen = false;
  // }

  // LÓGICA DE TAMANHO DA FONTE (Unificado para changeFontSize(step))
    public changeFontSize(step: number): void { // <-- NOVO: HTML chama este método
        const newLevel = this.fontSizeLevel + step;
        
        if (newLevel >= this.MIN_FONT_LEVEL && newLevel <= this.MAX_FONT_LEVEL) {
            this.fontSizeLevel = newLevel;
            this.applyFontSizeClass();
            this.updateFontSizeDisplay();
        }
        // Não fecha o menu aqui, o usuário pode querer mais ajustes
    }

  // DIMINUIR FONTE
  // decreaseFontSize(): void {
  //   if (this.fontSizeLevel > this.MIN_FONT_LEVEL) {
  //     this.fontSizeLevel--;
  //     this.applyFontSizeClass();
  //   }
  //     // this.isMenuOpen = false;
  // }
  
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
// scrollToSection(sectionId: string): void {
//   const element = document.getElementById(sectionId);
//   if (element) {
//     element.focus(); // foco para acessibilidade (opcional, importante para leitores de tela)
//     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     this.isMenuOpen = false; // opcional: fecha barra após clicar no botão
//   }
// }

    // Método para navegar rapidamente para seções (âncoras)
    public scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            // Rola a tela suavemente até a seção
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.isMenuOpen = false; // Fecha a barra após o clique
            console.log(`Rolando para a seção: ${sectionId}`);
        } else {
            console.error(`Elemento com ID '${sectionId}' não encontrado.`);
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

  // Atualiza o texto do display para o usuário
private updateFontSizeDisplay(): void {
    const baseSize = 16;
    const step = 2;
    const sizeMap: { [key: number]: string } = {
        0: '16px (Padrão)',
        1: `${baseSize + (step * 1)}px (Nível 1)`,
        2: `${baseSize + (step * 2)}px (Nível 2)`,
        3: `${baseSize + (step * 3)}px (Nível 3)`,
    };
    this.displayFontSize = sizeMap[this.fontSizeLevel] || sizeMap[0];
}


  // 5. MÉTODO DE RESET (Final da Classe)
  
  resetAcessibilitySettings(): void {
    // Reseta Contraste
    if (this.isHighContrast) {
        this.toggleHighContrast(); 
    }
    
    // Reseta Tema
    if (this.isDarkTheme) {
        this.toggleDarkTheme();
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
  //   readPageAloud(): void {
  //     if ('speechSynthesis' in window) {
  //       const speech = new SpeechSynthesisUtterance();
  //       speech.text = document.body.innerText;
  //       speech.lang = 'pt-BR';
  //       window.speechSynthesis.cancel();
  //       window.speechSynthesis.speak(speech);
  //     } else {
  //       alert('Navegador não suporta síntese de voz.');
  //   }
  // }


// Método para ler o texto selecionado ou a página inteira
    public readPageAloud(): void {
        console.log("Tentando iniciar a leitura da página...");
        
        if (!('speechSynthesis' in window)) {
             alert('Seu navegador não suporta a funcionalidade de leitura de tela.');
             return;
        }

        window.speechSynthesis.cancel(); 
        
        const selection = window.getSelection();
        let textToRead = '';
        
        if (selection) {
            textToRead = selection.toString().trim(); 
        }
        
        // Prioriza a seleção, se for substancial
        if (textToRead && textToRead.length > 20) {
            // Se houver lógica de filtro de conteúdo, aplique aqui
            console.log("Lendo seleção...");
        } else {
            // Fallback: lê o conteúdo principal do corpo (ajuste o seletor se houver um <main>)
            const mainContent = document.body;
            textToRead = mainContent.innerText || mainContent.textContent || '';
            console.log("Lendo página inteira (Fallback).");
        }
        
        if (textToRead && textToRead.length > 0) {
            // Cria um objeto de fala
            const speech = new SpeechSynthesisUtterance(textToRead);
            
            // Opcional: Configurações de voz (se necessário)
            // speech.lang = 'pt-BR'; 
            // speech.pitch = 1; 
            // speech.rate = 1;

            window.speechSynthesis.speak(speech);
        } else {
            console.log("Nenhum texto encontrado para ler.");
        }
    }
    

    

}