// frontend/src/app/services/invitation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// << IMPORTAÇÃO CORRETA >>
import { Invitation } from '../interfaces/invitation.interface'; 

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  // Simula a URL da API do seu colega
  private apiUrl = 'http://localhost:8080/api/convites'; 
  
  constructor(private http: HttpClient) { }

  // Método para buscar convites da API com filtros e paginação
  getInvitations(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    email?: string
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('per_page', pageSize.toString());

    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    if (email) {
      params = params.set('email', email);
    }

    // Faz a requisição GET para a API com os parâmetros de filtro e paginação
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Método para criar um novo convite (exemplo de chamada POST)
  createInvitation(email: string): Observable<any> {
    const payload = { email };
    // Faz a requisição POST para a API
    return this.http.post<any>(this.apiUrl, payload);
  }
}
