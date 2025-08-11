// frontend/src/app/interfaces/invitation.interface.ts

/**
 * Interface que define a estrutura de um objeto de Convite.
 * É utilizada para garantir a tipagem correta dos dados em toda a aplicação.
 */
export interface Invitation {
  id_convite: string;
  email_colab: string;
  created_at: string; // A data de envio do convite
  expires_at: string; // A data de expiração do convite
  status_code: number;
  status_description: string; // O status atual do convite
}



