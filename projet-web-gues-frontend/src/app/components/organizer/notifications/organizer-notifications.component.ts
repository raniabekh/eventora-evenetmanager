// src/app/components/organizer/notifications/organizer-notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizerService, OrganizerNotification, OrganizerNotificationType } from '../../../services/organizer.service';

@Component({
  selector: 'app-organizer-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizer-notifications.component.html',
  styleUrls: ['./organizer-notifications.component.css']
})
export class OrganizerNotificationsComponent implements OnInit {
  notifications: OrganizerNotification[] = [];
  filteredNotifications: OrganizerNotification[] = [];

  isLoading = false;
  hasError = false;

  // Filtres
  filterUnreadOnly = false;
  filterType: string = 'all';
  searchTerm = '';

  // Stats
  stats = {
    total: 0,
    unread: 0,
    read: 0
  };

  // Types de notifications organisateur
  notificationTypes = [
    { value: 'all', label: 'Toutes', icon: '📋', color: '#6B7280' },
    { value: 'NEW_REGISTRATION', label: 'Nouvelles inscriptions', icon: '👤', color: '#10B981' },
    { value: 'REGISTRATION_CANCELLED', label: 'Annulations', icon: '❌', color: '#EF4444' },
    { value: 'PARTICIPANT_QUESTION', label: 'Questions', icon: '❓', color: '#3B82F6' },
    { value: 'FEEDBACK_RECEIVED', label: 'Feedbacks', icon: '⭐', color: '#F59E0B' },
    { value: 'EVENT_REMINDER_ORGANIZER', label: 'Rappels', icon: '⏰', color: '#8B5CF6' },
    { value: 'EVENT_ANALYTICS_READY', label: 'Analytics', icon: '📊', color: '#6B7280' },
    { value: 'CUSTOM_NOTIFICATION', label: 'Personnalisées', icon: '📝', color: '#8B5CF6' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private organizerService: OrganizerService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;

    this.organizerService.getOrganizerNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.applyFilters();
        this.updateStats();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement notifications:', error);
        this.hasError = true;
        this.isLoading = false;
      }
    });

    this.organizerService.getNotificationStats().subscribe(stats => {
      this.stats.total = stats.total;
      this.stats.unread = stats.unread;
      this.stats.read = stats.read;
    });
  }

  applyFilters(): void {
    this.currentPage = 1;

    this.filteredNotifications = this.notifications.filter(notification => {
      // Filtre "non lues seulement"
      if (this.filterUnreadOnly && notification.isRead) {
        return false;
      }

      // Filtre par type
      if (this.filterType !== 'all' && notification.type !== this.filterType) {
        return false;
      }

      // Filtre par recherche
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        const matches =
          notification.title.toLowerCase().includes(search) ||
          notification.message.toLowerCase().includes(search) ||
          (notification.eventTitle && notification.eventTitle.toLowerCase().includes(search)) ||
          (notification.participantName && notification.participantName.toLowerCase().includes(search));
        if (!matches) return false;
      }

      return true;
    });

    // Trier par date décroissante
    this.filteredNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.updatePagination();
  }

  updateStats(): void {
    this.stats.total = this.notifications.length;
    this.stats.unread = this.notifications.filter(n => !n.isRead).length;
    this.stats.read = this.stats.total - this.stats.unread;
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  get paginatedNotifications(): OrganizerNotification[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNotifications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Actions sur les notifications
  markAsRead(notification: OrganizerNotification, event?: Event): void {
    if (event) event.stopPropagation();
    this.organizerService.markNotificationAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.organizerService.markAllNotificationsAsRead();
    alert('Toutes les notifications ont été marquées comme lues.');
  }

  deleteNotification(notification: OrganizerNotification, event: Event): void {
    event.stopPropagation();
    if (confirm('Supprimer cette notification ?')) {
      this.organizerService.deleteNotification(notification.id);
    }
  }

  deleteAllRead(): void {
    if (confirm('Supprimer toutes les notifications lues ?')) {
      this.notifications
        .filter(n => n.isRead)
        .forEach(n => this.organizerService.deleteNotification(n.id));
    }
  }

  clearAll(): void {
    if (confirm('Supprimer toutes les notifications ?')) {
      this.organizerService.clearAllNotifications();
    }
  }

  // Utilitaires d'affichage
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getTypeColor(type: string): string {
    const typeObj = this.notificationTypes.find(t => t.value === type);
    return typeObj?.color || '#6B7280';
  }

  getTypeIcon(type: string): string {
    const typeObj = this.notificationTypes.find(t => t.value === type);
    return typeObj?.icon || '📄';
  }

  getTypeLabel(type: string): string {
    const typeObj = this.notificationTypes.find(t => t.value === type);
    return typeObj?.label || 'Notification';
  }

  // Navigation
  navigateToEvent(eventId: number): void {
    console.log('Naviguer vers événement:', eventId);
    // À implémenter selon votre routing
  }

  // Simulations pour tests
  simulateNotification(): void {
    const types: OrganizerNotificationType[] = [
      'NEW_REGISTRATION',
      'REGISTRATION_CANCELLED',
      'PARTICIPANT_QUESTION',
      'FEEDBACK_RECEIVED'
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    this.organizerService.simulateOrganizerNotification(randomType);
  }

  simulateMultiple(): void {
    this.organizerService.simulateMultipleNotifications(3);
  }

  // Pagination
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
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
