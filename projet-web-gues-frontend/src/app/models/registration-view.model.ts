export interface RegistrationView {
  id: number;
  eventId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITING_LIST';
  registrationDate: string;

  // Champs événement (pour l'affichage)
  eventTitle: string;
  eventCategory: string;
  eventDate: string;
  eventLocation: string;
}
