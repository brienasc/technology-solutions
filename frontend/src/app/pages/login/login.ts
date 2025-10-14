import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessibilityBarComponent } from '../../components/accessibility-bar/accessibility-bar';
import { AlertModalComponent } from '../../components/alert/alert.component';

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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, RouterLink, AccessibilityBarComponent, AlertModalComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isDarkTheme = false;
  passwordVisible = false;

  showAlert = false;
  alertTitle = '';
  alertMessage = '';
  alertVariant: AlertVariant = 'neutral';
  alertActions: AlertAction[] = [{ id: 'ok', label: 'OK', kind: 'primary', autofocus: true }];
  private pendingNav: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private renderer: Renderer2, private el: ElementRef, private authService: AuthService) { }

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
        this.pendingNav = '/cursos';
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
