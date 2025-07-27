import { Component } from '@angular/core';
import { ListaColaboradoresComponent } from "../../components/lista-colaboradores/lista-colaboradores";

@Component({
  selector: 'app-menu-gerencial',
  imports: [ListaColaboradoresComponent],
  templateUrl: './menu-gerencial.html',
  styleUrl: './menu-gerencial.css'
})
export class MenuGerencialComponent {

}
