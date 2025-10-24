import { Routes } from '@angular/router';

<<<<<<< HEAD
import { LoginComponent } from './pages/login/login';
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ConvitesComponent } from './pages/convites/convites';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { CursosComponent } from './pages/cursos/cursos';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AvaliacoesComponent } from './pages/avaliacoes/avaliacoes';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MatricesPageComponent } from './pages/matrices/matrices-page.component';
import { CursoItensComponent } from './pages/curso-itens/curso-itens.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
    data: { preventLoggedInAccess: true }
  },
  {
    path: 'menu-gerencial',
    component: MenuGerencialComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'convites',
    component: ConvitesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'cadastro/:token',
    component: CadastroComponent
  },
  {
    path: 'cursos',
    component: CursosComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'matrizes',
    component: MatricesPageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'cursos/itens/:id',
    component: CursoItensComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  { path: 'cursos/:id/avaliacoes', 
    component: AvaliacoesComponent,
    canActivate: [AuthGuard] 
   },
  {
    path: '**',
    redirectTo: ''
  }
=======
// export const routes: Routes = [];

// frontend/src/app/app-routing.ts
import { LoginComponent } from './pages/login/login'; 
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial';

export const routes: Routes = [
  // ... outras rotas
  { path: 'login', component: LoginComponent }, 
  { path: 'menu-gerencial', component: MenuGerencialComponent },
  { path: '**', redirectTo: '' }
  // ...
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997
];
