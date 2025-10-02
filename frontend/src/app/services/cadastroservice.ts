import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CadastroService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  /**
   * Busca dados de endereço através de uma API de CEP.
   * @param cep é o CEP a ser consultado.
   * @returns Um Observable com os dados do endereço.
   */
  buscarEnderecoPorCep(cep: string): Observable<any> {
    //  chamada a uma API externa de CEP, a ViaCEP
    return this.http.get(`https://viacep.com.br/ws/${cep}/json/`);
  }

  /**
   * Envia os dados do formulário de cadastro para o backend, incluindo nome, e-mail,
   * CPF, endereço e a senha.
   * @param data Os dados do colaborador.
   * @returns Um Observable com a resposta da API.
   */
  cadastrarColaborador(data: any): Observable<any> {
    // 'data' contem todos os campos do formulário, incluindo a senha
    // A API Laravel recebe esses dados, valida e salva no banco
    return this.http.post(`${this.apiUrl}/colabs`, data);
  }

  /**
   * Valida o token de convite no backend.
   * @param token O token de convite do link.
   * @returns Um Observable com a resposta da API.
   */
  validarConvite(token: string): Observable<any> {
    // Chamada GET para o endpoint de validação de convite na API Laravel
    return this.http.get(`${this.apiUrl}/convites/${token}`);
  }
}
