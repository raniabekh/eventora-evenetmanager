import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

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

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private baseUrl = 'http://localhost:8080/api/registrations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getRegistrationStatus(eventId: number): Observable<RegistrationStatus> {
    return this.http.get<RegistrationStatus>(
      `${this.baseUrl}/status?eventId=${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of({ isRegistered: false }))
    );
  }

  registerToEvent(eventId: number, request: RegistrationRequest): Observable<Registration> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => ({ message: 'Vous devez être connecté' }));
    }

    return this.http.post<Registration>(
      `${this.baseUrl}/events/${eventId}`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  cancelRegistration(registrationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${registrationId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getUserRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.baseUrl}/me`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of([]))
    );
  }

  getEventRegistrations(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.baseUrl}/event/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of([]))
    );
  }

  getEventStats(eventId: number): Observable<EventStats> {
    return this.http.get<EventStats>(
      `${this.baseUrl}/stats/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of({ eventId, participantsCount: 0, capacity: 0, availableSpots: 0 }))
    );
  }

  // UI helpers
  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'WAITING_LIST': return 'Liste d\'attente';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      case 'WAITING_LIST': return '#3B82F6';
      default: return '#6B7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '✅';
      case 'PENDING': return '⏳';
      case 'CANCELLED': return '❌';
      case 'WAITING_LIST': return '📋';
      default: return '📅';
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = String(userId);
    if (userRole) headers['X-User-Role'] = userRole;

    return new HttpHeaders(headers);
  }
}
