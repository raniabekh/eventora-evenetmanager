// src/app/components/registrations/my-registrations/my-registrations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  RegistrationService,
  Registration
} from '../../../services/registration.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.css']
})
export class MyRegistrationsComponent implements OnInit {
  registrations: Registration[] = [];
  filteredRegistrations: Registration[] = [];

  // États
  loading = true;
  error = '';

  // Filtres
  statusFilter = 'ALL';

  constructor(
    private registrationService: RegistrationService,
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Vous devez être connecté';
      this.loading = false;
      return;
    }

    this.registrationService.getUserRegistrations(currentUser.id).subscribe({
      next: (regs) => {
        this.registrations = regs;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading registrations:', err);
        this.error = 'Erreur lors du chargement des inscriptions';
        this.loading = false;
      }
    });
  }

  // Appliquer le filtre
  applyFilter(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredRegistrations = [...this.registrations];
    } else {
      this.filteredRegistrations = this.registrations.filter(
        r => r.status === this.statusFilter
      );
    }
  }

  // Compteurs
  get confirmedCount(): number {
    return this.registrations.filter(r => r.status === 'CONFIRMED').length;
  }

  get pendingCount(): number {
    return this.registrations.filter(r => r.status === 'PENDING').length;
  }

  get cancelledCount(): number {
    return this.registrations.filter(r => r.status === 'CANCELLED').length;
  }

  // Annuler une inscription
  cancelRegistration(registrationId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      return;
    }

    this.registrationService.cancelRegistration(registrationId).subscribe({
      next: () => {
        // Mettre à jour localement
        const index = this.registrations.findIndex(r => r.id === registrationId);
        if (index !== -1) {
          this.registrations[index].status = 'CANCELLED';
          this.applyFilter();
        }
        alert('Inscription annulée avec succès');
      },
      error: (err) => {
        console.error('Error cancelling registration:', err);
        alert('Erreur lors de l\'annulation');
      }
    });
  }

  // Utilitaires
  formatShortDate(dateString: string): string {
    return this.eventService.formatShortDate(dateString);
  }

  formatTime(dateString: string): string {
    return this.eventService.formatTime(dateString);
  }

  getStatusIcon(status: string): string {
    return this.registrationService.getStatusIcon(status);
  }

  getStatusColor(status: string): string {
    return this.registrationService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.registrationService.getStatusText(status);
  }

  getCategoryIcon(category: string): string {
    return this.eventService.getCategoryIcon(category);
  }

  getCategoryColor(category: string): string {
    return this.eventService.getCategoryColor(category);
  }

  trackByRegistrationId(index: number, reg: Registration): number {
    return reg.id;
  }
}
