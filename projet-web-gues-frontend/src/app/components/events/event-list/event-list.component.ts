// src/app/components/events/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { Event } from '../../../models/event.model';

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
  isLoading = false;
  hasError = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.categories = this.eventService.getCategories();
  }

  loadEvents(): void {
    this.isLoading = true;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1;

    const filters = {
      keyword: this.searchKeyword.trim(),
      category: this.selectedCategory,
      location: this.locationFilter.trim()
    };

    this.eventService.getEvents(filters).subscribe({
      next: (events) => {
        this.filteredEvents = events;
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
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

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
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

  // Utilitaires
  trackByEventId(index: number, event: Event): number {
    return event.id;
  }

  getEventImage(event: Event): string {
    return event.mediaUrls && event.mediaUrls.length > 0
      ? event.mediaUrls[0]
      : 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop';
  }

  handleImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop';
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Méthodes du service
  formatShortDate = (date: string) => this.eventService.formatShortDate(date);
  formatTime = (date: string) => this.eventService.formatTime(date);
  getCategoryIcon = (category: string) => this.eventService.getCategoryIcon(category);
  getCategoryColor = (category: string) => this.eventService.getCategoryColor(category);
  getAvailableSpots = (event: Event) => this.eventService.calculateAvailableSpots(event);
  getOccupancyPercentage = (event: Event) => this.eventService.getOccupancyPercentage(event);
  isEventFull = (event: Event) => this.eventService.isEventFull(event);
  isLoggedIn = () => this.authService.isLoggedIn();
}
