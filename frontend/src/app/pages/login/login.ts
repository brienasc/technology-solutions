// src/app/pages/login/login.component.ts
import { CommonModule } from '@angular/common'; 
import { Component, OnInit, Renderer2, ElementRef} from '@angular/core';
// Importa os módulos necessários para formulários reativos e máscara
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask'; 
import { RouterLink } from '@angular/router'; // Importa RouterLink para usar a diretiva routerLink no HTML
import { AuthService } from '../../services/auth.service'; // Importa o serviço de autenticação

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
// }

// Decorador @Component: Metadata que define esta classe como um componente Angular.
@Component({
  selector: 'app-login', // O nome da tag HTML que representa este componente (ex: <app-login>).
  standalone: true, // Indica que este é um componente "standalone" (autônomo), que pode ser usado sem um NgModule.
  imports: [ // Array de módulos e componentes standalone que este componente utiliza diretamente em seu template ou lógica.
    CommonModule, // Contém diretivas comuns do Angular como ngIf, ngFor, ngClass.
    ReactiveFormsModule, // Módulo para usar os formulários reativos do Angular (FormGroup, FormControl).
    NgxMaskDirective, // Diretiva da biblioteca ngx-mask para aplicar máscaras em inputs.
    RouterLink // Importa RouterLink para usar a diretiva routerLink no HTML (links de navegação)
  ],
  templateUrl: './login.html', // Caminho para o arquivo HTML do template deste componente (relativo ao .ts).
  styleUrls: ['./login.css'] // Caminho para o arquivo CSS de estilos deste componente (relativo ao .ts).
})

// Classe LoginComponent: Define o comportamento e os dados do componente de login
// será executado uma vez após a inicialização do componente.
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Declaração do FormGroup que representará o formulário de login.
                         // O '!' informa ao TypeScript que 'loginForm' será inicializado em ngOnInit.
  isDarkTheme: boolean = false; // Propriedade para controlar o tema claro/escuro.
  passwordVisible: boolean = false; // Propriedade para controlar a visibilidade da senha.

  // Construtor do componente: Usado para injetar dependências.
  // private fb: FormBuilder: Injeta o serviço FormBuilder para construir o formulário reativo.
  // private router: Router: Injeta o serviço Router para navegação programática.
  // private renderer: Renderer2: Injeta Renderer2 para manipular classes CSS no DOM (para o tema).
  // private el: ElementRef: Injeta ElementRef para obter uma referência ao elemento DOM host do componente (para o tema).
  // private authService: AuthService: Injeta o serviço AuthService para lidar com a autenticação via API.
  constructor(private fb: FormBuilder, private router: Router, private renderer: Renderer2, private el: ElementRef, private authService: AuthService) {}

  // Método de ciclo de vida OnInit: Executado uma vez após a inicialização do componente.
  ngOnInit(): void {
    // Inicializa o 'loginForm' usando o FormBuilder.
    // Define os controles 'cpf' e 'password', com seus valores iniciais e validadores.
    this.loginForm = this.fb.group({
      cpf: ['', [Validators.required, cpfValidator]], // Campo CPF: obrigatório e usa o validador customizado 'cpfValidator'.
      password: ['', [
        Validators.required, // Campo Senha: obrigatório.
        Validators.minLength(8), // Senha deve ter no mínimo 8 caracteres.
        passwordStrengthValidator // Usa o validador customizado 'passwordStrengthValidator' para verificar a força da senha.
      ]]
    });

this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; 
    this.applyThemeClass(); 
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); 
  }

  // Aplica a classe 'dark-theme' ao document.body >>
  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
    }
 
  }

 
  // Método para alternar a visibilidade da senha no campo de input.
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible; // Inverte o estado da propriedade 'passwordVisible'.
  }

  // Método onLogin: Chamado quando o formulário é submetido (ex: ao clicar no botão 'Logar').
  onLogin(): void {
    // Verifica se o formulário é válido (todos os campos atendem às validações definidas).
    if (this.loginForm.valid) {
      // Desestrutura o objeto 'value' do formulário para obter os valores de 'cpf' e 'password'.
      const { cpf, password } = this.loginForm.value;
      console.log('Dados do login:', { cpf, password });

      // *** AQUI INTEGRARIA O SERVIÇO DE AUTENTICAÇÃO REAL ***
      // Este bloco de código faz a chamada real ao AuthService para autenticar o usuário.
      this.authService.login(cpf, password).subscribe(
        response => {
          console.log('Login bem-sucedido!', response);
          alert(response.message); // Exibe uma mensagem de sucesso (pode ser substituído por um modal).
          // Armazena tokens de acesso e habilidades do usuário no localStorage.
          localStorage.setItem('accessToken', response.data.token);
          localStorage.setItem('userAbilities', response.data.abilities);
          this.router.navigate(['/']); // Redireciona o usuário para a página inicial ('/').
        },
        error => {
          console.error('Erro no login: ', error);
          alert(error.error.message); // Exibe uma mensagem de erro para o usuário (pode ser substituído por um modal).
          // TODO: Melhorar a exibição de erros para o usuário.
        }
      );

   
    } else {
      // Se o formulário não for válido (algum campo não atende às validações):
      // Marca todos os controles do formulário como 'touched' (tocados).
      // Isso faz com que as mensagens de erro (definidas com *ngIf e .touched no HTML) sejam exibidas ao usuário.
      this.loginForm.markAllAsTouched();
      console.log('Formulário inválido, verifique os campos.'); // Loga no console que o formulário é inválido.
    }
  }
}

