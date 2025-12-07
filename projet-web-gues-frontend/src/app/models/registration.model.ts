// src/app/models/registration.model.ts
export interface Registration {
  id?: number;
  eventId: number;
  userId: number;
  registrationDate: string;  // Format ISO
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  // Optionnel - pour l'affichage
  event?: any;  // Vous pouvez remplacer par Event si vous avez l'interface
}

export interface RegistrationStatus {
  isRegistered: boolean;
  registrationId?: number;
  status?: string;
  registrationDate?: string;
}

export interface EventStats {
  eventId: number;
  participantsCount: number;
  capacity: number;
  availableSpots: number;
}
