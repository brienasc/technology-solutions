// frontend/src/app/app-routing.module.ts

 import { Routes } from '@angular/router'; 
//import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login';
//import { CadastroComponent } from './pages/cadastro/cadastro.component';
//import { ConvidarColaboradoresComponent } from './pages/convidar-colaboradores/convidar-colaboradores.component';
//import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial.component';


// Definição das rotas (este bloco está correto e deve permanecer)
export const routes: Routes = [
 // { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
 //{ path: 'cadastro', component: CadastroComponent },
  //{ path: 'convites', component: ConvidarColaboradoresComponent },
 //{ path: 'menu-gerencial', component: MenuGerencialComponent },
  { path: '**', redirectTo: '' } // Rota coringa para redirecionar
];





//  import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class App {
//   protected title = 'frontend-app';
// }
 

/* import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login.component';
import { ConvidarColaboradoresComponent } from './pages/convidar-colaboradores/convidar-colaboradores.component';
// ... e assim por diante

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'convites', component: ConvidarColaboradoresComponent },
  { path: 'menu-gerencial', component: MenuGerencialComponent },
  { path: '**', redirectTo: '' } // Rota coringa para redirecionar
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {} */