import { Component } from '@angular/core';
import { Header } from "../../components/header/header";
import { CommonModule } from '@angular/common';
import { Vagas } from "../../components/vagas/vagas";
import { HeroSection } from '../../components/hero-section/hero-section';
import { QuadroVantagens } from '../../components/quadro-vantagens/quadro-vantagens';
import { SecaoSobreNos } from '../../components/secao-sobre-nos/secao-sobre-nos';
import { Rodape } from '../../components/rodape/rodape';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Vagas, CommonModule, HeroSection,
    QuadroVantagens, SecaoSobreNos, Rodape

  ],
  providers: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
