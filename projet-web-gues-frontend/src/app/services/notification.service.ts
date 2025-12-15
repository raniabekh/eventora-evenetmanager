// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { Notification, NotificationType, NotificationCount } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();

  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private notificationsCount = new BehaviorSubject<NotificationCount>({
    total: 0,
    unread: 0,
    byType: {}
  });
  notificationsCount$ = this.notificationsCount.asObservable();

  private recentNotifications = new BehaviorSubject<Notification[]>([]);
  recentNotifications$ = this.recentNotifications.asObservable();

  constructor(private authService: AuthService) {
    this.checkAndInitialize();
  }

  private checkAndInitialize(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadMockNotifications();
    }
  }

  private loadMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        userId: this.extractUserId(this.authService.getCurrentUser() || { id: 100 }),
        title: 'Inscription confirmée !',
        message: 'Votre inscription à l\'événement "Conférence Tech 2024" a été confirmée.',
        type: 'registration_confirmed' as NotificationType, // CAST EN NotificationType
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        data: { eventId: 123, eventTitle: 'Conférence Tech 2024' },
        priority: 'medium'
      },
      {
        id: 2,
        userId: this.extractUserId(this.authService.getCurrentUser() || { id: 100 }),
        title: 'Rappel événement',
        message: 'N\'oubliez pas votre événement "Atelier Angular" demain à 14h.',
        type: 'event_reminder' as NotificationType, // CAST EN NotificationType
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        data: { eventId: 456, eventTime: '2024-01-15T14:00:00' },
        priority: 'high'
      },
      {
        id: 3,
        userId: this.extractUserId(this.authService.getCurrentUser() || { id: 100 }),
        title: 'Nouvel événement disponible',
        message: 'Un nouvel événement "Soirée Networking" a été publié.',
        type: 'new_event' as NotificationType, // CAST EN NotificationType
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actionUrl: '/events/789',
        data: { eventId: 789 },
        priority: 'low'
      },
      {
        id: 4,
        userId: this.extractUserId(this.authService.getCurrentUser() || { id: 100 }),
        title: 'Événement modifié',
        message: 'L\'événement "Formation React" a été mis à jour.',
        type: 'event_updated' as NotificationType, // CAST EN NotificationType
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        data: { eventId: 321, changes: ['date', 'location'] },
        priority: 'medium'
      },
      {
        id: 5,
        userId: this.extractUserId(this.authService.getCurrentUser() || { id: 100 }),
        title: 'Promotion spéciale',
        message: 'Profitez de 20% de réduction sur votre prochaine inscription !',
        type: 'promotion' as NotificationType, // CAST EN NotificationType
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        actionUrl: '/promotions',
        data: { discount: '20%', validUntil: '2024-01-31' },
        priority: 'medium'
      }
    ];

    this.notifications.next(mockNotifications);
    this.updateCounts(mockNotifications);
    this.updateRecentNotifications(mockNotifications);
  }

  private extractUserId(user: any): number {
    if (!user) return 100;

    if (typeof user === 'object') {
      if ('id' in user && typeof user.id === 'number') {
        return user.id;
      }
      if ('userId' in user && typeof user.userId === 'number') {
        return user.userId;
      }
    }

    return 100;
  }

  private updateCounts(notifications: Notification[]): void {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;

    // Calculer les comptes par type
    const byType: { [key in NotificationType]?: number } = {};
    notifications.forEach(notification => {
      if (!byType[notification.type]) {
        byType[notification.type] = 0;
      }
      byType[notification.type]!++;
    });

    this.unreadCount.next(unread);
    this.notificationsCount.next({ total, unread, byType });
  }

  private updateRecentNotifications(notifications: Notification[]): void {
    const recent = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    this.recentNotifications.next(recent);
  }

  loadNotifications(): void {
    this.loadMockNotifications();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  getNotificationsCount(): Observable<NotificationCount> {
    return this.notificationsCount$;
  }

  markAsRead(notificationId: number): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });

    this.notifications.next(updatedNotifications);
    this.updateCounts(updatedNotifications);
    this.updateRecentNotifications(updatedNotifications);
  }

  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));

    this.notifications.next(updatedNotifications);
    this.updateCounts(updatedNotifications);
    this.updateRecentNotifications(updatedNotifications);
  }

  deleteNotification(notificationId: number): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );

    this.notifications.next(updatedNotifications);
    this.updateCounts(updatedNotifications);
    this.updateRecentNotifications(updatedNotifications);
  }

  createNotification(notificationData: Partial<Notification>): void {
    const user = this.authService.getCurrentUser();
    const userId = this.extractUserId(user);

    // CORRECTION : Définir un type par défaut qui existe dans NotificationType
    const defaultType: NotificationType = 'system';

    const newNotification: Notification = {
      id: Date.now(),
      userId,
      title: notificationData.title || 'Nouvelle notification',
      message: notificationData.message || '',
      type: notificationData.type || defaultType, // Utiliser le type par défaut
      read: false,
      createdAt: new Date().toISOString(),
      data: notificationData.data || null,
      actionUrl: notificationData.actionUrl || undefined,
      priority: notificationData.priority || 'medium'
    };

    const currentNotifications = this.notifications.value;
    const updatedNotifications = [newNotification, ...currentNotifications];

    this.notifications.next(updatedNotifications);
    this.updateCounts(updatedNotifications);
    this.updateRecentNotifications(updatedNotifications);
  }

  createMockNotification(type: NotificationType = 'system'): void {
    const messages: Record<string, string> = {
      'registration_confirmed': 'Votre inscription a été confirmée avec succès!',
      'event_reminder': 'N\'oubliez pas votre événement demain!',
      'new_event': 'Un nouvel événement vient d\'être publié!',
      'event_updated': 'Un événement auquel vous êtes inscrit a été mis à jour.',
      'event_cancelled': 'Un événement auquel vous êtes inscrit a été annulé.',
      'system': 'Notification système importante.',
      'promotion': 'Profitez de notre promotion spéciale!'
    };

    const notification: Partial<Notification> = {
      title: this.getTitleByType(type),
      message: messages[type] || 'Nouvelle notification disponible.',
      type: type,
      data: { test: true, timestamp: new Date().toISOString() },
      priority: 'medium'
    };

    this.createNotification(notification);
  }

  private getTitleByType(type: NotificationType): string {
    const titles: Record<string, string> = {
      'registration_confirmed': 'Inscription confirmée',
      'event_reminder': 'Rappel événement',
      'new_event': 'Nouvel événement',
      'event_updated': 'Événement modifié',
      'event_cancelled': 'Événement annulé',
      'system': 'Notification système',
      'promotion': 'Promotion spéciale'
    };

    return titles[type] || 'Notification';
  }

  clearLocalNotifications(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
    this.notificationsCount.next({ total: 0, unread: 0, byType: {} });
    this.recentNotifications.next([]);
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permission de notification accordée');
          // Créer une notification de test
          this.createMockNotification('system' as NotificationType);
        }
      });
    }
  }

  addTestNotifications(count: number = 3): void {
    const types: NotificationType[] = [
      'registration_confirmed',
      'event_reminder',
      'new_event',
      'event_updated',
      'promotion'
    ];

    for (let i = 0; i < count; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      this.createMockNotification(randomType);
    }
  }

  // Méthodes utilitaires
  getNotificationById(id: number): Notification | undefined {
    return this.notifications.value.find(n => n.id === id);
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.value.filter(n => !n.read);
  }

  getReadNotifications(): Notification[] {
    return this.notifications.value.filter(n => n.read);
  }

  getNotificationsByType(type: NotificationType): Notification[] {
    return this.notifications.value.filter(n => n.type === type);
  }

  // NOUVELLE MÉTHODE : Pour convertir les types backend vers frontend
  convertBackendType(backendType: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      'CONFIRMATION': 'registration_confirmed',
      'REMINDER': 'event_reminder',
      'CANCELLATION': 'event_cancelled',
      'UPDATE': 'event_updated',
      'NEW_REGISTRATION': 'NEW_REGISTRATION',
      'REGISTRATION_CANCELLED': 'REGISTRATION_CANCELLED',
      'PARTICIPANT_QUESTION': 'PARTICIPANT_QUESTION',
      'FEEDBACK_RECEIVED': 'FEEDBACK_RECEIVED'
    };

    return typeMap[backendType] || 'system';
  }
}
