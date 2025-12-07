// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event, EventFilters } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [
    {
      id: 1,
      title: 'Conférence Tech 2024',
      description: 'Conférence annuelle sur les dernières tendances technologiques.',
      date: '2024-12-15T09:00:00',
      location: 'Paris Expo, Porte de Versailles',
      category: 'CONFERENCE',
      mediaUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop'],
      maxParticipants: 200,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 1,
      isActive: true
    },
    {
      id: 2,
      title: 'Formation Angular Avancé',
      description: 'Formation intensive sur Angular, RxJS et bonnes pratiques.',
      date: '2024-12-20T09:00:00',
      location: 'En ligne (Zoom)',
      category: 'FORMATION',
      mediaUrls: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop'],
      maxParticipants: 50,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 2,
      isActive: true
    },
    {
      id: 3,
      title: 'Concert Jazz de Noël',
      description: 'Concert de jazz traditionnel avec buffet de Noël.',
      date: '2024-12-25T20:00:00',
      location: 'Salle Pleyel, Lyon',
      category: 'CONCERT',
      mediaUrls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=500&fit=crop'],
      maxParticipants: 100,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 3,
      isActive: true
    },
    {
      id: 4,
      title: 'Forum IA & Innovation',
      description: 'Débats sur l\'IA et son impact sociétal.',
      date: '2025-01-10T10:00:00',
      location: 'Cité des Sciences, Paris',
      category: 'SCIENTIFIQUE',
      mediaUrls: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop'],
      maxParticipants: 150,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 1,
      isActive: true
    },
    {
      id: 5,
      title: 'Exposition Art Contemporain',
      description: 'Découverte des artistes contemporains.',
      date: '2025-01-20T14:00:00',
      location: 'Centre Pompidou, Paris',
      category: 'CULTUREL',
      mediaUrls: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop'],
      maxParticipants: 80,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 4,
      isActive: true
    },
    {
      id: 6,
      title: 'Tournoi de Football',
      description: 'Tournoi annuel entre entreprises.',
      date: '2025-02-05T09:00:00',
      location: 'Stade de France',
      category: 'SPORTIF',
      mediaUrls: ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop'],
      maxParticipants: 120,
      currentParticipants: 85, // ← AJOUTEZ
      price: 35, // ← AJOUTEZ
      organizerId: 5,
      isActive: true
    }
  ];

  // Récupérer tous les événements
  getEvents(filters?: EventFilters): Observable<Event[]> {
    let result = [...this.events];

    if (!filters) return of(result);

    // Filtrage
    if (filters.keyword?.trim()) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword)
      );
    }

    if (filters.category) {
      result = result.filter(event => event.category === filters.category);
    }

    if (filters.location?.trim()) {
      const location = filters.location.toLowerCase();
      result = result.filter(event =>
        event.location.toLowerCase().includes(location)
      );
    }

    return of(result);
  }

  // Récupérer un événement par ID
  getEventById(id: number): Observable<Event | undefined> {
    const event = this.events.find(e => e.id === id);
    return of(event);
  }

  // Catégories disponibles
  getCategories() {
    return [
      { value: 'CONFERENCE', label: 'Conférence', icon: '🎤', color: '#3B82F6' },
      { value: 'FORMATION', label: 'Formation', icon: '🎓', color: '#10B981' },
      { value: 'CONCERT', label: 'Concert', icon: '🎵', color: '#8B5CF6' },
      { value: 'SCIENTIFIQUE', label: 'Scientifique', icon: '🔬', color: '#EF4444' },
      { value: 'CULTUREL', label: 'Culturel', icon: '🏛️', color: '#F59E0B' },
      { value: 'SPORTIF', label: 'Sportif', icon: '⚽', color: '#DC2626' },
      { value: 'AUTRE', label: 'Autre', icon: '🌟', color: '#8B5CF6' }
    ];
  }

  // Formatage de dates
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
      day: 'numeric',
      month: 'short',
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

  // Capacité
  calculateAvailableSpots(event: Event): number {
    // Simulation réaliste
    const min = Math.floor(event.maxParticipants * 0.2);
    const max = Math.floor(event.maxParticipants * 0.8);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getOccupancyPercentage(event: Event): number {
    const available = this.calculateAvailableSpots(event);
    const occupied = event.maxParticipants - available;
    return Math.round((occupied / event.maxParticipants) * 100);
  }

  isEventFull(event: Event): boolean {
    return this.getOccupancyPercentage(event) >= 95;
  }
}
