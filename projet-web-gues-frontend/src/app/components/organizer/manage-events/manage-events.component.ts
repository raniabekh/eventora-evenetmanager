// src/app/components/organizer/manage-events/manage-events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { OrganizerService } from '../../../services/organizer.service';
import { Event } from '../../../models/event.model';

interface EventFilter {
  status: 'all' | 'published' | 'draft' | 'cancelled' | 'completed';
  category: string;
  searchTerm: string;
  sortBy: 'date' | 'title' | 'participants' | 'revenue';
}

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.css']
})
export class ManageEventsComponent implements OnInit {
  // Données
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];

  // Filtres
  filters: EventFilter = {
    status: 'all',
    category: 'all',
    searchTerm: '',
    sortBy: 'date'
  };

  // États
  isLoading = true;
  isDeleting = false;

  // Options
  categories: { value: string, label: string }[] = [];
  allServiceCategories: { value: string, label: string, icon: string, color: string }[] = [];
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'published', label: 'Publiés', color: '#10B981' },
    { value: 'draft', label: 'Brouillons', color: '#F59E0B' },
    { value: 'cancelled', label: 'Annulés', color: '#EF4444' },
    { value: 'completed', label: 'Terminés', color: '#6B7280' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  // Actions en cours - VARIABLES SÉPARÉES
  statusChangingId: number | null = null;  // Pour les changements de statut
  deletingId: number | null = null;        // Pour les suppressions

  constructor(
    public eventService: EventService,
    private organizerService: OrganizerService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.allServiceCategories = this.eventService.getCategories();
    this.categories = [
      { value: 'all', label: 'Toutes les catégories' },
      ...this.allServiceCategories.map(cat => ({
        value: cat.value,
        label: cat.label
      }))
    ];
  }

  // 1. Charger les événements
  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        // Filtrer pour ne garder que les événements de l'organisateur (simulation)
        this.allEvents = events.map(event => ({
          ...event,
          // Assurer que chaque événement a un statut
          status: this.getEventStatus(event)
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement événements:', error);
        this.isLoading = false;
      }
    });
  }

  // 2. Déterminer le statut d'un événement
  getEventStatus(event: Event): string {
    if (!event.status || event.status === '') {
      const eventDate = new Date(event.date);
      const now = new Date();

      if (eventDate < now) {
        return 'COMPLETED';
      } else if (event.isActive === false) {
        return 'CANCELLED';
      } else {
        return 'PUBLISHED';
      }
    }
    return event.status;
  }

  // 3. Appliquer les filtres
  applyFilters(): void {
    let events = [...this.allEvents];

    // Filtre par statut
    if (this.filters.status !== 'all') {
      events = events.filter(event => {
        const eventStatus = this.getEventStatus(event).toUpperCase();
        const filterStatus = this.filters.status.toUpperCase();

        const statusMap: {[key: string]: string[]} = {
          'PUBLISHED': ['PUBLISHED', 'ACTIVE', 'ACTIF'],
          'DRAFT': ['DRAFT', 'BROUILLON'],
          'CANCELLED': ['CANCELLED', 'CANCELED', 'ANNULLE', 'ANNULE'],
          'COMPLETED': ['COMPLETED', 'TERMINE', 'FINISHED']
        };

        return statusMap[filterStatus]?.includes(eventStatus) || eventStatus === filterStatus;
      });
    }

    // Filtre par catégorie
    if (this.filters.category !== 'all') {
      events = events.filter(event => event.category === this.filters.category);
    }

    // Recherche
    if (this.filters.searchTerm.trim()) {
      const search = this.filters.searchTerm.toLowerCase();
      events = events.filter(event =>
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      );
    }

    // Tri
    events.sort((a, b) => {
      switch (this.filters.sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'participants':
          return b.currentParticipants - a.currentParticipants;
        case 'revenue':
          return (b.currentParticipants * b.price) - (a.currentParticipants * a.price);
        default:
          return 0;
      }
    });

    this.filteredEvents = events;
    this.updatePagination();
  }

  // 4. Mettre à jour la pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // 5. Gestion des événements
  getPaginatedEvents(): Event[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  // 6. Actions sur les événements

  // SUPPRIMER un événement
  deleteEvent(event: Event): void {
    if (confirm(`Voulez-vous vraiment supprimer "${event.title}" ?`)) {
      this.deletingId = event.id;  // Utilisez deletingId

      setTimeout(() => {
        this.allEvents = this.allEvents.filter(e => e.id !== event.id);
        this.applyFilters();
        this.deletingId = null;  // Réinitialisez deletingId

        this.organizerService.addActivity({
          type: 'cancellation',
          title: 'Événement supprimé',
          description: `Vous avez supprimé "${event.title}"`,
          timestamp: new Date().toISOString(),
          eventId: event.id
        });

        alert('Événement supprimé avec succès');
      }, 1000);
    }
  }

  // CHANGER le statut d'un événement
  changeEventStatus(event: Event, newStatus: string): void {
    this.statusChangingId = event.id;  // Utilisez statusChangingId

    setTimeout(() => {
      const index = this.allEvents.findIndex(e => e.id === event.id);
      if (index !== -1) {
        let statusValue: string;
        switch (newStatus.toLowerCase()) {
          case 'published': statusValue = 'PUBLISHED'; break;
          case 'draft': statusValue = 'DRAFT'; break;
          case 'cancelled': statusValue = 'CANCELLED'; break;
          case 'completed': statusValue = 'COMPLETED'; break;
          default: statusValue = newStatus.toUpperCase();
        }

        this.allEvents[index] = {
          ...this.allEvents[index],
          status: statusValue,
          isActive: statusValue === 'CANCELLED' ? false : true
        };

        this.applyFilters();
        this.statusChangingId = null;  // Réinitialisez statusChangingId

        alert(`Statut changé à: ${this.getStatusLabel(this.allEvents[index])}`);
      }
    }, 800);
  }

  // 7. Utilitaires
  getRegistrationRate(event: Event): number {
    if (event.maxParticipants === 0) return 0;
    return Math.round((event.currentParticipants / event.maxParticipants) * 100);
  }

  getRevenue(event: Event): number {
    return event.currentParticipants * event.price;
  }

  getDaysUntil(event: Event): number {
    const eventDate = new Date(event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUpcoming(event: Event): boolean {
    const eventDate = new Date(event.date);
    const now = new Date();
    const status = this.getEventStatus(event).toUpperCase();

    if (['CANCELLED', 'COMPLETED', 'TERMINE', 'FINISHED'].includes(status)) {
      return false;
    }

    return eventDate > now;
  }

  getStatusColor(event: Event): string {
    const status = this.getEventStatus(event).toUpperCase();

    switch (status) {
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'ACTIF':
        return '#10B981';
      case 'DRAFT':
      case 'BROUILLON':
        return '#F59E0B';
      case 'CANCELLED':
      case 'CANCELED':
      case 'ANNULLE':
      case 'ANNULE':
        return '#EF4444';
      case 'COMPLETED':
      case 'TERMINE':
      case 'FINISHED':
        return '#6B7280';
      default:
        return '#3B82F6';
    }
  }

  getStatusLabel(event: Event): string {
    const status = this.getEventStatus(event).toUpperCase();

    switch (status) {
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'ACTIF':
        return 'Publié';
      case 'DRAFT':
      case 'BROUILLON':
        return 'Brouillon';
      case 'CANCELLED':
      case 'CANCELED':
      case 'ANNULLE':
      case 'ANNULE':
        return 'Annulé';
      case 'COMPLETED':
      case 'TERMINE':
      case 'FINISHED':
        return 'Terminé';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  }

  /**
   * Récupère le label d'une catégorie
   */
  getCategoryLabel(categoryValue: string): string {
    if (!categoryValue || categoryValue === 'all') {
      return 'Non catégorisé';
    }

    // Cherche dans les catégories du service
    const foundCategory = this.allServiceCategories.find(c => c.value === categoryValue);

    if (foundCategory) {
      return foundCategory.label;
    }

    // Cherche dans les catégories du composant (inclut "all")
    const componentCategory = this.categories.find(c => c.value === categoryValue);
    if (componentCategory) {
      return componentCategory.label;
    }

    // Si non trouvé, retourne la valeur originale formatée
    return categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase();
  }

  /**
   * Récupère l'icône d'une catégorie
   */
  getCategoryIcon(categoryValue: string): string {
    if (!categoryValue) {
      return '📅';
    }

    const foundCategory = this.allServiceCategories.find(c => c.value === categoryValue);
    return foundCategory?.icon || '📅';
  }

  /**
   * Récupère la couleur d'une catégorie
   */
  getCategoryColor(categoryValue: string): string {
    if (!categoryValue) {
      return '#3B82F6'; // Bleu par défaut
    }

    const foundCategory = this.allServiceCategories.find(c => c.value === categoryValue);
    return foundCategory?.color || '#3B82F6';
  }

  // 8. Pagination
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // 9. Réinitialiser les filtres
  resetFilters(): void {
    this.filters = {
      status: 'all',
      category: 'all',
      searchTerm: '',
      sortBy: 'date'
    };
    this.applyFilters();
  }

  // 10. Export CSV
  exportToCSV(): void {
    const headers = ['Titre', 'Date', 'Lieu', 'Catégorie', 'Participants', 'Prix', 'Statut', 'Revenu'];
    const csvData = this.filteredEvents.map(event => [
      `"${event.title}"`,
      new Date(event.date).toLocaleDateString('fr-FR'),
      `"${event.location}"`,
      this.getCategoryLabel(event.category),
      `${event.currentParticipants}/${event.maxParticipants}`,
      `${event.price}€`,
      this.getStatusLabel(event),
      `${this.getRevenue(event)}€`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Export CSV généré avec succès');
  }

  // 11. Formatage de date
  formatEventDate(dateString: string): string {
    return this.eventService.formatShortDate(dateString);
  }
}






















