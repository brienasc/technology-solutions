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

  constructor(private router: Router) {}

  ngOnInit(): void {
    
    // Fechar modal com ESC
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
      this.router.navigate(['/elaboracao-itens', this.curso.id]);
      this.onClose();
    }
  }

  onAvaliacoes(): void {
    if (this.curso) {
      this.router.navigate(['/avaliacoes', this.curso.id]);
      this.onClose();
    }
  }

  isAdmin(): boolean {
    return this.userPerfil === 'Administrador';
  }

  isElaborador(): boolean {
    return this.userPerfil === 'Elaborador de Itens';
  }
}