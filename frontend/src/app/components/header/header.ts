import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, Renderer2, ElementRef, HostListener } from '@angular/core';
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
export class Header implements OnInit {

  isDarkTheme: boolean = false;
  isMobileMenuOpen: boolean = false;
  isLoggedIn: boolean = false;

  // PROPRIEDADES PARA USUÁRIO LOGADO
  isSidebarOpen = false;
  userName = '';
  userEmail = '';
  userProfile = '';

  constructor(
    private renderer: Renderer2, 
    private el: ElementRef, 
    private router: Router, 
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyThemeClass();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadUserData();
    
    if (this.isLoggedIn) {
        this.applyBodyClass();
    }
    
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
            this.loadUserData();
            this.applyBodyClass();
        } else {
            this.isSidebarOpen = false;
            this.userName = '';
            this.userEmail = '';
            this.userProfile = '';
            this.removeBodyClass();
        }
    });
  }

  // MÉTODO DE RESIZE
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
      if (this.isLoggedIn) {
          if (event.target.innerWidth > 767) {
              this.renderer.addClass(document.body, 'has-sidebar');
          } else {
              this.renderer.removeClass(document.body, 'has-sidebar');
          }
      }
  }

  private applyBodyClass(): void {
    if (window.innerWidth > 767) {
        this.renderer.addClass(document.body, 'has-sidebar');
    }
  }

  private removeBodyClass(): void {
    this.renderer.removeClass(document.body, 'has-sidebar');
  }

  loadUserData() {
    const userData = this.authService.getCurrentUser();
    if (userData) {
      this.userName = userData.name || 'Usuário';
      this.userEmail = userData.email || '';
      this.userProfile = userData.profile || this.authService.getUserProfile();
    } else {
      this.userName = 'Usuário';
      this.userEmail = '';
      this.userProfile = this.authService.getUserProfile() || 'Comum';
    }

    if (this.userName === 'Usuário' || !this.userName) {
      const profile = this.authService.getUserProfile();
      if (profile && profile !== 'Comum') {
        this.userName = `Usuário ${profile}`;
      }
    }
  }

  getInitials(): string {
    if (!this.userName || this.userName === 'Usuário') {
      return 'U';
    }
    
    return this.userName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleMobileMenu(): void {
    if (this.isLoggedIn && window.innerWidth <= 767) {
        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    } else if (!this.isLoggedIn) {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Método que ALTERNA O TEMA
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyThemeClass();
    this.applyMobileMenuTheme();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
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

  navigateToHome(): void {
    this.closeMobileMenu();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  navigateToLogin(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  navigateToAbout(): void {
    this.closeMobileMenu();
    const element = document.getElementById('sobre-nos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToContact(): void {
    this.closeMobileMenu();
    const element = document.getElementById('contato');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isSidebarOpen = false;
    this.userName = '';
    this.userEmail = '';
    this.userProfile = '';
    this.router.navigate(['/']);
  }

  onMenuGerencialClick(): void {
    this.router.navigate(['/menu-gerencial']);
  }

  onConvitesClick(): void {
    this.closeMobileMenu();
    this.router.navigate(['/convites']);
  }

  goToCursos(): void {
    this.closeMobileMenu();
    this.router.navigate(['/cursos']);
  }

  goToMatrizes(): void {
    this.closeMobileMenu();
    this.router.navigate(['/matrizes']);
  }

}

