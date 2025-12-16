// src/app/components/organizer/organizer-dashboard/organizer-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  OrganizerService,
  OrganizerStats,
  OrganizerEvent
} from '../../../services/organizer.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.css']
})
export class OrganizerDashboardComponent implements OnInit {

  // ===== USER =====
  user = {
    firstName: 'Organisateur'
  };

  // ===== DATA =====
  stats: OrganizerStats | null = null;
  upcomingEvents: OrganizerEvent[] = [];
  recentActivities: any[] = [];

  // ===== UI =====
  loading = true;
  error = '';

  // ===== QUICK ACTIONS ✅ (OBLIGATOIRE POUR LE HTML)
  quickActions = [
    {
      title: 'Créer un événement',
      route: '/organizer/events/create',
      icon: '➕',
      color: '#10B981'
    },
    {
      title: 'Gérer mes événements',
      route: '/organizer/manage-events',
      icon: '📋',
      color: '#3B82F6'
    },
    {
      title: 'Voir les inscriptions',
      route: '/organizer/registrations',
      icon: '👥',
      color: '#F59E0B'
    }
  ];

  constructor(
    private organizerService: OrganizerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentActivities();
  }

  // ===== DASHBOARD =====
  loadDashboardData(): void {
    this.loading = true;

    const organizerId = this.authService.getUserId();
    if (!organizerId) {
      this.error = 'Organisateur non identifié';
      this.loading = false;
      return;
    }

    // ===== STATS =====
    this.organizerService.getOrganizerStats(organizerId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.stats = this.organizerService.getMockOrganizerStats();
        this.loading = false;
      }
    });

    // ===== EVENTS =====
    this.organizerService.getOrganizerEvents(organizerId).subscribe({
      next: (events) => {
        this.upcomingEvents = events
          .filter(e => new Date(e.date) > new Date())
          .slice(0, 3);
      },
      error: () => {
        this.upcomingEvents = this.organizerService
          .getMockOrganizerEvents()
          .filter(e => new Date(e.date) > new Date())
          .slice(0, 3);
      }
    });
  }

  // ===== ACTIVITIES =====
  loadRecentActivities(): void {
    this.recentActivities = [
      {
        type: 'registration',
        title: 'Nouvelle inscription',
        description: 'Un participant s’est inscrit à votre événement',
        time: 'Il y a 5 min'
      },
      {
        type: 'event',
        title: 'Événement publié',
        description: 'Votre événement est maintenant en ligne',
        time: 'Il y a 1 heure'
      },
      {
        type: 'update',
        title: 'Événement mis à jour',
        description: 'Informations modifiées',
        time: 'Hier'
      }
    ];
  }

  // ===== UTILS =====
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getAttendancePercentage(event: OrganizerEvent): number {
    if (!event.maxParticipants || event.maxParticipants === 0) return 0;
    return Math.round((event.currentParticipants / event.maxParticipants) * 100);
  }
  refreshStats(): void {
    this.loadDashboardData();
  }

}
