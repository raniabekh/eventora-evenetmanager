// src/app/components/events/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { Event, EventFilters } from '../../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories: any[] = [];

  // Filtres
  searchKeyword = '';
  selectedCategory = '';
  locationFilter = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // États
  isLoading = true;
  hasError = false;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.categories = this.eventService.getCategories();
  }

  // ========== CHARGEMENT DES ÉVÉNEMENTS ==========

  loadEvents(): void {
    this.isLoading = true;
    this.hasError = false;

    console.log('📡 Loading events from API...');

    this.eventService.getEvents().subscribe({
      next: (events) => {
        console.log(`✅ Loaded ${events.length} events`);
        this.events = events;
        this.filteredEvents = events;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading events:', error);
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les événements';
        this.isLoading = false;
      }
    });
  }

  // ========== FILTRAGE ==========

  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1;

    const filters: EventFilters = {};
    if (this.searchKeyword.trim()) {
      filters.keyword = this.searchKeyword.trim();
    }
    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }
    if (this.locationFilter.trim()) {
      filters.location = this.locationFilter.trim();
    }

    console.log('🔍 Applying filters:', filters);

    this.eventService.searchEvents(filters).subscribe({
      next: (events) => {
        this.filteredEvents = events;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error filtering events:', error);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedCategory = '';
    this.locationFilter = '';
    this.loadEvents();
  }

  // ========== PAGINATION ==========

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    // S'assurer que currentPage est valide
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedEvents(): Event[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ========== UTILITAIRES ==========

  trackByEventId(index: number, event: Event): number {
    return event.id;
  }

  getEventImage(event: Event): string {
    return this.eventService.getEventImage(event);
  }

  handleImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop';
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // ========== MÉTHODES DU SERVICE (pass-through) ==========

  formatShortDate(date: string): string {
    return this.eventService.formatShortDate(date);
  }

  formatTime(date: string): string {
    return this.eventService.formatTime(date);
  }

  getCategoryIcon(category: string): string {
    return this.eventService.getCategoryIcon(category);
  }

  getCategoryColor(category: string): string {
    return this.eventService.getCategoryColor(category);
  }

  getAvailableSpots(event: Event): number {
    return this.eventService.calculateAvailableSpots(event);
  }

  getOccupancyPercentage(event: Event): number {
    return this.eventService.getOccupancyPercentage(event);
  }

  isEventFull(event: Event): boolean {
    return this.eventService.isEventFull(event);
  }

  // ========== LOGS ET DEBUG ==========

  logEventClick(event: Event): void {
    console.log(`🎯 Clicked on event: ${event.title} (ID: ${event.id})`);
  }

  // ========== GETTERS POUR LE TEMPLATE ==========

  get eventCount(): number {
    return this.filteredEvents.length;
  }

  get categoryCount(): number {
    return this.categories.length;
  }

  get hasEvents(): boolean {
    return this.filteredEvents.length > 0;
  }

  get showingResults(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredEvents.length);
    return `Affichage de ${start} à ${end} sur ${this.filteredEvents.length}`;
  }
}

