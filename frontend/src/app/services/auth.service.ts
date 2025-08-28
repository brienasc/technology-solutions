// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; 

@Injectable({
  providedIn: 'root' // Disponível em toda a aplicação
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/login';

  constructor(private http: HttpClient) { }

  login(cpf: string, password: string): Observable<any> {
    // A API de backend deve esperar o CPF (sem máscara) e a senha
    const credentials = { cpf: cpf.replace(/[^\d]+/g, ''), password }; // Envia CPF sem máscara

    return this.http.post(this.apiUrl, credentials).pipe(
      tap((response: any) => {
        if (response && response.data.token) {
          localStorage.setItem('authToken', response.data.token); // Armazena o token
          localStorage.setItem('userAbilities', response.data.abilities); // Armazena abilities
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Remove o token
    localStorage.removeItem('userAbilities'); // Remove as habilidades
    localStorage.removeItem('userProfile'); // Remove o perfil (se estiver sendo salvo)
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); // Verifica se há um token
  }

  getToken(): string | null{
    return localStorage.getItem('authToken');
  }

/**
   * Obtém o perfil do usuário logado a partir das habilidades salvas no localStorage.
   * Adapta-se ao formato de string de habilidades (ex: "admin,rh,user").
   */
  getUserProfile(): string {
    const abilitiesString = localStorage.getItem('userAbilities');
    let profile = 'Convidado'; // Valor padrão
    if (abilitiesString) {
      const abilities = abilitiesString.split(','); // Divide a string em um array de habilidades
      
      // Verifica as habilidades com base no formato do backend
      if (abilities.includes('access:menu-gerencial') && abilities.includes('access:menu-convidar')) {
        // Se o usuário tem acesso a ambos os menus, assumimos que é Administrador
        profile = 'Administrador';
      } else if (abilities.includes('access:menu-convidar')) {
        // Se tem apenas acesso ao menu de convites, assumimos que é RH
        profile = 'RH';
      } else if (abilities.includes('access:menu-gerencial')) {
        // Se tem apenas acesso ao menu gerencial (mas não convites), pode ser outro tipo de admin ou user
        profile = 'Administrador'; // Ou 'Gerencial', dependendo da  regra de negócio
      } else {
        profile = 'Comum'; // Perfil padrão para outras habilidades
      }
    }
    return profile;
  }


  /**
   * Verifica se o usuário logado tem o perfil de Administrador.
   */
  isAdmin(): boolean {
    return this.getUserProfile() === 'Administrador';
  }

  /**
   * Verifica se o usuário logado tem o perfil de RH.
   */
  isRH(): boolean {
    return this.getUserProfile() === 'RH';
  }
  }
