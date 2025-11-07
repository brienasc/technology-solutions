import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, take, catchError, finalize, EMPTY, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiLoginUrl = 'http://localhost:8080/api/login';
  private apiAuthUrl = 'http://localhost:8080/api/auth';
  private validating = false;
  private lastValidation = 0;
  private validationTtlMs = 5 * 60 * 1000;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(cpf: string, password: string): Observable<any> {
    const credentials = { cpf: cpf.replace(/[^\d]+/g, ''), password };
    return this.http.post(this.apiLoginUrl, credentials).pipe(
      tap((response: any) => {
        const data = response?.data ?? response;
        const token = data?.token;
        if (token) localStorage.setItem('authToken', token);
        
        const abilities = data?.abilities;
        if (abilities) localStorage.setItem('userAbilities', Array.isArray(abilities) ? abilities.join(',') : String(abilities));
        
        const profile = data?.profile ?? data?.perfil ?? null;
        const profileCode = profile?.code ?? profile?.codigo ?? data?.role ?? null;
        const profileLabel = profile?.label ?? data?.role_label ?? (typeof data?.role === 'string' ? data.role : null);
        
        if (profileLabel) localStorage.setItem('userProfile', String(profileLabel));
        if (profileCode != null) localStorage.setItem('userProfileCode', String(profileCode));

        const userData = {
          name: data?.name || data?.nome || data?.usuario?.name || data?.usuario?.nome || 'Usuário',
          email: data?.email || data?.usuario?.email || '',
          cpf: data?.cpf || data?.usuario?.cpf || cpf,
          profile: profileLabel,
          profileCode: profileCode
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAbilities');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfileCode');
    localStorage.removeItem('userData');

    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const now = Date.now();
    if (!this.validating && now - this.lastValidation > this.validationTtlMs) this.validateSession(token);
    return true;
  }

  getUserProfile(): string {
    const cached = localStorage.getItem('userProfile');
    if (cached) return cached;
    this.isLoggedIn();
    return 'Comum';
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        return null;
      }
    }
    return null;
  }

  isAdmin(): boolean {
    const p = (localStorage.getItem('userProfile') || '').toLowerCase();
    const c = (localStorage.getItem('userProfileCode') || '').toLowerCase();
    return p === 'administrador' || p === 'admin' || c === 'admin';
  }

  isRH(): boolean {
    const p = (localStorage.getItem('userProfile') || '').toLowerCase();
    const c = (localStorage.getItem('userProfileCode') || '').toLowerCase();
    return p === 'rh' || c === 'rh';
  }

  isElaborador(): boolean {
    const p = (localStorage.getItem('userProfile') || '').toLowerCase();
    const c = (localStorage.getItem('userProfileCode') || '').toLowerCase();
    return p === 'elaborador de itens' || 
           p === 'elaborador' || 
           c === 'elaborador' || 
           c === 'elaborador_itens';
  }

  canAccessAvaliacoes(): boolean {
    return this.isAdmin() || this.isRH() || this.isElaborador();
  }

  canManageCursos(): boolean {
    return this.isAdmin() || this.isRH();
  }

  canManageMatrizes(): boolean {
    return this.isAdmin();
  }

  hasAccess(requiredRoles: string[]): boolean {
    const userProfile = this.getUserProfile();
    return requiredRoles.some(role => 
      userProfile.toLowerCase().includes(role.toLowerCase())
    );
  }

  private validateSession(token: string): void {
    this.validating = true;
    this.lastValidation = Date.now();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get(this.apiAuthUrl, { headers }).pipe(
      take(1),
      catchError(() => {
        this.logout();
        return EMPTY;
      }),
      finalize(() => (this.validating = false))
    ).subscribe((resp: any) => {
      const data = resp?.data ?? resp;
      const abilities = data?.abilities ?? [];

      if (abilities) {
        localStorage.setItem('userAbilities', Array.isArray(abilities) ? abilities.join(',') : String(abilities));
      }

      const profile = data?.profile ?? data?.perfil ?? null;
      const profileCode = profile?.code ?? profile?.codigo ?? data?.role ?? null;
      const profileLabel = profile?.label ?? data?.role_label ?? (typeof data?.role === 'string' ? data.role : null);

      if (profileLabel) {
        localStorage.setItem('userProfile', String(profileLabel));
      }
      if (profileCode != null) {
        localStorage.setItem('userProfileCode', String(profileCode));
      }

      const existingUserData = localStorage.getItem('userData');
      if (existingUserData && data) {
        try {
          const userData = JSON.parse(existingUserData);
          userData.profile = profileLabel;
          userData.profileCode = profileCode;
          
          if (data.name || data.nome) userData.name = data.name || data.nome;
          if (data.email) userData.email = data.email;
          
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
          console.error('Erro ao atualizar dados do usuário:', error);
        }
      }
    });
  }
}
