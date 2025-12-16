import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Event } from '../models/event.model';
import { Registration } from './registration.service';

/* ================== INTERFACES ================== */

export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  pastEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  averageAttendance: number;
  registrationTrend: number;
}

export interface OrganizerActivity {
  type: 'registration' | 'event' | 'update';
  title: string;
  description: string;
  timestamp: string;
  eventId?: number;
}


export interface OrganizerEvent extends Event {
  registrationCount: number;
  revenue: number;
  attendanceRate: number;
}

/* ===== Notifications MOCK ===== */

export type OrganizerNotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'NEW_REGISTRATION'
  | 'REGISTRATION_CANCELLED'
  | 'PARTICIPANT_QUESTION'
  | 'FEEDBACK_RECEIVED';

export interface OrganizerNotification {
  id: number;
  title: string;
  message: string;
  type: OrganizerNotificationType;
  read: boolean;
  isRead?: boolean;

  eventId?: number;
  eventTitle?: string;
  participantName?: string;

  priority?: 'high' | 'medium' | 'low';
  data?: any;

  createdAt: string;
}


/* ================== SERVICE ================== */

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {

  private baseUrl = 'http://localhost:8080/api';
  private activities: OrganizerActivity[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* ================== STATS ================== */

  getOrganizerStats(organizerId: number): Observable<OrganizerStats> {
    return this.http.get<OrganizerStats>(
      `${this.baseUrl}/events/organizer/${organizerId}/stats`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(() => of(this.getMockOrganizerStats()))
    );
  }

  /* ================== EVENTS ================== */

  getOrganizerEvents(organizerId: number): Observable<OrganizerEvent[]> {
    return this.http.get<Event[]>(
      `${this.baseUrl}/events/organizer/${organizerId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(events =>
        events.map(event => {
          const current = event.currentParticipants || 0;
          const max = event.maxParticipants || 0;

          return {
            ...event,
            registrationCount: current,
            revenue: current * (event.price || 0),
            attendanceRate: max > 0 ? Math.round((current / max) * 100) : 0
          };
        })
      ),
      catchError(() => of(this.getMockOrganizerEvents()))
    );
  }

  /* ================== REGISTRATIONS ================== */

  getEventRegistrations(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.baseUrl}/registrations/event/${eventId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(() => of([])));
  }

  /* ================== CRUD EVENTS ================== */

  createEvent(payload: any): Observable<Event> {
    return this.http.post<Event>(
      `${this.baseUrl}/events`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateEvent(eventId: number, payload: any): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/events/${eventId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/events/${eventId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* ================== ACTIVITIES ================== */


  addActivity(activity: OrganizerActivity): void {
    this.activities.unshift(activity);
    if (this.activities.length > 20) {
      this.activities.pop();
    }
  }

  getActivities(): OrganizerActivity[] {
    return this.activities;
  }

  /* ================== NOTIFICATIONS (MOCK) ================== */

  getOrganizerNotifications(): Observable<OrganizerNotification[]> {
    return of([]);
  }

  getUnreadNotificationsCount(): Observable<number> {
    return of(0);
  }

  getNotificationStats(): Observable<any> {
    return of({});
  }

  markNotificationAsRead(id: number): void {}
  markAllNotificationsAsRead(): void {}
  deleteNotification(id: number): void {}
  clearAllNotifications(): void {}
  simulateOrganizerNotification(type: OrganizerNotificationType): void {}
  simulateMultipleNotifications(count: number): void {}

  /* ================== HEADERS ================== */

  private getAuthHeaders(): { [key: string]: string } {
    const headers: any = { 'Content-Type': 'application/json' };

    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const role = this.authService.getUserRole();

    if (token) headers.Authorization = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = userId.toString();
    if (role) headers['X-User-Role'] = role;

    return headers;
  }

  /* ================== MOCK ================== */

  getMockOrganizerStats(): OrganizerStats {
    return {
      totalEvents: 5,
      upcomingEvents: 2,
      ongoingEvents: 2,
      pastEvents: 3,
      totalParticipants: 245,
      totalRevenue: 5250,
      averageAttendance: 78,
      registrationTrend: 12
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
      }
    ];
  }
}

