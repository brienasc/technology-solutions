import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, take, catchError, finalize, EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
<<<<<<< HEAD
  private apiLoginUrl = 'http://localhost:8080/api/login';
  private apiAuthUrl = 'http://localhost:8080/api/auth';
  private validating = false;
  private lastValidation = 0;
  private validationTtlMs = 5 * 60 * 1000;
=======
  private apiUrl = 'URL_DA_API/login'; // Substuir pela URL real da sua API de login da do backend
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997

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
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAbilities');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfileCode');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
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
    });
  }
}
