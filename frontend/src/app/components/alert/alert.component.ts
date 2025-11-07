import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AlertAction, AlertVariant } from '../../models/alert.model';

let nextId = 0;

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AlertModalComponent implements OnChanges, AfterViewInit {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() description: string = '';
  @Input() variant: AlertVariant = 'neutral';
  @Input() actions: AlertAction[] = [
    { id: 'cancel', label: 'Cancelar', kind: 'ghost' },
    { id: 'ok', label: 'OK', kind: 'primary', autofocus: true }
  ];
  @Input() closeOnBackdrop = true;
  @Input() escToClose = true;

  @Output() closed = new EventEmitter<void>();
  @Output() action = new EventEmitter<AlertAction>();

  @ViewChild('dialog', { static: false }) dialogRef?: ElementRef<HTMLDivElement>;

  titleId = `alert-title-${++nextId}`;
  descId = `alert-desc-${++nextId}`;
  mesId: string = `alert-mes-${++nextId}`;

  get ariaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.message) ids.push(this.mesId);
    if (this.description) ids.push(this.descId);
    return ids.length ? ids.join(' ') : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      queueMicrotask(() => this.focusAutofocus());
    }
  }

  ngAfterViewInit(): void {
    if (this.open) this.focusAutofocus();
  }

  onBackdropClick(e: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    if (e.target && (e.target as HTMLElement).classList.contains('alert-overlay')) {
      this.close();
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (!this.open) return;
    if (this.escToClose && e.key === 'Escape') {
      e.stopPropagation();
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = this.getFocusableButtons();
      if (focusables.length === 0) return;
      const active = document.activeElement;
      const currentIndex = focusables.findIndex(btn => btn === active);
      let nextIndex = currentIndex;
      if (e.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === focusables.length - 1 ? 0 : currentIndex + 1;
      }
      e.preventDefault();
      focusables[nextIndex].focus();
    }
  }

  emitAction(btn: AlertAction) {
    this.action.emit(btn);
  }

  close() {
    this.open = false;
    this.closed.emit();
  }

  private focusAutofocus() {
    const btns = this.getFocusableButtons();
    const marked = btns.find(b => b.getAttribute('data-autofocus') === 'true');
    (marked ?? btns[0] ?? this.dialogRef?.nativeElement)?.focus();
  }

  private getFocusableButtons(): HTMLButtonElement[] {
    const host = this.dialogRef?.nativeElement;
    return host ? Array.from(host.querySelectorAll<HTMLButtonElement>('button[data-role="alert-action"]')) : [];
  }
}
