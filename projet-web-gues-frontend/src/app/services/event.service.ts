// services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event, EventFilters, CreateEventDTO, UpdateEventDTO } from '../models/event.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // URL via API Gateway
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ========== PUBLIC METHODS ==========

  // Récupérer tous les événements
  getEvents(filters?: EventFilters): Observable<Event[]> {
    let params = new HttpParams();

    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.location) {
      params = params.set('location', filters.location);
    }

    console.log('🔍 Fetching events from:', `${this.baseUrl}?${params.toString()}`);

    return this.http.get<Event[]>(this.baseUrl, { params }).pipe(
      catchError(this.handleError<Event[]>('getEvents', []))
    );
  }

  // Récupérer un événement par ID
  getEventById(id: number): Observable<Event | null> {
    console.log(`🔍 Fetching event ${id} from: ${this.baseUrl}/${id}`);

    return this.http.get<Event>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError<Event | null>(`getEvent id=${id}`, null))
    );
  }

  // Rechercher des événements
  searchEvents(params: EventFilters): Observable<Event[]> {
    return this.getEvents(params);
  }

  // ========== ORGANIZER METHODS ==========

  // Récupérer les événements d'un organisateur
  getEventsByOrganizer(organizerId: number): Observable<Event[]> {
    console.log(`📋 Fetching events for organizer ${organizerId}`);

    return this.http.get<Event[]>(`${this.baseUrl}/organizer/${organizerId}`).pipe(
      catchError(this.handleError<Event[]>('getEventsByOrganizer', []))
    );
  }

  // Créer un événement
  createEvent(eventData: CreateEventDTO): Observable<Event | null> {
    console.log('➕ Creating event:', eventData);

    return this.http.post<Event>(this.baseUrl, eventData).pipe(
      catchError(this.handleError<Event | null>('createEvent', null))
    );
  }

  // Mettre à jour un événement
  updateEvent(id: number, eventData: UpdateEventDTO): Observable<Event | null> {
    console.log(`✏️ Updating event ${id}:`, eventData);

    return this.http.put<Event>(`${this.baseUrl}/${id}`, eventData).pipe(
      catchError(this.handleError<Event | null>(`updateEvent id=${id}`, null))
    );
  }

  // Supprimer un événement
  deleteEvent(id: number): Observable<boolean> {
    console.log(`🗑️ Deleting event ${id}`);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(this.handleError<boolean>(`deleteEvent id=${id}`, false))
    );
  }

  // ========== HELPER METHODS ==========

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }

  // Catégories disponibles
  getCategories(): { value: string; label: string; icon: string; color: string }[] {
    return [
      { value: 'CONFERENCE', label: 'Conférence', icon: '🎤', color: '#3B82F6' },
      { value: 'FORMATION', label: 'Formation', icon: '🎓', color: '#10B981' },
      { value: 'CONCERT', label: 'Concert', icon: '🎵', color: '#8B5CF6' },
      { value: 'SPORT', label: 'Sport', icon: '⚽', color: '#EF4444' },
      { value: 'NETWORKING', label: 'Networking', icon: '🤝', color: '#F59E0B' },
      { value: 'WORKSHOP', label: 'Atelier', icon: '🔧', color: '#EC4899' },
      { value: 'EXPOSITION', label: 'Exposition', icon: '🎨', color: '#6366F1' },
      { value: 'FESTIVAL', label: 'Festival', icon: '🎉', color: '#F97316' },
      { value: 'SEMINAIRE', label: 'Séminaire', icon: '📊', color: '#06B6D4' },
      { value: 'AUTRE', label: 'Autre', icon: '🌟', color: '#6B7280' }
    ];
  }

  // Formatage des dates
  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Catégories
  getCategoryIcon(category: string): string {
    const cat = this.getCategories().find(c => c.value === category);
    return cat?.icon || '📅';
  }

  getCategoryColor(category: string): string {
    const cat = this.getCategories().find(c => c.value === category);
    return cat?.color || '#6B7280';
  }

  getCategoryLabel(category: string): string {
    const cat = this.getCategories().find(c => c.value === category);
    return cat?.label || category;
  }

  // Capacité
  calculateAvailableSpots(event: Event): number {
    return event.availablePlaces || (event.maxParticipants - event.currentParticipants) || 0;
  }

  getOccupancyPercentage(event: Event): number {
    const available = this.calculateAvailableSpots(event);
    const occupied = event.maxParticipants - available;
    return Math.round((occupied / event.maxParticipants) * 100);
  }

  isEventFull(event: Event): boolean {
    return this.calculateAvailableSpots(event) <= 0;
  }

  // Prix
  getPriceDisplay(price: number): string {
    if (!price || price === 0) {
      return 'Gratuit';
    }
    return `${price.toFixed(2)} €`;
  }

  // URL d'image par défaut
  getEventImage(event: Event): string {
    if (event.mediaUrls && event.mediaUrls.length > 0) {
      return event.mediaUrls[0];
    }
    if (event.imageUrl) {
      return event.imageUrl;
    }
    // Image par défaut
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop';
  }
}
