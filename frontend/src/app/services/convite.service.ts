/* filepath: frontend/src/app/services/convites.service.ts */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConvitesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/convites';

  enviarConvite(email: string): Observable<any> {
    const body = { email: email };
    return this.http.post(this.apiUrl, body);
  }

  // Método para buscar todos os convites
  buscarConvites(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}