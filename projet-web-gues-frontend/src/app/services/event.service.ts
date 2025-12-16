import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event, EventFilters, CreateEventDTO, UpdateEventDTO } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getEvents(filters?: EventFilters): Observable<Event[]> {
    let params = new HttpParams();

    if (filters?.keyword) params = params.set('keyword', filters.keyword);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.location) params = params.set('location', filters.location);
    if (filters?.minDate) params = params.set('minDate', filters.minDate);
    if (filters?.maxDate) params = params.set('maxDate', filters.maxDate);
    if (filters?.maxPrice != null) params = params.set('maxPrice', String(filters.maxPrice));

    return this.http.get<Event[]>(this.baseUrl, { params }).pipe(
      map(events => events ?? []),
      catchError(() => of([]))
    );
  }

  getEventById(id: number): Observable<Event | null> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  searchEvents(filters: EventFilters): Observable<Event[]> {
    return this.getEvents(filters);
  }

  getEventsByOrganizer(organizerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/organizer/${organizerId}`).pipe(
      catchError(() => of([]))
    );
  }

  createEvent(dto: CreateEventDTO): Observable<Event | null> {
    return this.http.post<Event>(this.baseUrl, dto).pipe(
      catchError(() => of(null))
    );
  }

  updateEvent(id: number, dto: UpdateEventDTO): Observable<Event | null> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(() => of(null))
    );
  }

  deleteEvent(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ====== Helpers UI ======
  getCategories(): { value: string; label: string; icon: string; color: string }[] {
    return [
      { value: 'CONFERENCE', label: 'Conférence', icon: '🎤', color: '#3B82F6' },
      { value: 'FORMATION', label: 'Formation', icon: '🎓', color: '#10B981' },
      { value: 'CONCERT', label: 'Concert', icon: '🎵', color: '#8B5CF6' },
      { value: 'SPORT', label: 'Sport', icon: '⚽', color: '#EF4444' },
      { value: 'NETWORKING', label: 'Networking', icon: '🤝', color: '#F59E0B' },
      { value: 'WORKSHOP', label: 'Atelier', icon: '🔧', color: '#EC4899' },
      { value: 'AUTRE', label: 'Autre', icon: '🌟', color: '#6B7280' }
    ];
  }

  getCategoryIcon(category: string): string {
    return this.getCategories().find(c => c.value === category)?.icon || '📅';
  }

  getCategoryColor(category: string): string {
    return this.getCategories().find(c => c.value === category)?.color || '#6B7280';
  }

  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  calculateAvailableSpots(event: Event): number {
    if (event.availablePlaces != null) return event.availablePlaces;
    return Math.max(0, (event.maxParticipants ?? 0) - (event.currentParticipants ?? 0));
  }

  getOccupancyPercentage(event: Event): number {
    if (!event.maxParticipants) return 0;
    return Math.round(((event.currentParticipants ?? 0) / event.maxParticipants) * 100);
  }

  isEventFull(event: Event): boolean {
    return this.calculateAvailableSpots(event) <= 0;
  }

  getPriceDisplay(price: number): string {
    if (!price) return 'Gratuit';
    return `${price.toFixed(2)} €`;
  }

  getEventImage(event: Event): string {
    if (event.mediaUrls?.length) return event.mediaUrls[0];
    if (event.imageUrl) return event.imageUrl;
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop';
  }
}

