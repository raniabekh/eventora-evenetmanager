import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { RegistrationService, Registration } from '../../../services/registration.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { RegistrationView } from '../../../models/registration-view.model';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.css']
})
export class MyRegistrationsComponent implements OnInit {

  registrations: RegistrationView[] = [];
  filteredRegistrations: RegistrationView[] = [];

  loading = true;
  error = '';
  statusFilter: 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' = 'ALL';

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

    if (!this.authService.isLoggedIn()) {
      this.error = 'Vous devez être connecté';
      this.loading = false;
      return;
    }

    // ✅ APPEL SANS PARAMÈTRE
    this.registrationService.getUserRegistrations().subscribe({
      next: (regs: Registration[]) => {

        if (regs.length === 0) {
          this.registrations = [];
          this.applyFilter();
          this.loading = false;
          return;
        }

        const eventCalls = regs.map(reg =>
          this.eventService.getEventById(reg.eventId)
        );

        forkJoin(eventCalls).subscribe(events => {
          this.registrations = regs.map((reg, index) => {
            const event = events[index];

            return {
              id: reg.id,
              eventId: reg.eventId,
              status: reg.status,
              registrationDate: reg.registrationDate,

              eventTitle: event?.title ?? 'Événement supprimé',
              eventCategory: event?.category ?? 'AUTRE',
              eventDate: event?.date ?? reg.registrationDate,
              eventLocation: event?.location ?? '—'
            };
          });

          this.applyFilter();
          this.loading = false;
        });
      },
      error: () => {
        this.error = 'Erreur lors du chargement des inscriptions';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredRegistrations =
      this.statusFilter === 'ALL'
        ? [...this.registrations]
        : this.registrations.filter(r => r.status === this.statusFilter);
  }

  // ===== COUNTERS =====
  get confirmedCount(): number {
    return this.registrations.filter(r => r.status === 'CONFIRMED').length;
  }

  get pendingCount(): number {
    return this.registrations.filter(r => r.status === 'PENDING').length;
  }

  get cancelledCount(): number {
    return this.registrations.filter(r => r.status === 'CANCELLED').length;
  }

  cancelRegistration(registrationId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) return;

    this.registrationService.cancelRegistration(registrationId).subscribe({
      next: () => {
        const reg = this.registrations.find(r => r.id === registrationId);
        if (reg) reg.status = 'CANCELLED';
        this.applyFilter();
        alert('Inscription annulée');
      },
      error: () => alert('Erreur lors de l’annulation')
    });
  }

  // ===== UI HELPERS =====
  formatShortDate = (d: string) => this.eventService.formatShortDate(d);
  formatTime = (d: string) => this.eventService.formatTime(d);
  getStatusIcon = (s: string) => this.registrationService.getStatusIcon(s);
  getStatusColor = (s: string) => this.registrationService.getStatusColor(s);
  getStatusText = (s: string) => this.registrationService.getStatusText(s);
  getCategoryIcon = (c: string) => this.eventService.getCategoryIcon(c);
  getCategoryColor = (c: string) => this.eventService.getCategoryColor(c);

  trackByRegistrationId(index: number, reg: RegistrationView): number {
    return reg.id;
  }
}
