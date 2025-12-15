// src/app/app.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { OrganizerService } from './services/organizer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Eventora';
  user: any = null;

  // Compteurs de notifications
  unreadCount = 0;
  unreadOrganizerCount = 0;
  pendingRegistrationsCount = 0;

  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private organizerService: OrganizerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger l'utilisateur initial
    this.user = this.authService.getCurrentUser();

    // S'abonner aux changements d'utilisateur
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.loadNotificationCounts();
    });
    this.subscriptions.add(userSub);

    // Charger les compteurs initiaux
    this.loadNotificationCounts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Méthode pour obtenir le lien d'accueil selon le rôle
  getHomeLink(): string {
    if (!this.isLoggedIn()) {
      return '/login'; // Rediriger vers login si non connecté
    }

    // Si connecté, rediriger selon le rôle
    return this.user?.role === 'ORGANIZER' ? '/organizer/dashboard' : '/events';
  }
  // Vérifier si connecté
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Déconnexion
  logout(): void {
    this.authService.logout();
  }

  // Charger les compteurs de notifications
  loadNotificationCounts(): void {
    if (this.isLoggedIn()) {
      // Notifications participant
      if (this.user?.role === 'PARTICIPANT') {
        const notificationSub = this.notificationService.getUnreadCount().subscribe(count => {
          this.unreadCount = count;
        });
        this.subscriptions.add(notificationSub);

        // Simuler des inscriptions en attente (à remplacer par ton service)
        this.pendingRegistrationsCount = 3; // Valeur mock
      }

      // Notifications organisateur
      if (this.user?.role === 'ORGANIZER') {
        const organizerSub = this.organizerService.getUnreadNotificationsCount().subscribe(count => {
          this.unreadOrganizerCount = count;
        });
        this.subscriptions.add(organizerSub);
      }
    } else {
      this.unreadCount = 0;
      this.unreadOrganizerCount = 0;
      this.pendingRegistrationsCount = 0;
    }
  }

  // Vérifier s'il y a des inscriptions en attente (méthode mock)
  hasPendingRegistrations(): boolean {
    return this.pendingRegistrationsCount > 0;
  }
}
