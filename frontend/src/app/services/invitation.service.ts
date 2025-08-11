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
  private apiUrl = 'http://localhost:8080/api/convites'; 
  
  constructor(private http: HttpClient) { }

  getInvitations(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    email?: string
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('per_page', pageSize.toString());

    enum StatusEnum {
      'em aberto' = 0,
      'finalizado' = 1,
      'vencido' = 2
    }

    let statusCode = undefined

    if(status !== undefined){
      statusCode = StatusEnum[status.toLowerCase() as keyof typeof StatusEnum];
    }
    
    if (statusCode !== undefined) {
      params = params.set('status', statusCode);
    }
    if (email) {
      params = params.set('email', email);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  createInvitation(email: string): Observable<any> {
    const payload = { email };
    return this.http.post<any>(this.apiUrl, payload);
  }
}
