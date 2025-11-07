import { Component } from '@angular/core';
import { Header } from "../../components/header/header";
import { CommonModule } from '@angular/common';
import { Vagas } from "../../components/vagas/vagas";
import { HeroSection } from '../../components/hero-section/hero-section';
import { SobreComponent } from '../../components/sobre/sobre';
import { SecaoSobreNos } from '../../components/secao-sobre-nos/secao-sobre-nos';
import { Rodape } from '../../components/rodape/rodape';
import { Funcionalidades } from "../../components/funcionalidades/funcionalidades";
import { Formulariocontato } from "../../components/formulariocontato/formulariocontato";
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Vagas, CommonModule, HeroSection,
    SobreComponent, SecaoSobreNos, Rodape, Funcionalidades, Formulariocontato, AccessibilityBarComponent],
  providers: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
