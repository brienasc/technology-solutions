import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError } from 'rxjs';
import { ItemAvaliacao } from '../models/item-avaliacao.model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class CourseItemsService {
  private baseUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) { }

  getByCurso(cursoId: string): Observable<ItemAvaliacao[]> {
    return this.http
      .get<ApiResponse<ItemAvaliacao[]>>(`${this.baseUrl}/cursos/itens/${cursoId}`)
      .pipe(map(res => res?.data ?? []));
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/itens`, itemData)
      .pipe(map(res => res?.data));
  }

  saveDraft(itemData: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/itens/draft`, itemData)
      .pipe(map(res => res?.data));
  }

  getItem(itemId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/itens/${itemId}`)
      .pipe(map(res => res?.data));
  }

  updateItem(itemId: string, itemData: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/itens/${itemId}`, itemData)
      .pipe(map(res => res?.data));
  }

  deleteItem(itemId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/itens/${itemId}`)
      .pipe(map(() => void 0));
  }

  calibrateItem(itemId: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/itens/${itemId}/calibrate`, {})
      .pipe(
        map(res => {
          console.log('Resposta da API de calibração:', res);
          return res?.data || res;
        }),
        catchError(error => {
          console.error('Erro na requisição de calibração:', error);
          throw error;
        })
      );
  }
}
