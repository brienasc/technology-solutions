export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface AlertAction {
  id: string;
  label: string;
  autofocus?: boolean;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface AlertModalConfig {
  open: boolean;
  title: string;
  message?: string;
  variant?: AlertVariant;
  actions?: AlertAction[];
  closeOnBackdrop?: boolean;
  escToClose?: boolean;
}

