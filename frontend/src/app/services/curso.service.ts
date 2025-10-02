import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../interfaces/curso.interface';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = 'http://localhost:8080/api/cursos';

  constructor(private http: HttpClient) { }

  // Método para buscar todos os cursos
  getCursos(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('per_page', pageSize.toString());
    
    if (search.trim()) {
      params = params.set('nome', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Método para buscar resumo dos cursos (para dropdowns)
  getCursosSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }

  // Método para criar um novo curso
  createCurso(curso: Omit<Curso, 'id' | 'data_criacao' | 'data_atualizacao'>): Observable<any> {
    const cursoData = {
      nome: curso.nome,
      descricao: curso.descricao || '',
      carga_horaria: curso.carga_horaria,
      status: curso.status === 'Ativo' ? true : false
    };
    
    return this.http.post<any>(this.apiUrl, cursoData);
  }

  // Método para atualizar um curso
  updateCurso(id: string, curso: Partial<Curso>): Observable<any> {
    const cursoData: any = {};
    
    if (curso.nome) cursoData.nome = curso.nome;
    if (curso.descricao !== undefined) cursoData.descricao = curso.descricao;
    if (curso.carga_horaria) cursoData.carga_horaria = curso.carga_horaria;
    if (curso.status) cursoData.status = curso.status === 'Ativo' ? true : false
    
    return this.http.patch<any>(`${this.apiUrl}/${id}`, cursoData);
  }

  // Método para deletar um curso
  deleteCurso(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}