import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-quadro-vantagens',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './quadro-vantagens.html',
  styleUrl: './quadro-vantagens.css'
})
export class QuadroVantagens implements AfterViewInit {
  @ViewChild('benefitsGrid') benefitsGrid!: ElementRef;
  /* viewchild é um decorador que consegue pegar como referencia o benefitsgrid*/

  private cardCount = 4; // total de cards que usei (nao conta os que eu dupliquei)
  private isAnimating = false; // evita que o clique seja mt rapido

  ngAfterViewInit() { /*isso me permite que o loop aconteça*/
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    //esse de cima (this benefit grid native) permite que acesse o elemento html que representa o carrossel
    //queryselector vai ser pra procurar o primeiro card dentro do carrossel
    // o ?.clientewidth vai ser pra acessar a largura do card, ? garante que o codigo nao vai falhar
    //meu ||0 vai ser se a largura do card nao fosse encontrada, ai levaria valor 0 nela.
    const gapWidth = 15;
    this.benefitsGrid.nativeElement.scrollLeft = (cardWidth + gapWidth) * this.cardCount; /* impressao de loop infinito */
  }

  // aqui terei a lógica para rolar para a esquerda
  scrollLeft() {
    if (this.isAnimating) return; /*se eu estiver rolando pra esquerda, nao acontece nada com o botao ate que eu aperte de novo nele */
    this.isAnimating = true; /* flag de quando clico no botao, avisando que houve um clique e que é pra iniciar o loop */
    
    const cardsToScroll = 2; //defino que serão 2 cards por vez
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    const gapWidth = 15;
    const scrollAmount = (cardWidth + gapWidth) * cardsToScroll; //pra calcular o valor total da rolagem
    //vou somar a largura de um card com espaçamento e multiplicar pelo numero de cards que vou rolar
    
    this.benefitsGrid.nativeElement.scrollBy({
      left: -scrollAmount, //rola pra esquerda
      behavior: 'smooth' //pra ser uma rolagem suave
    });
    
    // Lógica para teletransportar para o final para criar o loop
    setTimeout(() => {
      const currentScrollLeft = this.benefitsGrid.nativeElement.scrollLeft; //uso pra obter a posicao da rolagem atual
      const totalWidth = this.benefitsGrid.nativeElement.scrollWidth; //obter a rolagem de todo o carrossel
      
      if (currentScrollLeft <= 0) { //logica do loop infinito, que se for 0 ou menor, quer dizer que o carrossel chegou no inicio dos cards
        this.benefitsGrid.nativeElement.scrollLeft = totalWidth / 2; //move rapido para o inicio da segunda lista de cards
      }
      this.isAnimating = false; //desativa a flag pra que o proximo clique seja possivel
    }, 500); // 500ms- duração da animação 
  }

  // Lógica para rolar para a direita
  scrollRight() {
    if (this.isAnimating) return;/*se eu estiver rolando pra DIREITA, nao acontece nada com o botao ate que eu aperte de novo nele */
    this.isAnimating = true; /* flag de quando clico no botao, avisando que houve um clique e que é pra iniciar o loop */

    const cardsToScroll = 2; // 2 cards por vez
    const cardWidth = this.benefitsGrid.nativeElement.querySelector('.benefit-card')?.clientWidth || 0;
    //permite que acesse o elemento html que representa o carrossel
    //queryselector vai ser pra procurar o primeiro card dentro do carrossel
    // o ?.clientewidth vai ser pra acessar a largura do card, ? garante que o codigo nao vai falhar
    //meu ||0 vai ser se a largura do card nao fosse encontrada, ai levaria valor 0 nela.
    const gapWidth = 15;
    const scrollAmount = (cardWidth + gapWidth) * cardsToScroll;//pra calcular o valor total da rolagem
    //vou somar a largura de um card com espaçamento e multiplicar pelo numero de cards que vou rolar
    
    this.benefitsGrid.nativeElement.scrollBy({
      left: scrollAmount, //rola pra direita
      behavior: 'smooth'
    });

    
    setTimeout(() => {
      const currentScrollLeft = this.benefitsGrid.nativeElement.scrollLeft; //uso pra obter a posicao da rolagem atual
      const totalWidth = this.benefitsGrid.nativeElement.scrollWidth; //obter a rolagem de todo o carrossel
      const maxScroll = totalWidth - this.benefitsGrid.nativeElement.clientWidth; //calcula o valor max. da rolagem

      if (currentScrollLeft >= maxScroll) { //cria loop infinito
        this.benefitsGrid.nativeElement.scrollLeft = 0; //cria sensacao de loop, movendo o primeiro elemento da 2ª lista pra aparecer
      }
      this.isAnimating = false; //desativa a flag pra que o proximo clique seja possivel
    }, 500);
  }
}