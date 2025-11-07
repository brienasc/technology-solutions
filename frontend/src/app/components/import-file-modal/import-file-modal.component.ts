import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-import-file-modal',
  standalone: true,
  templateUrl: './import-file-modal.component.html',
  styleUrls: ['./import-file-modal.component.css'],
})
export class ImportFileModalComponent {
  @Input() open = false;
  @Input() closeOnBackdrop = true;
  @Output() confirm = new EventEmitter<File>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  file: File | null = null;
  isDragOver = false;

  onBackdrop() {
    if (!this.closeOnBackdrop) {
      return;
    }
    this.onClose();
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files && input.files.length ? input.files[0] : null;

    if (f && this.accepts(f)) {
      this.file = f;
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;

    const list = e.dataTransfer?.files;
    if (!list?.length) {
      return;
    }

    const f = list[0];
    if (f && this.accepts(f)) {
      this.file = f;
    }
  }

  onConfirm() {
    if (this.file) {
      this.confirm.emit(this.file);
      this.resetSelection();
    }
  }

  onClose() {
    this.resetSelection();
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) {
      this.onClose();
    }
  }

  private resetSelection() {
    this.file = null;
    this.isDragOver = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private accepts(f: File): boolean {
    const t = (f.type || '').toLowerCase();
    const n = (f.name || '').toLowerCase();

    return t === 'application/xml' || t === 'text/xml' || n.endsWith('.xml');
  }
}
