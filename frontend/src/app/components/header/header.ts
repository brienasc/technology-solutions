import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef} from '@angular/core'; 
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    CommonModule 
  ],
  templateUrl: './header.html', 
  styleUrls: ['./header.css'] 
})
export class Header implements OnInit { // << usarei o OnInit que importei

  isDarkTheme: boolean = false; // Propriedade para controlar o tema, vai armazenar como ta o estado atual do tema
  isMobileMenuOpen: boolean = false;
  isLoggedIn: boolean = false;

  // agora uso private renderer para adicionar ou remover classes diretamente do body da pagina
  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, public authService: AuthService) { } 

  ngOnInit(): void { // aqui vou assumir o tema claro por padrão, mas carregar o dark quando for preciso
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass(); //aplico
    this.isLoggedIn = this.authService.isLoggedIn()
  }

  // Método que ALTERNA O TEMA
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // inverto o estado do tema
    this.applyThemeClass(); // aplico a classe CSS dele
    this.applyMobileMenuTheme();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Salvo o que será usado agora, se é o dark ou light
  }

  // Método que adiciona ou remove o dark do body, usando o renderer2 para garantir que é seguro
  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Adiciona a classe 'dark-theme' ao body
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Remove a classe 'dark-theme' do body
    }
  }

  private applyMobileMenuTheme() {
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement;
    const isDark = document.body.classList.contains('dark-theme');
    
    if (mobileMenu) {
      if (isDark) {
        mobileMenu.style.setProperty('background', '#1a1a1a', 'important');
        mobileMenu.style.setProperty('color', '#ffffff', 'important');
      } else {
        mobileMenu.style.setProperty('background', '#ffffff', 'important');
        mobileMenu.style.setProperty('color', '#1a1a1a', 'important');
      }
    }
  }

  // Toggle do menu mobile
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Previne scroll quando menu está aberto
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  // Fechar menu mobile ao clicar em um link
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Navegação para home 
  navigateToHome(): void {
    this.closeMobileMenu();
    // VERIFICAÇÃO: Se o usuário estiver logado, redireciona para /cursos (podemos mudar isso depois p qual)
  if (this.authService.isLoggedIn()) {
    // Redirecionar para a rota administrativa (Cursos)
    this.router.navigate(['/cursos']);
  } else {
    // Se deslogado, volta para a Landing Page principal (/)
    this.router.navigate(['/']);
  }
  }

  // Outros métodos de navegação (caso precise usar programaticamente)
  navigateToLogin(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  navigateToAbout(): void {
    this.closeMobileMenu();
    // Scroll para seção sobre nós
    const element = document.getElementById('sobre-nos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToContact(): void {
    this.closeMobileMenu();
    // Scroll para rodapé/contato
    const element = document.getElementById('contato');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  

  onLogout(): void {
     // 1. Limpa o token e o estado de login (mantendo sua lógica atual)
  this.authService.logout();
  this.isLoggedIn = false;
  
  // 2. Redireciona o usuário para a Landing Page principal (/)
  this.router.navigate(['/']);
  //   this.authService.logout();
  //   this.isLoggedIn = false;
 }

  onMenuGerencialClick(): void {
    this.router.navigate(['/menu-gerencial']);
  }

  // Método para navegar para a tela de convites >>
  onConvitesClick(): void {
    this.closeMobileMenu();
    this.router.navigate(['/convites']);
  }

  goToCursos(): void {
    this.closeMobileMenu();
    this.router.navigate(['/cursos']);
  }
}

