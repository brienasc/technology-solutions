import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

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

export interface Avaliacao {
  id: string;
  nome: string;
  curso_id: string;
  curso_nome?: string;
  matriz_id: string;
  matriz_nome?: string;
  quantidade_itens: number;
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  tipo: 'prova' | 'simulado' | 'atividade';
  data_criacao: string;
  data_agendada?: string;
  tempo_duracao?: number; // em minutos
  alunos_previstos?: number;
  alunos_realizados?: number;
  distribuicao?: {
    facil_muito_facil_qtd: number;
    media_qtd: number;
    dificil_muito_dificil_qtd: number;
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

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private apiUrl = '/api/avaliacoes'; // URL API real
  
  constructor(private http: HttpClient) { }

  private getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  criarAvaliacao(payload: CriarAvaliacaoPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro detalhado na criação:', error);
        // Extraindo a mensagem de erro específica
        let mensagemEspecifica = 'Erro ao criar avaliação.';
        
        if (error.error) {
          if (error.error.message) {
            mensagemEspecifica = error.error.message;
          }
          else if (error.error.data && typeof error.error.data === 'object') {
            const primeiroErro = Object.values(error.error.data)[0];
            if (Array.isArray(primeiroErro)) {
              mensagemEspecifica = primeiroErro[0];
            }
          }
          else if (typeof error.error === 'string') {
            mensagemEspecifica = error.error;
          }
        }

        // Criar um erro customizado com a mensagem específica
        const erroCustomizado = {
          ...error,
          mensagemUsuario: mensagemEspecifica
        };
        
        return throwError(() => erroCustomizado);
      })
    );
  }

  getAvaliacoesPorCurso(cursoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/curso/${cursoId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.status === 'success' && response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            return {
              ...response,
              data: response.data.data
            };
          }
          if (Array.isArray(response.data)) {
            return response;
          }
        }
        
        return {
          status: 'success',
          data: [],
          message: 'Nenhuma avaliação encontrada'
        };
      }),
      catchError(error => {
        console.error('Erro no getAvaliacoesPorCurso:', error);
        return throwError(() => error);
      })
    );
  }

  getAvaliacoes(params?: { page?: number; perPage?: number; status?: string; search?: string }): Observable<PaginatedResponse<Avaliacao>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PaginatedResponse<Avaliacao>>(this.apiUrl, { params: httpParams })
      .pipe(
        timeout(10000),
        map(response => this.adaptPaginatedResponse(response)),
        catchError(this.handleError)
      );
  }

  getAvaliacaoById(id: string): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(10000),
        map(avaliacao => this.adaptAvaliacao(avaliacao)),
        catchError(this.handleError)
      );
  }

  atualizarAvaliacao(id: string, payload: Partial<Avaliacao>): Observable<Avaliacao> {
    return this.http.put<Avaliacao>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        timeout(15000),
        map(avaliacao => this.adaptAvaliacao(avaliacao)),
        catchError(this.handleError)
      );
  }

  excluirAvaliacao(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  private adaptPaginatedResponse(response: any): PaginatedResponse<Avaliacao> {
    return {
      data: (response.data || []).map((item: any) => this.adaptAvaliacao(item)),
      current_page: response.current_page || 1,
      per_page: response.per_page || 10,
      total: response.total || 0,
      last_page: response.last_page || 1
    };
  }

  private adaptAvaliacao(data: any): Avaliacao {
    return {
      id: data.id,
      nome: data.nome,
      curso_id: data.curso_id,
      curso_nome: data.curso?.nome || data.curso_nome,
      matriz_id: data.matriz_id,
      matriz_nome: data.matriz?.nome || data.matriz_nome,
      quantidade_itens: data.quantidade_itens || 0,
      status: data.status || 'rascunho',
      tipo: data.tipo || 'prova',
      data_criacao: data.data_criacao,
      data_agendada: data.data_agendada,
      tempo_duracao: data.tempo_duracao,
      alunos_previstos: data.alunos_previstos,
      alunos_realizados: data.alunos_realizados,
      distribuicao: data.distribuicao
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos enviados para o servidor.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 409:
          errorMessage = 'Já existe uma avaliação com este nome.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}