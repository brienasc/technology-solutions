import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CadastroService } from '../../services/cadastroservice';
import { CommonModule } from '@angular/common'; // Necessário para diretivas como ngIf e ngClass

@Component({
  selector: 'app-cadastro',
  // Se o componente é standalone, ele precisa importar ReactiveFormsModule
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule // CommonModule para ngIf e ngClass
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
    const senhaPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      uf: [{ value: '', disabled: false }, [Validators.required]],
      localidade: [{ value: '', disabled: false }, [Validators.required]],
      bairro: [{ value: '', disabled: false }, [Validators.required]],
      logradouro: [{ value: '', disabled: false }, [Validators.required]],
      celular: ['', [Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      senha: ['', [Validators.required, Validators.pattern(senhaPattern)]]
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
      if (this.cadastroForm.get('cep')?.valid) {
        this.cadastroService.buscarEnderecoPorCep(cep).subscribe(
          (dados: any) => {
            this.cadastroForm.patchValue({
              uf: dados.uf,
              localidade: dados.localidade,
              bairro: dados.bairro,
              logradouro: dados.logradouro
            });
          },
          (error: any) => {
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
          alert('Cadastro realizado com sucesso!');
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
