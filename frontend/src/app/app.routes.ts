import { Routes } from '@angular/router';

// export const routes: Routes = [];

// frontend/src/app/app-routing.ts
import { LoginComponent } from './pages/login/login'; 

export const routes: Routes = [
  // ... outras rotas
  { path: 'login', component: LoginComponent }, 
  // ...
];
