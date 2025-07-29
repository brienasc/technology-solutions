// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; 

@Injectable({
  providedIn: 'root' // Disponível em toda a aplicação
})
export class AuthService {
  private apiUrl = 'URL_DA_API/login'; // Substuir pela URL real da sua API de login da do backend

  constructor(private http: HttpClient) { }

  login(cpf: string, password: string): Observable<any> {
    // A API de backend deve esperar o CPF (sem máscara) e a senha
    const credentials = { cpf: cpf.replace(/[^\d]+/g, ''), password }; // Envia CPF sem máscara

    return this.http.post(this.apiUrl, credentials).pipe(
      tap((response: any) => {
        // Supondo que a API retorna um token ou dados do usuário
        if (response && response.token) {
          localStorage.setItem('authToken', response.token); // Armazena o token
        }
        // Aqui pode armazenar mais informações do usuário se a API retornar
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Remove o token
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); // Verifica se há um token
  }
}