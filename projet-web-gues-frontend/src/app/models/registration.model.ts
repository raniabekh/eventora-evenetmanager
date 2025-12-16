export interface Registration {
  id: number;
  eventId: number;
  userId: number;

  participantName: string;
  participantEmail: string;
  participantPhone?: string;

  registrationDate: string;

  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITING_LIST';

  notes?: string;
  qrCodeUrl?: string;
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

export interface RegistrationRequest {
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  notes?: string;
  acceptTerms: boolean;
}

