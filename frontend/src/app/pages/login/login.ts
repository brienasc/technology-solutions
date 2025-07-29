
// src/app/pages/login/login.component.ts
import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core';
// Importa os módulos necessários para formulários reativos e máscara
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask'; 

// *** VALIDADORES CUSTOMIZADOS ***
// Validador de CPF
// Validador de CPF: Verifica se o valor inserido é um CPF válido.
function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = control.value?.replace(/[^\d]+/g, ''); // Remove máscara

//Linhas de Log para Depuração
  console.log('--- Validador CPF ---'); // Marcador para o início da validação
  console.log('Valor original do campo (com máscara):', control.value);
  console.log('CPF sem máscara (após replace):', cpf);
  console.log('Tamanho do CPF sem máscara:', cpf.length);
  // ---------------------------------------------------------------------


// Verifica se o campo CPF está vazio.
// Se estiver vazio, retorna 'null', indicando que a validação customizada não encontrou erro.
// A validação de campo obrigatório (Validators.required) cuida da obrigatoriedade.
  if (!cpf) {
    console.log('CPF vazio. Retornando null (válido para validação de obrigatoriedade).');
    return null; 
  }
  
  // Verifica se o CPF tem 11 dígitos e se não são todos iguais (ex: "11111111111"). Se forem iguais, retorna invalidação.
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    console.log('CPF não tem 11 dígitos ou tem todos os dígitos iguais.');
    return { cpfInvalido: true };
  }

  let sum; //soma dos produtos dos dígitos.
  let remainder; //  o resto da divisão.
  
// --- Validação do Primeiro Dígito Verificador ---
  sum = 0; // Reinicia a soma.
  // Itera sobre os primeiros 9 dígitos do CPF.
  // Multiplica cada dígito por um peso decrescente (10 a 2) e soma os resultados.
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  // Calcula o resto da divisão da soma por 11, e depois multiplica por 10 e pega o resto por 11 novamente.
  remainder = (sum * 10) % 11;
  
  // --- Linhas de Log para Depuração ---
  console.log('Primeiro dígito verificador calculado (remainder):', remainder);
  console.log('Primeiro dígito verificador no CPF (charAt 9):', parseInt(cpf.charAt(9)));
  // ------------------------------------

  // Se o resto for 10 ou 11, o dígito verificador é 0 (regra padrão do CPF).
  if (remainder === 10 || remainder === 11) {
    remainder = 0; 
  }
  // Compara o dígito verificador calculado com o 10º dígito real do CPF.
  if (remainder !== parseInt(cpf.charAt(9))) { 
    console.log('Primeiro dígito verificador não corresponde!');
    return { cpfInvalido: true }; // Retorna erro se não coincidir.
  }

  // Validação do Segundo Dígito Verificador 
  sum = 0; // Reinicia a soma para o cálculo do segundo dígito.
  // Itera sobre os primeiros 10 dígitos do CPF (incluindo o primeiro dígito verificador já validado).
  // Multiplica cada dígito por um peso decrescente (11 a 2) e soma os resultados.
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11; // Calcula o resto da divisão da soma por 11.
  
  //Log para Depuração ---
  console.log('Segundo dígito verificador calculado (remainder):', remainder);
  console.log('Segundo dígito verificador no CPF (charAt 10):', parseInt(cpf.charAt(10)));
  // ------------------------------------

  // Se o resto for 10 ou 11, o dígito verificador é 0.
  if (remainder === 10 || remainder === 11) {
    remainder = 0; 
  }
  // Compara o dígito verificador calculado com o 11º dígito real do CPF.
  if (remainder !== parseInt(cpf.charAt(10))) { 
    console.log('Segundo dígito verificador não corresponde!');
    return { cpfInvalido: true }; // Retorna erro se não coincidir.
  }

  // Se todas as verificações passarem, o CPF é considerado válido.
  console.log('CPF validado com sucesso! Retornando null.');
  return null; // Retorna null para indicar que não há erros de validação.
}


// Validador de Força da Senha:
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value || ''; // Pega o valor da senha ou uma string vazia se for nulo.
  const errors: { [key: string]: boolean } = {}; 

  // Se a senha estiver vazia, não retorna erro aqui.
  if (!password) {
    return null; 
  }

   // Verifica se a senha contém pelo menos uma letra maiúscula, minúscula, número e caractere especial.
   //
  errors['hasUpperCase'] = /[A-Z]+/.test(password); 
  errors['hasLowerCase'] = /[a-z]+/.test(password); 
  errors['hasNumeric'] = /[0-9]+/.test(password); 
  errors['hasSpecialChar'] = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password); 

  const isValid = errors['hasUpperCase'] && errors['hasLowerCase'] && errors['hasNumeric'] && errors['hasSpecialChar']; 

  return isValid ? null : { passwordStrength: errors };
}

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [ 
    CommonModule, 
    ReactiveFormsModule, 
    NgxMaskDirective 
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

//Contém a lógica e os dados do componente de login.
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; //  ! para dizer ao TypeScript que será inicializado em ngOnInit

  // Injete o FormBuilder para criar o formulário reativo
  // Injete o Router para navegação após o login
  // Injete o AuthService quando criá-lo (para fazer a chamada de API)
  constructor(private fb: FormBuilder, private router: Router /*, private authService: AuthService */) {}

  ngOnInit(): void {
    // Inicializa o formulário com os controles e validadores
    this.loginForm = this.fb.group({
      cpf: ['', [Validators.required, cpfValidator]], // CPF obrigatório e validação de CPF
      password: ['', [
        Validators.required,
        Validators.minLength(8), // Mínimo 8 caracteres
        passwordStrengthValidator // Validador de força da senha
      ]]
    });
  }

  onLogin(): void {
    // Verifica se o formulário é válido antes de tentar logar
    if (this.loginForm.valid) {
      const { cpf, password } = this.loginForm.value;
      console.log('Dados do login:', { cpf, password });

      // *** AQUI INTEGRARIA O SERVIÇO DE AUTENTICAÇÃO ***
      // Exemplo:
      /*
      this.authService.login(cpf, password).subscribe(
        response => {
          console.log('Login bem-sucedido!', response);
          // Armazenar token, redirecionar
          this.router.navigate(['/menu-gerencial']);
        },
        error => {
          console.error('Erro no login:', error);
          // Exibir mensagem de erro para o usuário
        }
      );
      */

      // *** SIMULAÇÃO DE LOGIN PARA TESTE LOCAL ***
          if (cpf === '98765432100' && password === 'Senha+123') { 
            alert('Login de teste bem-sucedido! Redirecionando...');
            this.router.navigate(['/menu-gerencial']);
          } else {
            alert('Login de teste falhou. Verifique CPF ou senha (987.654.321-00 / Senha+123)'); // Aqui pode deixar com máscara para o alerta
          }

          } else {
            // Se o formulário não for válido, será marcado todos os campos como "touched"
            // para exibir as mensagens de erro
            this.loginForm.markAllAsTouched();
            console.log('Formulário inválido, verifique os campos.');
          }
  }
}