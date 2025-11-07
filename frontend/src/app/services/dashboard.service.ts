import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardData, CursoCard } from '../interfaces/dashboard.interface';

type DashboardResponse = {
  status: 'success' | 'error';
  message?: string;
  data: {
    cursos: CursoCard[];
    perfil: string;
    total_cursos: number;
  };
  timestamp?: string;
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`, { 
      headers: this.getHeaders() 
    }).pipe(
      map((res) => ({
        cursos: res.data.cursos,
        perfil: res.data.perfil as 'Administrador' | 'Elaborador de Itens',
        total_cursos: res.data.total_cursos
      }))
    );
  }

  getCursoDetalhes(cursoId: string): Observable<CursoCard> {
    return this.http.get<{ data: CursoCard }>(`${this.apiUrl}/cursos/${cursoId}/detalhes`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(res => res.data)
    );
  }
}