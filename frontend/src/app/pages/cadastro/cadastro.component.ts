import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Removido o RouterLink
import { CadastroService } from '../../services/cadastroservice';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxMaskDirective,
  ],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {
  cadastroForm: FormGroup;
  conviteValido: boolean | null = null; // null: carregando, true: válido, false: inválido
  mensagemErro = '';
  isDarkTheme = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cadastroService: CadastroService
  ) {
    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      // campo de e-mail é pré-preenchido e não editável
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^\d{11}$/)]],
      cep: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^\d{8}$/)]],
      uf: ['', [Validators.required]],
      localidade: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      celular: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^\d{11}$/)]],
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.cadastroService.validarConvite(token).subscribe({
        next: (response: any) => {
          this.conviteValido = true;
          this.cadastroForm.patchValue({ email: response.email });
        },
        error: (error: any) => {
          this.conviteValido = false;
          // Exibe a mensagem de erro específica do backend ou uma genérica
          this.mensagemErro = error.error.message || 'Convite expirado ou inválido.';
        }
      });
    } else {
      this.conviteValido = false;
      this.mensagemErro = 'Nenhum token de convite fornecido. Por favor, acesse o link enviado por e-mail.';
    }

    //  autocompletar CEP
    this.cadastroForm.get('cep')?.valueChanges.subscribe(cep => {
      // Remove caracteres não numéricos para verificar o comprimento
      const cepLimpo = cep ? cep.replace(/\D/g, '') : '';
      if (cepLimpo.length === 8) {
        this.cadastroService.buscarEnderecoPorCep(cepLimpo).subscribe({
          next: (dados: any) => {
            this.cadastroForm.patchValue({
              uf: dados.uf,
              localidade: dados.localidade,
              bairro: dados.bairro,
              logradouro: dados.logradouro
            });
          },
          error: () => {
            // Limpa os campos de endereço se o CEP não for encontrado
            this.cadastroForm.patchValue({ uf: '', localidade: '', bairro: '', logradouro: '' });
          }
        });
      }
    });
  }

  onSubmit(): void {
    // para enviar o e-mail que está desabilitado, é preciso obter o valor cru do formulário
    const formData = this.cadastroForm.getRawValue();
    const token = this.route.snapshot.paramMap.get('token');
    
    // Adiciona o token e o e-mail ao objeto a ser enviado
    const cadastroData = { ...formData, token };
    
    if (this.cadastroForm.valid) {
      this.cadastroService.cadastrarColaborador(cadastroData).subscribe({
        next: (response: any) => {
          console.log('Cadastro realizado com sucesso!', response);
          this.router.navigate(['/sucesso']);
        },
        error: (error: any) => {
          // Captura e exibe a mensagem de erro do backend (ex: CPF duplicado)
          this.mensagemErro = error.error.message || 'Erro ao realizar o cadastro. Tente novamente.';
          console.error('Erro no cadastro:', error);
        }
      });
    } else {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios corretamente.';
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
