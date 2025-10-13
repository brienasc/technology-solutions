// frontend/src/app/pages/funcionalidades/funcionalidades.ts
import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-funcionalidades',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage], 
  templateUrl: './funcionalidades.html',
  styleUrl: './funcionalidades.css'
})
export class Funcionalidades implements OnDestroy {
    
    // Variáveis com as audiodescrições completas
    fun1ImageAltDescription: string = "Uma pessoa de pele escura e roupas casuais, sentada  no chão de madeira, focada em um tablet. A pessoa segura o tablet com ambas as mãos, usando uma caneta stylus branca para desenhar. Na tela digital, há um design moderno em preto e branco com formas orgânicas, semelhante à escrita ou a um símbolo gráfico. É visível o joelho da pessoa e uma meia branca no canto, o que sugere um ambiente de trabalho descontraído e confortável. A imagem transmite uma sensação de criação digital e foco em design.";
    fun2ImageAltDescription: string = "A foto, tirada em ângulo fechado, exibe a tela de um laptop ou tablet com o navegador Chrome ou Edge aberto. A aba ativa mostra o site Udemy.com, uma plataforma de cursos online. A interface exibe a barra de navegação do site, com a logo da Udemy em vermelho no topo. A imagem transmite a sensação de oportunidade de aprendizado digital e a promessa de desenvolvimento profissional.";
    fun3ImageAltDescription: string = "A foto, tirada em ângulo médio, foca em uma mulher de pele morena, vestindo uma blusa branca com textura em relevo, em pé, à frente de um grupo de pessoas em um evento interno. Ela segura um microfone preto na mão esquerda e gesticula com a mão direita aberta na altura do peito, enquanto fala com uma expressão séria e engajada. No fundo, há várias pessoas sentadas em mesas redondas cobertas com toalhas brancas, algumas bebendo água. As paredes do local são revestidas com um papel de parede texturizado em tons neutros, e no topo, há um mural de fotos penduradas na parede, sugerindo um evento de treinamento ou conferência. A imagem transmite a sensação de liderança, comunicação ativa e foco em aprendizado em grupo. ";
    fun4ImageAltDescription: string = "Imagem da funcionalidade Feito para Especialistas: há um grande card retangular em roxo claro. Ele contém uma foto de três mulheres jovens em uma sala de aula, sentadas em carteiras de madeira. A mulher da frente, no centro, sorri enquanto olha para seu celular. À sua direita, outra mulher também olha para seu celular com um sorriso, e à sua esquerda, uma terceira mulher tem seu celular em mãos. Todas parecem estar interagindo com a tecnologia em um ambiente de aprendizado.";
                
    // Aceita a string específica para leitura
    readImageDescription(textToSpeak: string): void {
        if ('speechSynthesis' in window && textToSpeak && textToSpeak.length > 0) {
            
            window.speechSynthesis.cancel();
            
            const speech = new SpeechSynthesisUtterance(textToSpeak);
            speech.lang = 'pt-BR';
            
            window.speechSynthesis.speak(speech);
        } else {
            console.error("Erro: A API de voz não está disponível ou o texto está vazio.");
        }
    }
    
    // Cancela a fala quando o componente é destruído (boa prática de acessibilidade)
    ngOnDestroy(): void {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
}