// src/app/components/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import type { Notification, NotificationType } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, JsonPipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  isLoading = false;
  hasError = false;

  filterUnreadOnly = false;
  filterType: string = 'all';
  searchTerm = '';

  notificationTypes = [
    { value: 'all', label: 'Toutes', icon: '📋', color: '#6B7280' },
    { value: 'registration_confirmed', label: 'Confirmations', icon: '✅', color: '#10B981' },
    { value: 'event_reminder', label: 'Rappels', icon: '⏰', color: '#F59E0B' },
    { value: 'new_event', label: 'Nouveautés', icon: '🎉', color: '#8B5CF6' },
    { value: 'event_updated', label: 'Modifications', icon: '🔄', color: '#3B82F6' },
    { value: 'event_cancelled', label: 'Annulations', icon: '❌', color: '#EF4444' },
    { value: 'system', label: 'Système', icon: '⚙️', color: '#6B7280' },
    { value: 'promotion', label: 'Promotions', icon: '💰', color: '#F97316' }
  ];

  stats = {
    total: 0,
    unread: 0,
    read: 0
  };

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;

    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.applyFilters();
        this.updateStats();
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });

    this.notificationService.getNotificationsCount().subscribe(count => {
      this.stats.total = count.total;
      this.stats.unread = count.unread;
      this.stats.read = count.total - count.unread;
    });
  }

  applyFilters(): void {
    this.currentPage = 1;

    this.filteredNotifications = this.notifications.filter(notification => {
      if (this.filterUnreadOnly && notification.read) {
        return false;
      }

      if (this.filterType !== 'all' && notification.type !== this.filterType) {
        return false;
      }

      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        const matches =
          notification.title.toLowerCase().includes(search) ||
          notification.message.toLowerCase().includes(search);
        if (!matches) return false;
      }

      return true;
    });

    this.filteredNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.updatePagination();
  }

  updateStats(): void {
    this.stats.total = this.notifications.length;
    this.stats.unread = this.notifications.filter(n => !n.read).length;
    this.stats.read = this.stats.total - this.stats.unread;
  }

  markAsRead(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    alert('Toutes les notifications ont été marquées comme lues.');
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (confirm('Supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notification.id);
    }
  }

  deleteAllRead(): void {
    if (confirm('Supprimer toutes les notifications lues ?')) {
      this.notifications
        .filter(n => n.read)
        .forEach(n => this.notificationService.deleteNotification(n.id));
    }
  }

  clearAll(): void {
    if (confirm('Supprimer toutes les notifications ?')) {
      this.notifications.forEach(n =>
        this.notificationService.deleteNotification(n.id)
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
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

  navigateToAction(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (notification.actionUrl) {
      if (!notification.read) {
        this.markAsRead(notification, event);
      }
      window.location.href = notification.actionUrl;
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  get paginatedNotifications(): Notification[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNotifications.slice(startIndex, startIndex + this.itemsPerPage);
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

  // Méthode pour ajouter des notifications de test
  addTestNotifications(): void {
    this.notificationService.addTestNotifications(2);
    alert('2 notifications de test ajoutées !');
  }
}
