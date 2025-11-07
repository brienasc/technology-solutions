import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CursoCard } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-curso-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curso-modal.html',
  styleUrls: ['./curso-modal.css']
})
export class CursoModalComponent implements OnInit {
  @Input() curso: CursoCard | null = null;
  @Input() isVisible: boolean = false;
  @Input() userPerfil: string = '';
  @Output() closeModal = new EventEmitter<void>();

  constructor(private router: Router) { }

  ngOnInit(): void {

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.onClose();
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onElaborarItens(): void {
    if (this.curso) {
      this.router.navigate(['/cursos/itens', this.curso.id]);
      this.onClose();
    }
  }

  onAvaliacoes(): void {
       if (this.curso && this.curso.id) {
      // ** CORREÇÃO APLICADA AQUI **
      // A rota deve ser: ['/cursos', ID_DO_CURSO, 'avaliacoes']
      const rota = ['/cursos', this.curso.id, 'avaliacoes'];
      
      console.log('[LOG: Navegando] Rota completa:', rota.join('/'));
      
      this.router.navigate(rota);
      this.onClose();
    } else {
      console.error('[LOG: Erro de Navegação] ID do curso ausente. A navegação para Avaliações foi bloqueada.');
    }
  }

  isAdmin(): boolean {
    return this.userPerfil === 'Administrador';
  }

  isElaborador(): boolean {
    return this.userPerfil === 'Elaborador de Itens';
  }
}
