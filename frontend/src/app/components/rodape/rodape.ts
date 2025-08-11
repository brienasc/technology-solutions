import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // HttpClient para fazer requisições HTTP


@Component({
  selector: 'app-rodape',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rodape.html',
  styleUrl: './rodape.css'
})
export class Rodape implements OnInit {
  contactForm!: FormGroup;
  isSubmitted = false;
  
  // pro usuário ter um feedback se teve sucesso ou nao
  submissionMessage: string | null = null;
  isSuccess = false;

  // colocando o HttpClient no construtor para poder fazer chamadas à API
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.contactForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
    });
  }
  // função pra esperar a resposta do servidor
  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.submissionMessage = null; // limpar a mensagem de feedback anterior

    if (this.contactForm.valid) {  // servirá pra pegar os dados do formulário
      const formData = this.contactForm.value;
      const apiUrl = '/api/contact-form'; //  URL do endpoint no back-end

      try {// Faz uma requisição POST com os dados do formulário
        await this.http.post(apiUrl, formData).toPromise();

        // Se a requisição for bem-sucedida
        this.submissionMessage = 'Sua mensagem foi enviada com sucesso!';
        this.isSuccess = true;
        this.contactForm.reset();
        this.isSubmitted = false;
      } catch (error) {
        // Se houver um erro na requisição 
        this.submissionMessage = 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde. ';
        this.isSuccess = false;
        console.error('Erro ao enviar formulário:', error);
      }
    } else {
      // Se o formulário for inválido, não acontece nada
      console.log('Formulário inválido');      // vai exibir as mensagens de erro
    }
  }
}