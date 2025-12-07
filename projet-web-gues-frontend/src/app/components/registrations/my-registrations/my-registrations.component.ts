// src/app/components/registrations/my-registrations/my-registrations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../../services/registration.service';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.css']
})
export class MyRegistrationsComponent implements OnInit {
  // Données mockées pour tester
  registrations = [
    {
      id: 1,
      eventId: 1,
      eventTitle: 'Conférence Tech 2024',
      eventDate: '2024-12-15T09:00:00',
      eventLocation: 'Paris Expo',
      eventCategory: 'CONFERENCE',
      status: 'CONFIRMED',
      registrationDate: '2024-12-01T10:30:00'
    },
    {
      id: 2,
      eventId: 2,
      eventTitle: 'Formation Angular',
      eventDate: '2024-12-20T09:00:00',
      eventLocation: 'En ligne',
      eventCategory: 'FORMATION',
      status: 'PENDING',
      registrationDate: '2024-12-02T14:15:00'
    },
    {
      id: 3,
      eventId: 3,
      eventTitle: 'Concert Jazz de Noël',
      eventDate: '2024-12-25T20:00:00',
      eventLocation: 'Salle Pleyel, Lyon',
      eventCategory: 'CONCERT',
      status: 'CANCELLED',
      registrationDate: '2024-11-28T09:45:00'
    }
  ];

  // Propriétés calculées pour les compteurs
  get confirmedCount(): number {
    return this.registrations.filter(r => r.status === 'CONFIRMED').length;
  }

  get pendingCount(): number {
    return this.registrations.filter(r => r.status === 'PENDING').length;
  }

  get cancelledCount(): number {
    return this.registrations.filter(r => r.status === 'CANCELLED').length;
  }

  // États
  loading = false;  // ← DÉSACTIVÉ pour l'instant
  error = '';

  // Filtres
  statusFilter = 'ALL';

  // User ID
  currentUserId = 100;

  constructor(
    private registrationService: RegistrationService,
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    // CHARGEMENT INSTANTANÉ - pas de délai
    this.loading = true;
    this.loading = false; // ← DÉSACTIVÉ IMMÉDIATEMENT
  }

  // Filtrage
  get filteredRegistrations() {
    if (this.statusFilter === 'ALL') {
      return this.registrations;
    }
    return this.registrations.filter(r => r.status === this.statusFilter);
  }

  // Annuler une inscription
  cancelRegistration(registrationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      console.log('Annulation de l\'inscription:', registrationId);
      // Ici, plus tard : appel au service
    }
  }

  // Utilitaires
  formatShortDate(dateString: string): string {
    return this.eventService.formatShortDate(dateString);
  }

  formatTime(dateString: string): string {
    return this.eventService.formatTime(dateString);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '✅';
      case 'PENDING': return '⏳';
      case 'CANCELLED': return '❌';
      default: return '📅';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      default: return 'Inconnu';
    }
  }

  getCategoryIcon(category: string): string {
    return this.eventService.getCategoryIcon(category);
  }

  getCategoryColor(category: string): string {
    return this.eventService.getCategoryColor(category);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Pour la pagination/détection
  trackByRegistrationId(index: number, registration: any): number {
    return registration.id;
  }
}
