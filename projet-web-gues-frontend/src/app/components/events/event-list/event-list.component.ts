import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {

  events: Event[] = [];
  filteredEvents: Event[] = [];

  loading = false;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  searchKeyword = '';
  selectedCategory = '';
  locationFilter = '';

  categories = [
    { label: 'Tous', value: '', icon: '📋' },
    { label: 'Conférence', value: 'CONFERENCE', icon: '🎤' },
    { label: 'Formation', value: 'FORMATION', icon: '🎓' },
    { label: 'Workshop', value: 'WORKSHOP', icon: '🛠️' }
  ];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.hasError = false;

    this.eventService.getEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.filteredEvents = events;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement des événements';
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.events.filter(e =>
      (!this.searchKeyword || e.title.toLowerCase().includes(this.searchKeyword.toLowerCase())) &&
      (!this.selectedCategory || e.category === this.selectedCategory) &&
      (!this.locationFilter || (e.location || '').toLowerCase().includes(this.locationFilter.toLowerCase()))
    );
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedCategory = '';
    this.locationFilter = '';
    this.filteredEvents = this.events;
  }

  trackByEventId(index: number, event: Event): number {
    return event.id!;
  }

  logEventClick(event: Event): void {
    console.log('Event clicked', event.id);
  }

  getCategoryColor(category?: string): string {
    switch (category) {
      case 'CONFERENCE': return '#3B82F6';
      case 'FORMATION': return '#10B981';
      case 'WORKSHOP': return '#F59E0B';
      default: return '#6B7280';
    }
  }

  getCategoryIcon(category?: string): string {
    switch (category) {
      case 'CONFERENCE': return '🎤';
      case 'FORMATION': return '🎓';
      case 'WORKSHOP': return '🛠️';
      default: return '📌';
    }
  }

  getEventImage(event: Event): string {
    return event.imageUrl || 'assets/event-placeholder.jpg';
  }

  handleImageError(e: any): void {
    e.target.src = 'assets/event-placeholder.jpg';
  }

  isEventFull(event: Event): boolean {
    return !!(event.maxParticipants && event.currentParticipants >= event.maxParticipants);
  }

  formatShortDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  truncateText(text = '', max = 100): string {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }

  getAvailableSpots(event: Event): number {
    return Math.max(0, (event.maxParticipants || 0) - (event.currentParticipants || 0));
  }

  getOccupancyPercentage(event: Event): number {
    if (!event.maxParticipants) return 0;
    return Math.round((event.currentParticipants / event.maxParticipants) * 100);
  }
}
