import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Curso } from '../interfaces/curso.interface';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = 'http://localhost:8080/api/cursos';

  constructor(private http: HttpClient) { }

  // Método para buscar todos os cursos
  getCursos(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    // Mock data para desenvolvimento - remover quando API estiver pronta
    const mockCursos: Curso[] = [
      {
        id: '1',
        nome: 'Desenvolvimento Web Full Stack',
        descricao: 'Curso completo de desenvolvimento web com tecnologias modernas',
        carga_horaria: 320,
        status: 'Ativo',
        data_criacao: '2024-01-15',
        data_atualizacao: '2024-01-15'
      },
      {
        id: '2',
        nome: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Curso técnico em análise e desenvolvimento de sistemas',
        carga_horaria: 280,
        status: 'Ativo',
        data_criacao: '2024-02-01',
        data_atualizacao: '2024-02-01'
      },
      {
        id: '3',
        nome: 'Ciência da Computação',
        descricao: 'Graduação em Ciência da Computação',
        carga_horaria: 480,
        status: 'Ativo',
        data_criacao: '2024-01-20',
        data_atualizacao: '2024-01-20'
      },
      {
        id: '4',
        nome: 'Marketing Digital',
        descricao: 'Curso de especialização em marketing digital',
        carga_horaria: 160,
        status: 'Inativo',
        data_criacao: '2024-03-01',
        data_atualizacao: '2024-03-15'
      }
    ];

    // Filtrar por busca se houver termo
    let filteredCursos = mockCursos;
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filteredCursos = mockCursos.filter(curso => 
        curso.nome.toLowerCase().includes(searchTerm) ||
        curso.descricao?.toLowerCase().includes(searchTerm)
      );
    }

    // Simular paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCursos = filteredCursos.slice(startIndex, endIndex);

    return of({
      status: 'success',
      data: {
        cursos: paginatedCursos,
        total: filteredCursos.length,
        page: page,
        pageSize: pageSize
      }
    });
  }

  // Método para criar um novo curso
  createCurso(curso: Omit<Curso, 'id' | 'data_criacao' | 'data_atualizacao'>): Observable<any> {
    // Mock - quando API estiver pronta, usar:
    // return this.http.post<any>(this.apiUrl, curso);
    
    return of({
      status: 'success',
      message: 'Curso criado com sucesso!',
      data: {
        id: Date.now().toString(),
        ...curso,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      }
    });
  }

  // Método para atualizar um curso
  updateCurso(id: string, curso: Partial<Curso>): Observable<any> {
    // Mock - quando API estiver pronta, usar:
    // return this.http.put<any>(`${this.apiUrl}/${id}`, curso);
    
    return of({
      status: 'success',
      message: 'Curso atualizado com sucesso!'
    });
  }

  // Método para deletar um curso
  deleteCurso(id: string): Observable<any> {
    // Mock - quando API estiver pronta, usar:
    // return this.http.delete<any>(`${this.apiUrl}/${id}`);
    
    return of({
      status: 'success',
      message: 'Curso deletado com sucesso!'
    });
  }
}