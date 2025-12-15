/// src/app/services/organizer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Event } from '../models/event.model';
import { Registration } from './registration.service';
import { environment } from '../../environments/environment';

export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  averageAttendance: number;
}

export interface OrganizerEvent extends Event {
  registrationCount: number;
  revenue: number;
  attendanceRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private baseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ========== STATISTIQUES ==========

  getOrganizerStats(organizerId: number): Observable<OrganizerStats> {
    return this.http.get<OrganizerStats>(
      `${this.baseUrl}/events/organizer/${organizerId}/stats`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => {
        // Retourner des stats par défaut en cas d'erreur
        return of({
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0,
          totalParticipants: 0,
          totalRevenue: 0,
          averageAttendance: 0
        });
      })
    );
  }

  // ========== ÉVÉNEMENTS ORGANISATEUR ==========

  getOrganizerEvents(organizerId: number): Observable<OrganizerEvent[]> {
    return this.http.get<Event[]>(
      `${this.baseUrl}/events/organizer/${organizerId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(events => {
        // Transformer en OrganizerEvent avec stats supplémentaires
        return events.map(event => ({
          ...event,
          registrationCount: event.currentParticipants || 0,
          revenue: (event.currentParticipants || 0) * (event.price || 0),
          attendanceRate: Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)
        }));
      }),
      catchError(() => of([]))
    );
  }

  // ========== INSCRIPTIONS PAR ÉVÉNEMENT ==========

  getEventRegistrations(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.baseUrl}/registrations/event/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of([]))
    );
  }

  // ========== CRÉATION/MODIFICATION ÉVÉNEMENT ==========

  createEvent(eventData: any): Observable<Event> {
    return this.http.post<Event>(
      `${this.baseUrl}/events`,
      eventData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateEvent(eventId: number, eventData: any): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/events/${eventId}`,
      eventData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/events/${eventId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ========== UTILITAIRES ==========

  private getAuthHeaders(): { [key: string]: string } {
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

    return headers;
  }

  // ========== MOCK DATA ==========

  getMockOrganizerStats(): OrganizerStats {
    return {
      totalEvents: 5,
      upcomingEvents: 2,
      pastEvents: 3,
      totalParticipants: 245,
      totalRevenue: 5250,
      averageAttendance: 78
    };
  }

  getMockOrganizerEvents(): OrganizerEvent[] {
    return [
      {
        id: 1,
        title: 'Conférence Tech 2024',
        description: 'Conférence sur les dernières technologies',
        date: '2024-12-15T09:00:00',
        location: 'Paris Expo',
        category: 'CONFERENCE',
        maxParticipants: 200,
        organizerId: 1,
        currentParticipants: 150,
        price: 35,
        status: 'ACTIVE',
        isActive: true,
        registrationCount: 150,
        revenue: 5250,
        attendanceRate: 75
      },
      {
        id: 2,
        title: 'Atelier Angular',
        description: 'Atelier pratique Angular',
        date: '2024-12-20T14:00:00',
        location: 'Lyon',
        category: 'FORMATION',
        maxParticipants: 50,
        organizerId: 1,
        currentParticipants: 40,
        price: 80,
        status: 'ACTIVE',
        isActive: true,
        registrationCount: 40,
        revenue: 3200,
        attendanceRate: 80
      }
    ];
  }
}
