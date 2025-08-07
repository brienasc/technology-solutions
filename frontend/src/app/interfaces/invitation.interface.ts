// frontend/src/app/interfaces/invitation.interface.ts

/**
 * Interface que define a estrutura de um objeto de Convite.
 * É utilizada para garantir a tipagem correta dos dados em toda a aplicação.
 */
export interface Invitation {
  id: number;
  email: string;
  sentDate: string; // A data de envio do convite
  expirationDate: string; // A data de expiração do convite
  status: 'Em Aberto' | 'Finalizado' | 'Vencido'; // O status atual do convite
}



