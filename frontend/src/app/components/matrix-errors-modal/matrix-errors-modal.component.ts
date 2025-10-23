import { Component, EventEmitter, Input, Output } from '@angular/core';

type CheckEntry = { titulo: string; status: string; obs: string };
type ReportData = { has_errors: boolean; checks: Record<string, CheckEntry> };

@Component({
  selector: 'app-matrix-errors-modal',
  standalone: true,
  templateUrl: './matrix-errors-modal.component.html',
  styleUrls: ['./matrix-errors-modal.component.css']
})
export class MatrixErrorsModalComponent {
  @Input() open = false;
  @Input() report: ReportData | null = null;
  @Output() closed = new EventEmitter<void>();

  get pending(): CheckEntry[] {
    const checks = this.report?.checks || {};
    return Object.values(checks).filter(c => (c.status || '').toLowerCase() === 'pendente');
  }

  close(): void {
    this.closed.emit();
  }
}
