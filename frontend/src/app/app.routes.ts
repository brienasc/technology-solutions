import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ConvitesComponent } from './pages/convites/convites';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { CursosComponent } from './pages/cursos/cursos';
import { DashboardComponent } from './pages/dashboard/dashboard';

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
  {
    path: '**',
    redirectTo: ''
  }
];
