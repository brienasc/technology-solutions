import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
<<<<<<< HEAD
import { NgxMaskDirective } from 'ngx-mask';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';
import { AlertModalComponent } from '../../components/alert/alert.component';
=======
import { NgxMaskDirective } from 'ngx-mask'; 
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997

function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = control.value?.replace(/[^\d]+/g, '');
  if (!cpf) return null;
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { cpfInvalido: true };
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return { cpfInvalido: true };
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return { cpfInvalido: true };
  return null;
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value || '';
  if (!password) return null;
  const ok = /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return ok ? null : { passwordStrength: true };
}

type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type AlertAction = { id: string; label: string; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; autofocus?: boolean };

@Component({
  selector: 'app-login',
<<<<<<< HEAD
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, RouterLink, AccessibilityBarComponent, AlertModalComponent],
=======
  standalone: true, 
  imports: [ 
    CommonModule, 
    ReactiveFormsModule, 
    NgxMaskDirective 
  ],
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isDarkTheme = false;
  passwordVisible = false;

<<<<<<< HEAD
  showAlert = false;
  alertTitle = '';
  alertMessage = '';
  alertVariant: AlertVariant = 'neutral';
  alertActions: AlertAction[] = [{ id: 'ok', label: 'OK', kind: 'primary', autofocus: true }];
  private pendingNav: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private renderer: Renderer2, private el: ElementRef, private authService: AuthService) { }
=======
  // Injete o FormBuilder para criar o formulário reativo
  // Injete o Router para navegação após o login
  // Injete o AuthService quando criá-lo (para fazer a chamada de API)
  constructor(private fb: FormBuilder, private router: Router /*, private authService: AuthService */) {}
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      cpf: ['', [Validators.required, cpfValidator]],
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]]
    });
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyThemeClass();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyThemeClass(): void {
    if (this.isDarkTheme) this.renderer.addClass(document.body, 'dark-theme');
    else this.renderer.removeClass(document.body, 'dark-theme');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {
<<<<<<< HEAD
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { cpf, password } = this.loginForm.value;
    this.authService.login(cpf, password).subscribe({
      next: () => {
        this.alertVariant = 'success';
        this.alertTitle = 'Login';
        this.alertMessage = 'Autenticação realizada com sucesso.';
        this.pendingNav = '/dashboard';
        this.showAlert = true;
      },
      error: (error) => {
        this.alertVariant = 'danger';
        this.alertTitle = 'Falha no login';
        this.alertMessage = this.humanizeLoginError(error);
        this.pendingNav = null;
        this.showAlert = true;
      }
    });
=======
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
>>>>>>> 70dba4379e0e55209f107b33a041cce7fcd12997
  }

  onAlertAction(ev: AlertAction): void {
    this.showAlert = false;
    const nav = this.pendingNav;
    this.pendingNav = null;
    if (nav) this.router.navigate([nav]);
  }

  onAlertClosed(): void {
    this.showAlert = false;
    const nav = this.pendingNav;
    this.pendingNav = null;
    if (nav) this.router.navigate([nav]);
  }

  private humanizeLoginError(err: any): string {
    if (err?.status === 401 || err?.status === 403) return 'CPF ou senha inválidos.';
    if (err?.name === 'TimeoutError') return 'Tempo de conexão esgotado. Tente novamente.';
    return 'Não foi possível realizar o login. Tente novamente em instantes.';
  }
}
