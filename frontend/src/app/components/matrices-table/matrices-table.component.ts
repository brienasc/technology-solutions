import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn, RowActionEvent } from '../../models/table.model';

@Component({
  selector: 'app-matrices-table',
  standalone: true,
  templateUrl: './matrices-table.component.html',
  styleUrls: ['./matrices-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatricesTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Output() rowAction = new EventEmitter<RowActionEvent>();

  onAction(actionKey: string, row: any) {
    this.rowAction.emit({ action: actionKey, row });
  }

  trackRow(i: number, row: any) {
    return row?.id ?? i;
  }

  trackCol(i: number, col: TableColumn) {
    return col.name;
  }
}
