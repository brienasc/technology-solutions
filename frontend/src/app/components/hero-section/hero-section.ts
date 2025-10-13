import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css'
})
export class HeroSection {
      heroImageAltDescription: string = 'No lado direito da tela, há um grande card retangular em roxo claro. Ele contém uma foto de três mulheres jovens em uma sala de aula, sentadas em carteiras de madeira. A mulher da frente, no centro, sorri enquanto olha para seu celular. À sua direita, outra mulher também olha para seu celular com um sorriso, e à sua esquerda, uma terceira mulher tem seu celular em mãos. Todas parecem estar interagindo com a tecnologia em um ambiente de aprendizado.';

readHeroImageDescription(): void {
    const description = this.heroImageAltDescription; 
    
    // Supondo que você tenha uma função global de leitura ou acesso ao seu SpeechService/AccessibilityBarService
    // A maneira mais simples é chamar a API de voz diretamente:
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(description);
        speech.lang = 'pt-BR';
        window.speechSynthesis.speak(speech);
    }
}
}
