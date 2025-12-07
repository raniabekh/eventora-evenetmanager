// src/app/components/organizer/organizer-dashboard/organizer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizerService, OrganizerStats } from '../../../services/organizer.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.css']
})
export class OrganizerDashboardComponent implements OnInit {
  // Données
  stats: OrganizerStats | null = null;
  upcomingEvents: Event[] = [];
  user: any;

  // États
  isLoading = false;

  // Actions rapides
  quickActions = [
    { icon: '➕', title: 'Créer événement', route: '/organizer/events/create', color: '#10B981' },
    { icon: '📋', title: 'Gérer événements', route: '/organizer/events', color: '#3B82F6' },
    { icon: '👥', title: 'Participants', route: '/organizer/events/1/participants', color: '#8B5CF6' },
    { icon: '📊', title: 'Statistiques', route: '/organizer/analytics', color: '#F59E0B' }
  ];

  // Activités récentes
  recentActivities = [
    { type: 'registration', title: 'Nouvelle inscription', description: 'Jean Dupont à "Conférence Tech"', time: '30 min' },
    { type: 'event', title: 'Événement publié', description: 'Atelier Angular publié', time: '2h' },
    { type: 'message', title: 'Message reçu', description: 'Question sur la date', time: '5h' },
    { type: 'update', title: 'Événement modifié', description: 'Formation React mise à jour', time: '1j' }
  ];

  constructor(
    private organizerService: OrganizerService,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.user = this.authService.getCurrentUser();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Charger les statistiques
    this.organizerService.stats$.subscribe(stats => {
      this.stats = stats;
      this.isLoading = false;
    });

    // Charger les événements à venir
    this.eventService.getEvents().subscribe(events => {
      this.upcomingEvents = events.slice(0, 3); // 3 premiers
    });
  }

  refreshStats(): void {
    this.organizerService.refreshStats();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getAttendancePercentage(event: Event): number {
    return Math.round((event.currentParticipants / event.maxParticipants) * 100);
  }
}
