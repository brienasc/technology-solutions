// curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Curso } from '../interfaces/curso.interface';

type CursosIndexRaw = {
  status: 'success' | 'error';
  message?: string;
  data: {
    cursos: Curso[];          // vindo do backend
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  timestamp?: string;
};

export type CursosIndex = {
  cursos: Curso[];
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

@Injectable({ providedIn: 'root' })
export class CursoService {
  private apiUrl = 'http://localhost:8080/api/cursos';

  constructor(private http: HttpClient) { }

  getCursos(page = 1, perPage = 10, nome = '', status?: boolean): Observable<CursosIndex> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    if (nome && nome.trim()) params = params.set('nome', nome.trim());
    if (typeof status === 'boolean') params = params.set('status', String(status)); // 'true' | 'false'

    return this.http.get<CursosIndexRaw>(this.apiUrl, { params }).pipe(
      map((res) => ({
        cursos: res.data.cursos,
        currentPage: res.data.current_page,
        perPage: res.data.per_page,
        total: res.data.total,
        lastPage: res.data.last_page,
      }))
    );
  }

  /** POST /api/cursos */
  createCurso(curso: Omit<Curso, 'id' | 'data_criacao' | 'data_atualizacao'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, curso);
  }

  /** PATCH /api/cursos/{id} (parcial) */
  updateCurso(id: string, parcial: Partial<Curso>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, parcial);
  }

  /** DELETE /api/cursos/{id} */
  deleteCurso(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

}
