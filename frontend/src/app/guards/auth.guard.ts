// frontend/src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('--- AuthGuard: Tentando ativar rota ---');
    console.log('Rota:', route.routeConfig?.path);

    // 1. Verifica se o usuário está logado
    const loggedIn = this.authService.isLoggedIn();
    console.log('Usuário está logado?', loggedIn);
    if (!loggedIn) {
      alert('Você precisa estar logado para acessar esta página.');
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Se o usuário está logado, verifica as permissões (roles/abilities)
    const requiredRoles = route.data['roles'] as Array<string>;
    const userProfile = this.authService.getUserProfile();

    console.log('Perfis exigidos pela rota:', requiredRoles);
    console.log('Perfil do usuário logado:', userProfile);

    if (requiredRoles && requiredRoles.length > 0) {
      // Verifica se o perfil do usuário está entre os perfis permitidos para esta rota
      if (!requiredRoles.includes(userProfile)) {
        alert('Você não tem permissão para acessar esta página.');
        this.router.navigate(['/']); // Redireciona para a home se não tiver permissão
        console.log('Acesso NEGADO: Perfil não autorizado.');
        return false;
      }
    }

    console.log('Acesso PERMITIDO: Usuário logado e perfil autorizado.');
    return true; // Permite o acesso se todas as verificações passarem
  }
}

