import { Routes } from '@angular/router';

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
];
