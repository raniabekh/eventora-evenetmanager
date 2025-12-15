// src/app/services/registration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// ========== INTERFACES EXPORTÉES ==========
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
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  eventCategory?: string;
}

export interface RegistrationRequest {
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  notes?: string;
  acceptTerms: boolean;
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

// ========== SERVICE ==========
@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // URL via API Gateway
  private baseUrl = `${environment.apiBaseUrl}/registrations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ========== PUBLIC METHODS ==========

  /**
   * Vérifier si l'utilisateur est inscrit à un événement
   */
  getRegistrationStatus(eventId: number, userId: number): Observable<RegistrationStatus> {
    console.log(`🔍 Checking registration status: event=${eventId}, user=${userId}`);

    return this.http.get<RegistrationStatus>(
      `${this.baseUrl}/status?eventId=${eventId}&userId=${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        console.log('User not registered or service error:', error.message);
        return of({ isRegistered: false });
      })
    );
  }

  /**
   * S'inscrire à un événement
   */
  registerToEvent(eventId: number, request: RegistrationRequest): Observable<Registration> {
    console.log(`📝 Registering to event ${eventId}:`, request);

    const currentUser = this.authService.getCurrentUser();

    // Préparer les données
    const registrationData = {
      ...request,
      userId: currentUser?.id || 0
    };

    return this.http.post<Registration>(
      `${this.baseUrl}/events/${eventId}`,
      registrationData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Registration successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Annuler une inscription
   */
  cancelRegistration(registrationId: number): Observable<void> {
    console.log(`❌ Cancelling registration ${registrationId}`);

    return this.http.delete<void>(
      `${this.baseUrl}/${registrationId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(() => {
        console.log('✅ Registration cancelled successfully');
      }),
      catchError(error => {
        console.error('❌ Cancellation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer toutes les inscriptions d'un utilisateur
   */
  getUserRegistrations(userId: number): Observable<Registration[]> {
    console.log(`📋 Getting registrations for user ${userId}`);

    return this.http.get<Registration[]>(
      `${this.baseUrl}/user/${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(registrations => {
        console.log(`✅ Loaded ${registrations.length} registrations`);
        return registrations;
      }),
      catchError(error => {
        console.error('❌ Error loading registrations:', error);
        // Retourner un tableau vide en cas d'erreur
        return of([]);
      })
    );
  }

  /**
   * Récupérer toutes les inscriptions d'un événement (pour organisateur)
   */
  getEventRegistrations(eventId: number): Observable<Registration[]> {
    console.log(`👥 Getting registrations for event ${eventId}`);

    return this.http.get<Registration[]>(
      `${this.baseUrl}/event/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(registrations => {
        console.log(`✅ Loaded ${registrations.length} registrations for event ${eventId}`);
        return registrations;
      }),
      catchError(error => {
        console.error('❌ Error loading event registrations:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtenir les statistiques d'un événement
   */
  getEventStats(eventId: number): Observable<EventStats> {
    console.log(`📊 Getting stats for event ${eventId}`);

    return this.http.get<EventStats>(
      `${this.baseUrl}/stats/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(stats => {
        console.log('✅ Event stats loaded:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('❌ Error loading event stats:', error);
        // Retourner des stats par défaut
        return of({
          eventId,
          participantsCount: 0,
          capacity: 0,
          availableSpots: 0
        });
      })
    );
  }

  /**
   * Mettre à jour le statut d'une inscription
   */
  updateRegistrationStatus(registrationId: number, status: string): Observable<Registration> {
    console.log(`🔄 Updating registration ${registrationId} to status: ${status}`);

    return this.http.put<Registration>(
      `${this.baseUrl}/${registrationId}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Registration status updated:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error updating registration status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Exporter les inscriptions d'un événement (CSV)
   */
  exportEventRegistrations(eventId: number): Observable<Blob> {
    console.log(`📤 Exporting registrations for event ${eventId}`);

    return this.http.get(
      `${this.baseUrl}/event/${eventId}/export`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      map(blob => {
        console.log('✅ Export successful');
        return blob;
      }),
      catchError(error => {
        console.error('❌ Export error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifier si un événement a des places disponibles
   */
  checkEventAvailability(eventId: number): Observable<boolean> {
    console.log(`🔍 Checking availability for event ${eventId}`);

    return this.getEventStats(eventId).pipe(
      map(stats => {
        const hasSpots = stats.availableSpots > 0;
        console.log(`✅ Event ${eventId} has spots: ${hasSpots}`);
        return hasSpots;
      }),
      catchError(() => {
        console.log('⚠️ Could not check availability, assuming available');
        return of(true); // Par défaut, on suppose qu'il y a des places
      })
    );
  }

  /**
   * Obtenir le nombre d'inscriptions par statut
   */
  getRegistrationCountsByStatus(eventId: number): Observable<{ [key: string]: number }> {
    console.log(`📈 Getting registration counts by status for event ${eventId}`);

    return this.getEventRegistrations(eventId).pipe(
      map(registrations => {
        const counts: { [key: string]: number } = {
          'CONFIRMED': 0,
          'PENDING': 0,
          'CANCELLED': 0,
          'WAITING_LIST': 0
        };

        registrations.forEach(reg => {
          counts[reg.status] = (counts[reg.status] || 0) + 1;
        });

        console.log('✅ Registration counts:', counts);
        return counts;
      }),
      catchError(error => {
        console.error('❌ Error getting registration counts:', error);
        return of({
          'CONFIRMED': 0,
          'PENDING': 0,
          'CANCELLED': 0,
          'WAITING_LIST': 0
        });
      })
    );
  }

  // ========== HELPER METHODS ==========

  /**
   * Vérifier si l'utilisateur peut s'inscrire
   */
  canRegister(event: any, userId: number): Observable<boolean> {
    if (!event || !userId) {
      return of(false);
    }

    // Vérifier si l'événement est actif
    if (event.isActive === false) {
      console.log('❌ Event is not active');
      return of(false);
    }

    // Vérifier si la date est passée
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      console.log('❌ Event date has passed');
      return of(false);
    }

    // Vérifier si déjà inscrit
    return this.getRegistrationStatus(event.id, userId).pipe(
      map(status => {
        if (status.isRegistered) {
          console.log('❌ User already registered');
          return false;
        }

        // Vérifier les places disponibles
        const availableSpots = event.availablePlaces ||
          (event.maxParticipants - event.currentParticipants);
        const hasSpots = availableSpots > 0;

        console.log(`✅ Available spots: ${availableSpots}, Can register: ${hasSpots}`);
        return hasSpots;
      }),
      catchError(() => {
        console.log('⚠️ Error checking registration, assuming can register');
        return of(true);
      })
    );
  }

  /**
   * Formater la date d'inscription
   */
  formatRegistrationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Texte du statut
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'WAITING_LIST': return 'Liste d\'attente';
      default: return status;
    }
  }

  /**
   * Couleur du statut
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '#10B981'; // green
      case 'PENDING': return '#F59E0B';   // yellow
      case 'CANCELLED': return '#EF4444'; // red
      case 'WAITING_LIST': return '#3B82F6'; // blue
      default: return '#6B7280'; // gray
    }
  }

  /**
   * Icône du statut
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '✅';
      case 'PENDING': return '⏳';
      case 'CANCELLED': return '❌';
      case 'WAITING_LIST': return '📋';
      default: return '📅';
    }
  }

  /**
   * Obtenir les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (userId) {
      headers['X-User-Id'] = userId.toString();
    }

    if (userRole) {
      headers['X-User-Role'] = userRole;
    }

    return new HttpHeaders(headers);
  }

  // ========== MOCK DATA (pour développement) ==========

  /**
   * Données mockées pour le développement sans backend
   */
  getMockRegistrations(userId: number): Registration[] {
    return [
      {
        id: 1,
        eventId: 1,
        userId: userId,
        participantName: 'Jean Dupont',
        participantEmail: 'jean@exemple.com',
        participantPhone: '06 12 34 56 78',
        registrationDate: new Date('2024-12-10T14:30:00').toISOString(),
        status: 'CONFIRMED',
        notes: 'Première participation'
      },
      {
        id: 2,
        eventId: 2,
        userId: userId,
        participantName: 'Jean Dupont',
        participantEmail: 'jean@exemple.com',
        registrationDate: new Date('2024-12-05T10:15:00').toISOString(),
        status: 'PENDING'
      },
      {
        id: 3,
        eventId: 3,
        userId: userId,
        participantName: 'Jean Dupont',
        participantEmail: 'jean@exemple.com',
        participantPhone: '06 98 76 54 32',
        registrationDate: new Date('2024-12-01T09:00:00').toISOString(),
        status: 'CANCELLED',
        notes: 'Emploi du temps modifié'
      }
    ];
  }

  /**
   * Utiliser les données mockées si le backend n'est pas disponible
   */
  getUserRegistrationsMock(userId: number): Observable<Registration[]> {
    console.log(`📋 Getting MOCK registrations for user ${userId}`);
    return of(this.getMockRegistrations(userId));
  }

  /**
   * Inscription mockée
   */
  registerToEventMock(eventId: number, request: RegistrationRequest): Observable<Registration> {
    console.log(`📝 MOCK Registering to event ${eventId}:`, request);

    const currentUser = this.authService.getCurrentUser();

    const mockRegistration: Registration = {
      id: Date.now(),
      eventId: eventId,
      userId: currentUser?.id || 0,
      participantName: request.participantName,
      participantEmail: request.participantEmail,
      participantPhone: request.participantPhone,
      registrationDate: new Date().toISOString(),
      status: 'CONFIRMED',
      notes: request.notes
    };

    console.log('✅ MOCK Registration created:', mockRegistration);
    return of(mockRegistration);
  }

  /**
   * Mode développement : basculer entre mock et réel
   */
  useMockData(): boolean {
    // Vous pouvez basculer en fonction d'une variable d'environnement
    return false; // true pour utiliser les mocks, false pour le vrai backend
  }

  /**
   * Méthode intelligente qui choisit entre mock et réel
   */
  getUserRegistrationsSmart(userId: number): Observable<Registration[]> {
    if (this.useMockData()) {
      return this.getUserRegistrationsMock(userId);
    }
    return this.getUserRegistrations(userId);
  }

  /**
   * Méthode intelligente pour l'inscription
   */
  registerToEventSmart(eventId: number, request: RegistrationRequest): Observable<Registration> {
    if (this.useMockData()) {
      return this.registerToEventMock(eventId, request);
    }
    return this.registerToEvent(eventId, request);
  }

  // ========== UTILS POUR LE TEMPLATE ==========

  /**
   * Calculer le temps écoulé depuis l'inscription
   */
  getTimeSince(registrationDate: string): string {
    const now = new Date();
    const regDate = new Date(registrationDate);
    const diffMs = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${Math.floor(diffDays / 30)} mois`;
    }
  }

  /**
   * Valider une demande d'inscription
   */
  validateRegistrationRequest(request: RegistrationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.participantName?.trim()) {
      errors.push('Le nom est requis');
    }

    if (!request.participantEmail?.trim()) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(request.participantEmail)) {
      errors.push('Format d\'email invalide');
    }

    if (request.participantPhone && !this.isValidPhone(request.participantPhone)) {
      errors.push('Format de téléphone invalide');
    }

    if (!request.acceptTerms) {
      errors.push('Vous devez accepter les conditions');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Formater le téléphone pour l'affichage
   */
  formatPhone(phone: string): string {
    if (!phone) return '';

    // Nettoyer le numéro
    const cleaned = phone.replace(/\D/g, '');

    // Formater selon la longueur
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }

    return phone;
  }
}
