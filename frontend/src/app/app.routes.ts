import { Routes } from '@angular/router';

// frontend/src/app/app-routing.ts
import { LoginComponent } from './pages/login/login';
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ConvitesComponent } from './pages/convites/convites';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { CursosComponent } from './pages/cursos/cursos';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MatricesPageComponent } from './pages/matrices/matrices-page.component';

export const routes: Routes = [
  // ... outras rotas
  {
    path: '',
    component: LandingPageComponent
  }, // Rota para a Landing Page (página inicial)

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
    data: { preventLoggedInAccess: true }
  },
  {
    path: 'menu-gerencial',
    component: MenuGerencialComponent,
    canActivate: [AuthGuard], // Aplica o guarda de rota
    data: { roles: ['Administrador', 'RH'] } // Define os perfis necessários
  },
  {
    path: 'convites',
    component: ConvitesComponent,
    canActivate: [AuthGuard], // Aplica o guarda de rota
    data: { roles: ['Administrador', 'RH'] } // Define os perfis necessários
  },
  {
    path: 'cadastro/:token',
    component: CadastroComponent
  },
  {
    path: 'cursos',
    component: CursosComponent
  },
  {
    path: 'matrizes',
    component: MatricesPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  } // Rota coringa: Redireciona qualquer URL não mapeada para a Landing Page.
  // ...
];
