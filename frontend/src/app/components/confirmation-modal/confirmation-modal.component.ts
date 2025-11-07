import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.show]="show" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="icon-container" [ngClass]="'icon-' + type">
            <svg *ngIf="type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg *ngIf="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <svg *ngIf="type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <h3>{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
          <div class="item-info" *ngIf="itemInfo">
            <strong>{{ itemInfo }}</strong>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="onCancel()"
            [disabled]="loading">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            class="btn"
            [ngClass]="'btn-' + type"
            (click)="onConfirm()"
            [disabled]="loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Aguarde...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {
  @Input() show = false;
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() title = 'Confirmar ação';
  @Input() message = 'Deseja continuar?';
  @Input() itemInfo = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() loading = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
    if (this.show) {
      document.body.classList.add('modal-open');
    }
  }

  ngOnChanges() {
    if (this.show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget && !this.loading) {
      this.onCancel();
    }
  }

  onConfirm() {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  onCancel() {
    if (!this.loading) {
      this.cancel.emit();
    }
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }
}