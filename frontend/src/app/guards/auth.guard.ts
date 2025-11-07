import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const loggedIn = this.authService.isLoggedIn();
    if (!loggedIn) {
      return this.router.createUrlTree(['/login']);
    }

    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    if (requiredRoles?.length) {
      const userProfile = this.authService.getUserProfile();
      if (!requiredRoles.includes(userProfile)) {
        return this.router.createUrlTree(['/']);
      }
    }

    return true;
  }
}
