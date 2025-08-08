// frontend/src/app/services/invitation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Adicionado 'of' para simulação
import { delay } from 'rxjs/operators';
import { Invitation } from '../interfaces/invitation.interface'; // Importa a interface

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  // URL da sua API real (para futura integração)
  private apiUrl = 'https://localhost:8080/api/convites'; 

  // Mock de dados para simular a base de dados
  // Estes dados são usados para testar os cenários BDD.
  private invitations: Invitation[] = [
    // Cenário 1: Listagem Completa + Cenário 3: Filtro por Status (Finalizado)
    { id: 1, email: 'joao.silva@tech.com', sentDate: '2025-07-28T10:00:00Z', expirationDate: '2025-07-29T10:00:00Z', status: 'Finalizado' },
    { id: 2, email: 'maria.gomes@tech.com', sentDate: '2025-07-31T12:00:00Z', expirationDate: '2025-08-01T12:00:00Z', status: 'Em Aberto' },
    
    // Cenário 2: Atualização Automática de Status (Vencido)
    // Este convite será 'Em Aberto' no início, mas 'Vencido' após a lógica do service
    { id: 3, email: 'carlos.santos@tech.com', sentDate: new Date(new Date().getTime() - 48 * 60 * 60 * 1000).toISOString(), expirationDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), status: 'Em Aberto' }, // Enviado há 48h, expira em 24h (já vencido)
    
    // Cenário 3: Filtro por Status (Em Aberto) + Cenário 4: Busca por E-mail
    { id: 4, email: 'ana.pereira@tech.com', sentDate: '2025-08-01T14:00:00Z', expirationDate: '2025-08-02T14:00:00Z', status: 'Em Aberto' },
    { id: 5, email: 'bruno.costa@tech.com', sentDate: '2025-08-02T10:00:00Z', expirationDate: '2025-08-03T10:00:00Z', status: 'Em Aberto' },
    { id: 6, email: 'fernanda.lima@tech.com', sentDate: '2025-08-02T11:00:00Z', expirationDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), status: 'Em Aberto' }, // Futuro (ainda não vencido)
    
    // Mais dados para paginação e busca
    { id: 7, email: 'gustavo.alves@tech.com', sentDate: '2025-07-29T09:00:00Z', expirationDate: '2025-07-30T09:00:00Z', status: 'Finalizado' },
    { id: 8, email: 'helena.souza@tech.com', sentDate: '2025-07-25T15:00:00Z', expirationDate: '2025-07-26T15:00:00Z', status: 'Vencido' },
    { id: 9, email: 'igor.rocha@tech.com', sentDate: '2025-08-03T09:00:00Z', expirationDate: '2025-08-04T09:00:00Z', status: 'Em Aberto' },
    { id: 10, email: 'juliana.melo@tech.com', sentDate: '2025-08-03T10:00:00Z', expirationDate: '2025-08-04T10:00:00Z', status: 'Finalizado' },
    { id: 11, email: 'pedro.lima@tech.com', sentDate: '2025-08-04T10:00:00Z', expirationDate: '2025-08-05T10:00:00Z', status: 'Em Aberto' },
    { id: 12, email: 'paula.costa@tech.com', sentDate: '2025-08-04T11:00:00Z', expirationDate: '2025-08-05T11:00:00Z', status: 'Em Aberto' },
    { id: 13, email: 'rafael.silva@tech.com', sentDate: '2025-08-01T07:00:00Z', expirationDate: '2025-08-02T07:00:00Z', status: 'Vencido' },
  ];

  constructor(private http: HttpClient) {
    // Atualiza o status de convites vencidos no mock ao inicializar o serviço
    this.updateExpiredInvitationsMock();
  }

  /**
   * Lógica para atualizar o status de convites vencidos no mock de dados.
   * Verifica se a data de expiração passou e o status ainda é 'Em Aberto'.
   */
  private updateExpiredInvitationsMock(): void {
    const now = new Date();
    this.invitations.forEach(invitation => {
      // Converte a string de data para objeto Date para comparação
      const expirationDate = new Date(invitation.expirationDate);
      if (invitation.status === 'Em Aberto' && expirationDate < now) {
        invitation.status = 'Vencido';
      }
    });
  }

  /**
   * Simula a busca de convites da API.
   * Aplica filtros e paginação nos dados mock para testar o frontend.
   * @param page Número da página atual.
   * @param pageSize Quantidade de itens por página.
   * @param status Status para filtrar (opcional).
   * @param email E-mail para buscar (opcional).
   * @returns Um Observable que emite um objeto com 'data' (convites paginados) e 'meta' (informações de paginação).
   */
  getInvitations(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    email?: string
  ): Observable<any> {
    let filteredInvitations = [...this.invitations]; // Copia para não modificar o array original

    // Aplica filtro por status
    if (status && status !== 'all') {
      filteredInvitations = filteredInvitations.filter(inv => inv.status === status);
    }

    // Aplica filtro por e-mail (case-insensitive)
    if (email) {
      filteredInvitations = filteredInvitations.filter(inv => 
        inv.email.toLowerCase().includes(email.toLowerCase())
      );
    }

    // Lógica de paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedInvitations = filteredInvitations.slice(startIndex, endIndex);

    // Simula a resposta da API com dados e metadados de paginação
    return of({
      data: paginatedInvitations,
      meta: {
        total: filteredInvitations.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredInvitations.length / pageSize)
      }
    }).pipe(delay(500)); // Simula um tempo de carregamento de 0.5s
  }

  /**
   * Simula a criação de um novo convite.
   * @param email O e-mail do novo convidado.
   * @returns Um Observable que emite uma mensagem de sucesso e os dados do novo convite.
   */
  createInvitation(email: string): Observable<any> {
    const newId = this.invitations.length > 0 ? Math.max(...this.invitations.map(inv => inv.id)) + 1 : 1;
    const now = new Date();
    const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Expira em 24 horas

    const newInvitation: Invitation = {
      id: newId,
      email: email,
      sentDate: now.toISOString(),
      expirationDate: expiration.toISOString(),
      status: 'Em Aberto'
    };
    this.invitations.push(newInvitation); // Adiciona ao mock
    return of({ message: 'Convite criado com sucesso!', data: newInvitation }).pipe(delay(500));
  }
}


// VOLTAR COM ESSE COD DEPOIS DE TA OK COM OS DADOS DE CONVITE

// // frontend/src/app/services/invitation.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// // << IMPORTAÇÃO CORRETA >>
// import { Invitation } from '../interfaces/invitation.interface'; 

// @Injectable({
//   providedIn: 'root'
// })
// export class InvitationService {
//   // Simula a URL da API do seu colega
//   private apiUrl = 'https://localhost:8080/api/convites'; 
  
//   constructor(private http: HttpClient) { }

//   // Método para buscar convites da API com filtros e paginação
//   getInvitations(
//     page: number = 1,
//     pageSize: number = 10,
//     status?: string,
//     email?: string
//   ): Observable<any> {
//     let params = new HttpParams();
//     params = params.set('page', page.toString());
//     params = params.set('pageSize', pageSize.toString());

//     if (status && status !== 'all') {
//       params = params.set('status', status);
//     }
//     if (email) {
//       params = params.set('email', email);
//     }

//     // Faz a requisição GET para a API com os parâmetros de filtro e paginação
//     return this.http.get<any>(this.apiUrl, { params });
//   }

//   // Método para criar um novo convite (exemplo de chamada POST)
//   createInvitation(email: string): Observable<any> {
//     const payload = { email };
//     // Faz a requisição POST para a API
//     return this.http.post<any>(this.apiUrl, payload);
//   }
// }
