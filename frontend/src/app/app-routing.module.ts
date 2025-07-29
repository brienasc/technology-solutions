// frontend/src/app/app-routing.module.ts

// Importa o tipo 'Routes' do Angular Router para tipar o array de rotas.
import { Routes } from '@angular/router'; 

// Importa todos os componentes de página que serão usados nas rotas.
// Os caminhos são relativos a 'src/app/' e incluem o sufixo '.component'.

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login';
//import { CadastroComponent } from './pages/cadastro/cadastro.component';
//import { ConvidarColaboradoresComponent } from './pages/convidar-colaboradores/convidar-colaboradores.component';
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial'; 

// Definição das rotas da aplicação.
// Cada objeto no array define uma rota:
// - 'path': O segmento da URL.
// - 'component': O componente Angular que será carregado quando essa URL for acessada.
export const routes: Routes = [
  { path: '', component: LandingPageComponent }, // Rota para a Landing Page (página inicial)
  { path: 'login', component: LoginComponent }, // Rota para a tela de Login
 // { path: 'cadastro', component: CadastroComponent }, // Rota para a tela de Cadastro
 // { path: 'convites', component: ConvidarColaboradoresComponent }, // Rota para Convites de Colaboradores
  { path: 'menu-gerencial', component: MenuGerencialComponent }, // Rota para o Painel Gerencial
  { path: '**', redirectTo: '' } // Rota coringa: Redireciona qualquer URL não mapeada para a Landing Page.
];

// Em projetos Angular modernos (Standalone Components, como o seu),
// não é mais necessário um AppRoutingModule com @NgModule para definir as rotas.
// As rotas são providas diretamente no main.ts (ou app.config.ts) usando provideRouter(routes).
// Por isso, o bloco @NgModule que você tinha comentado não é mais usado neste contexto.