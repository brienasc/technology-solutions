import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Matrix, MatrixDetail } from '../models/matrix.model';
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

  getMatrix(id: string): Observable<MatrixDetail> {
    let params = new HttpParams().set('include', 'categorias.competencias,funcoes.subfuncoes,conhecimentos,cruzamentos');
    
    return this.http.get<any>(`/api/matrizes/${id}`, { params }).pipe(
      map(res => this.adaptMatrixDetail(res?.data ?? res))
    );
  }

  deleteMatrix(id: string): Observable<void> {
    return this.http.delete<void>(`/api/matrizes/${id}`);
  }

  importMatrix(formData: FormData) {
    return this.http.post('/api/matrizes', formData);
  }

  private adaptPaginated(api: any): Paginated<Matrix> {
    return {
      data: (api.matrices ?? []).map((m: any) => this.adaptMatrix(m)),
      current_page: api.current_page,
      per_page: api.per_page,
      total: api.total,
      last_page: api.last_page
    };
  }

  private adaptMatrix(m: any): Matrix {
    return {
      id: m.id,
      name: m.nome,
      version: m.versao,
      courseName: m.curso?.nome || '',
      validFrom: m.vigencia?.de ?? null,
      validTo: m.vigencia?.ate ?? null,
    };
  }

  private adaptMatrixDetail(raw: any): MatrixDetail {
    return {
      id: raw.id,
      name: raw.nome ?? '—',
      version: raw.versao ?? '—',
      courseName: raw.curso?.nome ?? null,
      validFrom: raw.vigencia?.de ?? null,
      validTo: raw.vigencia?.ate ?? null,
      categorias: (raw.categorias ?? []).map((cat: any) => ({
        id: cat.id,
        nome: cat.nome,
        competencias: (cat.competencias ?? []).map((c: any) => ({
          id: c.id,
          nome: c.nome
        }))
      })),
      funcoes: (raw.funcoes ?? []).map((f: any) => ({
        id: f.id,
        nome: f.nome,
        subfuncoes: (f.subfuncoes ?? []).map((s: any) => ({
          id: s.id,
          nome: s.nome
        }))
      })),
      conhecimentos: (raw.conhecimentos ?? []).map((k: any) => ({
        id: k.id,
        nome: k.nome,
        codigo: k.codigo
      })),
      cruzamentos: (raw.cruzamentos ?? []).map((c: any) => ({
        id: c.id,
        matriz_id: c.matriz_id,
        subfuncao_id: c.subfuncao_id,
        competencia_id: c.competencia_id,
        conhecimento_id: c.conhecimento_id
      }))
    };
  }
}

