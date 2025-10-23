import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CriarAvaliacaoPayload {
  nome: string;
  curso_id: string;
  matriz_id: string;
  quantidade_itens: number;
  distribuicao: {
    facil_muito_facil_qtd: number;
    media_qtd: number;
    dificil_muito_dificil_qtd: number;
    distribuicao_percentual: {
      facil_muito_facil: number;
      media: number;
      dificil_muito_dificil: number;
    };
  };
}

export interface AvaliacaoResponse {
  id: string;
  nome: string;
  curso_id: string;
  matriz_id: string;
  status: string;
  data_criacao: string;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private apiUrl = '/api/avaliacoes'; 

  constructor(private http: HttpClient) { }

  criarAvaliacao(payload: CriarAvaliacaoPayload): Observable<AvaliacaoResponse> {
    return this.http.post<AvaliacaoResponse>(this.apiUrl, payload);
  }
}