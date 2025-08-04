// frontend/src/app/components/quadro-vantagens/quadro-vantagens.component.ts

// Importa os módulos e classes necessários do Angular e outras bibliotecas.
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Decorador @Component que define o componente Angular.
@Component({
  selector: 'app-quadro-vantagens', // Seletor CSS para usar este componente.
  standalone: true, // Indica que este é um componente standalone (não precisa de NgModule).
  imports: [CommonModule, NgOptimizedImage], // Módulos que este componente utiliza.
  templateUrl: './quadro-vantagens.html', // Caminho para o arquivo de template HTML do componente.
  styleUrls: ['./quadro-vantagens.css'] // Caminho para o arquivo de estilos CSS do componente.
})
// Definição da classe do componente, implementando interfaces de ciclo de vida do Angular.
export class QuadroVantagensComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild para obter uma referência ao elemento HTML com a tag 'benefitsGrid'.
  // O '!' garante que a propriedade será inicializada e não será nula.
  @ViewChild('benefitsGrid') benefitsGrid!: ElementRef;

  // Array de objetos que representam as imagens e seus respectivos títulos e textos.
  images = [
    { src: 'app/assets/imagens/icone-convites.jpg', title: 'Convites Personalizados', text: 'Adapte soluções às suas necessidades exclusivas.' },
    { src: 'app/assets/imagens/icone-validacao.jpg', title: 'Validação de Dados', text: 'Garanta a integridade e precisão das suas informações.' },
    { src: 'app/assets/imagens/icone-painel.jpg', title: 'Painel para os colaboradores', text: 'Acesso fácil e intuitivo para gerenciar tarefas e dados.' },
    { src: 'app/assets/imagens/icone-seguranca.jpg', title: 'Segurança garantida', text: 'Proteja seus dados com as mais avançadas tecnologias de segurança.' },
  ];

  // Propriedade para rastrear o índice do card atualmente visível/ativo.
  currentCardIndex: number = 0;
  // Conta o número total de cards com base no array de imagens.
  private cardCount = this.images.length;
  // Flag para controlar se uma animação de rolagem está em andamento.
  private isAnimating = false;
  // Variável para armazenar o ID do intervalo do autoplay, permitindo que seja limpo.
  private intervalId: any;

  // Construtor do componente.
  constructor() {}

  // Hook de ciclo de vida que é chamado uma vez após o Angular inicializar as propriedades de dados do componente.
  ngOnInit(): void {
    // Implementação do OnInit, se necessário (atualmente vazia).
  }

  // Hook de ciclo de vida que é chamado uma vez após o Angular inicializar as visualizações do componente e as visualizações filhas.
  ngAfterViewInit() {
    // Duplica os cards para criar um efeito de loop contínuo no carrossel.
    this.duplicateCards();
    // Inicia o autoplay do carrossel.
    this.startAutoplay();
  }

  // Hook de ciclo de vida que é chamado antes do Angular destruir o componente.
  ngOnDestroy(): void {
    // Para o autoplay para evitar vazamentos de memória quando o componente é destruído.
    this.stopAutoplay();
  }

  // Método privado para duplicar os cards no DOM, facilitando o loop contínuo.
  private duplicateCards(): void {
    const originalCards = this.benefitsGrid.nativeElement.innerHTML;
    this.benefitsGrid.nativeElement.innerHTML += originalCards; // Adiciona os cards originais novamente ao final.
  }

  // Método privado para iniciar o autoplay do carrossel.
  private startAutoplay(): void {
    // Define um intervalo para rolar para a direita a cada 2000ms (2 segundos).
    this.intervalId = setInterval(() => {
      this.scrollRight();
    }, 2000);
  }

  // Método privado para parar o autoplay do carrossel.
  private stopAutoplay(): void {
    // Limpa o intervalo se ele estiver definido.
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Método privado para atualizar o índice do card atualmente visível, usado para indicadores de navegação.
  private updateIndicators(): void {
    // Calcula a largura de um card. Se não encontrar, assume 0.
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    // Obtém a posição atual de rolagem horizontal.
    const scrollPosition = this.benefitsGrid.nativeElement.scrollLeft;
    // Largura do espaçamento entre os cards.
    const gapWidth = 15;
    // Largura total de um item (card + espaçamento).
    const itemWidth = cardWidth + gapWidth;
    // Calcula o índice do card atual, garantindo que ele esteja dentro dos limites do cardCount.
    this.currentCardIndex = Math.round((scrollPosition / itemWidth)) % this.cardCount;
  }

  // Método público para navegar para um slide específico usando o índice.
  goToSlide(index: number): void {
    // Se uma animação estiver em andamento, não faz nada.
    if (this.isAnimating) return;
    this.isAnimating = true; // Define a flag de animação como true.
    this.stopAutoplay(); // Para o autoplay durante a navegação manual.

    // Calcula a largura de um card e do espaçamento.
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    const gapWidth = 15;
    // Calcula a quantidade de rolagem necessária para chegar ao slide desejado.
    const scrollAmount = (cardWidth + gapWidth) * index;

    // Rola o elemento para a posição calculada com animação suave.
    this.benefitsGrid.nativeElement.scroll({
      left: scrollAmount,
      behavior: 'smooth'
    });
    this.currentCardIndex = index; // Atualiza o índice do card atual.

    // Define a flag de animação como false e reinicia o autoplay após um pequeno atraso.
    this.isAnimating = false;
    this.startAutoplay();
  }

  // Método para rolar o carrossel para a esquerda.
  scrollLeft() {
    // Se uma animação estiver em andamento, não faz nada.
    if (this.isAnimating) return;
    this.isAnimating = true; // Define a flag de animação como true.

    this.stopAutoplay(); // Para o autoplay.

    const cardsToScroll = 1; // Rola apenas um card por vez.
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    const gapWidth = 15;
    const scrollAmount = (cardWidth + gapWidth) * cardsToScroll; // Calcula a quantidade de rolagem.

    // Rola o elemento para a esquerda.
    this.benefitsGrid.nativeElement.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });

    // Usa um setTimeout para verificar a posição após a animação de rolagem.
    setTimeout(() => {
      const currentScrollLeft = this.benefitsGrid.nativeElement.scrollLeft;
      // Se a rolagem atingir o início, "teleporta" para o meio dos cards duplicados para o loop.
      if (currentScrollLeft <= 0) {
        const totalWidth = this.benefitsGrid.nativeElement.scrollWidth;
        this.benefitsGrid.nativeElement.scrollLeft = totalWidth / 2;
      }
      this.updateIndicators(); // Atualiza os indicadores de navegação.
      this.isAnimating = false; // Define a flag de animação como false.
      this.startAutoplay(); // Reinicia o autoplay.
    }, 500); // Atraso de 500ms para aguardar a animação.
  }

  // Método para rolar o carrossel para a direita.
  scrollRight() {
    // Se uma animação estiver em andamento, não faz nada.
    if (this.isAnimating) return;
    this.isAnimating = true; // Define a flag de animação como true.
    this.stopAutoplay(); // Para o autoplay.

    const cardsToScroll = 1; // Rola apenas um card por vez.
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    const gapWidth = 15;
    const scrollAmount = (cardWidth + gapWidth) * cardsToScroll; // Calcula a quantidade de rolagem.

    // Rola o elemento para a direita.
    this.benefitsGrid.nativeElement.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    // Usa um setTimeout para verificar a posição após a animação de rolagem.
    setTimeout(() => {
      const currentScrollLeft = this.benefitsGrid.nativeElement.scrollLeft;
      const totalWidth = this.benefitsGrid.nativeElement.scrollWidth;
      // const clientWidth = this.benefitsGrid.nativeElement.clientWidth; // Variável não utilizada.

      // A correção para o loop infinito para a direita:
      // Se a rolagem ultrapassar o "meio" dos cards duplicados, "teleporta" para o início.
      if (currentScrollLeft >= (totalWidth / 2)) {
        this.benefitsGrid.nativeElement.scrollLeft = 0;
      }
      this.updateIndicators(); // Atualiza os indicadores de navegação.
      this.isAnimating = false; // Define a flag de animação como false.
      this.startAutoplay(); // Reinicia o autoplay.
    }, 500); // Atraso de 500ms para aguardar a animação.
  }
}