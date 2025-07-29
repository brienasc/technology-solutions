import { Routes } from '@angular/router';

// frontend/src/app/app-routing.ts
import { LoginComponent } from './pages/login/login'; 
import { MenuGerencialComponent } from './pages/menu-gerencial/menu-gerencial';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

export const routes: Routes = [
  // ... outras rotas
  { path: '', component: LandingPageComponent},
  { path: 'login', component: LoginComponent }, 
  { path: 'menu-gerencial', component: MenuGerencialComponent },
  { path: '**', redirectTo: '' }
  // ...
];