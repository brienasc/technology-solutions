import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Curso } from '../interfaces/curso.interface';

type CursosIndexRaw = {
  status: 'success' | 'error';
  message?: string;
  data: {
    cursos: Curso[];
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

type ApiResponse<T> = {
  status: 'success' | 'error';
  message?: string;
  data: T;
  timestamp?: string;
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
    if (typeof status === 'boolean') params = params.set('status', String(status));

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

  getAllCursos(): Observable<Curso[]> {
    const params = new HttpParams().set('page', '1').set('per_page', '1000');
    return this.http.get<CursosIndexRaw>(this.apiUrl, { params }).pipe(
      map((res) => res.data.cursos)
    );
  }

  createCurso(curso: Omit<Curso, 'id' | 'data_criacao' | 'data_atualizacao'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, curso);
  }

  updateCurso(id: string, parcial: Partial<Curso>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, parcial);
  }

  deleteCurso(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getById(id: string): Observable<Pick<Curso, 'id' | 'nome'>> {
    return this.http
      .get<ApiResponse<Pick<Curso, 'id' | 'nome'>>>(`${this.apiUrl}/${id}/summary`)
      .pipe(map((res) => res.data));
  }
}
