// src/app/components/organizer/organizer-dashboard/organizer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizerService, OrganizerStats, OrganizerEvent } from '../../../services/organizer.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.css']
})
export class OrganizerDashboardComponent implements OnInit {
  stats: OrganizerStats | null = null;
  upcomingEvents: OrganizerEvent[] = [];
  recentRegistrations: any[] = [];

  loading = true;
  error = '';

  constructor(
    private organizerService: OrganizerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    const organizerId = this.authService.getUserId();
    if (!organizerId) {
      this.error = 'Organisateur non identifié';
      this.loading = false;
      return;
    }

    // Charger les statistiques
    this.organizerService.getOrganizerStats(organizerId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.stats = this.organizerService.getMockOrganizerStats();
        this.loading = false;
      }
    });

    // Charger les événements à venir
    this.organizerService.getOrganizerEvents(organizerId).subscribe({
      next: (events) => {
        this.upcomingEvents = events
          .filter(event => new Date(event.date) > new Date())
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.upcomingEvents = this.organizerService.getMockOrganizerEvents()
          .filter(event => new Date(event.date) > new Date())
          .slice(0, 3);
      }
    });
  }

  // Utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getEventStatus(event: OrganizerEvent): string {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (eventDate < now) {
      return 'Terminé';
    } else if (event.attendanceRate >= 90) {
      return 'Presque complet';
    } else {
      return 'À venir';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Terminé': return '#6B7280';
      case 'Presque complet': return '#EF4444';
      case 'À venir': return '#10B981';
      default: return '#6B7280';
    }
  }
}
