import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    RouterLink
  ],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {
  cadastroForm: FormGroup;
  conviteValido = false;
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
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      // Removendo o validador de pattern, a máscara do NgxMask já garante o formato.
      cpf: ['', [Validators.required]],
      // Removendo o validador de pattern, a máscara do NgxMask já garante o formato.
      cep: ['', [Validators.required]],
      uf: [{ value: '', disabled: false }, [Validators.required]],
      localidade: [{ value: '', disabled: false }, [Validators.required]],
      bairro: [{ value: '', disabled: false }, [Validators.required]],
      logradouro: [{ value: '', disabled: false }, [Validators.required]],
      numero: ['', [Validators.required]],
      celular: ['', [Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.cadastroService.validarConvite(token).subscribe(
          (response: any) => {
            this.conviteValido = true;
            this.cadastroForm.patchValue({ email: response.email });
          },
          (error: any) => {
            this.conviteValido = false;
            this.mensagemErro = error.error.message || 'Convite expirado ou inválido.';
          }
        );
      }
    });

    this.cadastroForm.get('cep')?.valueChanges.subscribe(cep => {
      // Remove a máscara para verificar o comprimento do CEP
      const cepLimpo = cep ? cep.replace(/\D/g, '') : '';
      if (cepLimpo.length === 8) {
        this.cadastroService.buscarEnderecoPorCep(cepLimpo).subscribe(
          (dados: any) => {
            this.cadastroForm.patchValue({
              uf: dados.uf,
              localidade: dados.localidade,
              bairro: dados.bairro,
              logradouro: dados.logradouro
            });
          },
          (error: any) => {
            // Limpa os campos de endereço em caso de erro na busca
            this.cadastroForm.patchValue({ uf: '', localidade: '', bairro: '', logradouro: '' });
          }
        );
      }
    });
  }

  onSubmit(): void {
    if (this.cadastroForm.valid) {
      this.cadastroService.cadastrarColaborador(this.cadastroForm.value).subscribe(
        (response: any) => {
          console.log('Cadastro realizado com sucesso!', response);
          // Substituindo o 'alert' por um console.log, conforme boas práticas.
          console.log('Cadastro realizado com sucesso!');
          this.router.navigate(['/sucesso']);
        },
        (error: any) => {
          this.mensagemErro = error.error.message || 'Erro ao realizar o cadastro. Tente novamente.';
        }
      );
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
