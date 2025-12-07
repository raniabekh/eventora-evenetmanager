// src/app/models/registration-form.model.ts
export interface RegistrationFormData {
  eventId: number;
  userId: number;

  // Informations participant
  fullName: string;
  email: string;
  phone: string;

  // Conditions
  acceptTerms: boolean;

  // Métadonnées (généré automatiquement)
  registrationDate: string;
}

export interface RegistrationFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  acceptTerms?: string;
  general?: string;
}
