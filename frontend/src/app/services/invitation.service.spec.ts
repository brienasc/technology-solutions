// frontend/src/app/services/invitation.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { InvitationService } from './invitation.service';

describe('InvitationService', () => {
  let service: InvitationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Módulo de teste para simular requisições HTTP
      providers: [InvitationService]
    });
    service = TestBed.inject(InvitationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Garante que não haja requisições HTTP pendentes após cada teste
  afterEach(() => {
    httpTestingController.verify();
  });

  // Teste 1: Verifica se o serviço foi criado corretamente
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Teste 2: Verifica a chamada GET para buscar convites
  it('should get invitations with correct parameters', () => {
    // Dados simulados que a API retornaria
    const mockInvitations = [
      { id: 1, email: 'test1@mail.com', sentDate: '2025-01-01', expirationDate: '2025-01-02', status: 'Em Aberto' }
    ];

    // Chama o método do serviço
    service.getInvitations(1, 10, 'all', 'test').subscribe(response => {
      // Verifica se a resposta é a esperada
      expect(response).toEqual(mockInvitations);
    });

    // Simula a requisição HTTP e verifica se a URL está correta
    const req = httpTestingController.expectOne(req => 
      req.url.includes('https://localhost:8080/api/convites') && 
      req.params.get('page') === '1' &&
      req.params.get('pageSize') === '10' &&
      req.params.get('email') === 'test'
    );
    expect(req.request.method).toEqual('GET');

    // Fornece os dados simulados como resposta
    req.flush(mockInvitations);
  });

  // Teste 3: Verifica a chamada POST para criar um novo convite
  it('should create an invitation with correct parameters', () => {
    const mockResponse = { message: 'Convite criado com sucesso!' };
    const testEmail = 'new_convite@mail.com';

    service.createInvitation(testEmail).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('https://localhost:8080/api/convites');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ email: testEmail });
    
    req.flush(mockResponse);
  });
});
