
export type TableCellType = 'text' | 'date' | 'action';

export interface TableAction {
  label: string;
  icon?: string;
  actionKey: string;
}

export interface TableColumn {
  name: string;
  label: string;
  property: string;
  type: TableCellType;
  actions?: TableAction[];
}

export interface RowActionEvent {
  action: string;
  row: any;
}
