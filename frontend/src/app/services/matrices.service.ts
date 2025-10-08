import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Matrix } from '../models/matrix.model';
import { Paginated } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class MatricesService {
  constructor(private http: HttpClient) { }

  getMatrices(params: { include?: string[]; page?: number; perPage?: number; q?: string }): Observable<Paginated<Matrix>> {
    let p = new HttpParams();
    if (params.perPage) p = p.set('per_page', params.perPage);
    if (params.page) p = p.set('page', params.page);
    if (params.include?.length) p = p.set('include', params.include.join(','));
    if (params.q) p = p.set('q', params.q);
    return this.http.get<any>('/api/matrizes', { params: p }).pipe(map(r => this.adaptPaginated(r.data ?? r)));
  }

  getMatrix(id: string, include?: string[]): Observable<Matrix> {
    console.log(include)
    let p = new HttpParams();
    if (include?.length) p = p.set('include', include.join(','));
    return this.http.get<any>(`/api/matrizes/${id}`, { params: p }).pipe(map(r => this.adaptMatrix(r.data ?? r)));
  }

  deleteMatrix(id: string): Observable<void> {
    return this.http.delete<void>(`/api/matrizes/${id}`);
  }

  private adaptPaginated(api: any): Paginated<Matrix> {
    console.log(api)
    return {
      data: (api.matrices ?? []).map((m: any) => this.adaptMatrix(m)),
      current_page: api.current_page,
      per_page: api.per_page,
      total: api.total,
      last_page: api.last_page
    };
  }

  private adaptMatrix(m: any): Matrix {
    console.log(m)
    return {
      id: m.id,
      name: m.nome,
      version: m.versao,
      courseName: m.curso.nome,
      validFrom: m.vigencia.de ?? null,
      validTo: m.vigencia.ate ?? null,
    };
  }
}

