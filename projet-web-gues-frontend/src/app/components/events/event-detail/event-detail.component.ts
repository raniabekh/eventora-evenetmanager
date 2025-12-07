// src/app/components/events/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { RegistrationService } from '../../../services/registration.service';
import { AuthService } from '../../../services/auth.service';
import { Event } from '../../../models/event.model';
import { RegistrationStatus } from '../../../models/registration.model';
import { RegistrationFormComponent } from '../registration-form/registration-form.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RegistrationFormComponent
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  eventId: number = 0;
  loading = true;
  error = '';
  registrationSuccess = false;
  // État d'inscription
  registrationStatus: RegistrationStatus = { isRegistered: false };
  registering = false;
  cancelling = false;

  // Galerie
  currentImageIndex = 0;

  // User ID mocké
  currentUserId = 100;

  // Formulaire
  showRegistrationForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private registrationService: RegistrationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = +params['id'];
      this.loadEvent();
      this.loadRegistrationStatus();
    });
  }

  loadEvent(): void {
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (event) {
          this.event = event;
        } else {
          this.error = 'Événement non trouvé';
          this.event = null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Événement non trouvé';
        this.loading = false;
        console.error('Error loading event:', err);
      }
    });
  }

  loadRegistrationStatus(): void {
    this.registrationService.getRegistrationStatus(this.eventId, this.currentUserId)
      .subscribe(status => {
        this.registrationStatus = status;
      });
  }

  // Ouvre le formulaire modal
  openRegistrationForm(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.registrationStatus.isRegistered) {
      alert('Vous êtes déjà inscrit à cet événement !');
      return;
    }

    this.showRegistrationForm = true;
  }

  // Ferme le formulaire modal
  closeRegistrationForm(): void {
    this.showRegistrationForm = false;
  }

  // Méthode existante (pour compatibilité)
  registerToEvent(): void {
    this.openRegistrationForm();
  }

  // Traite la soumission du formulaire
  onRegistrationSubmit(formData: any): void {
    console.log('Données du formulaire:', formData);

    this.registering = true;

    // Utilise la méthode existante du service
    this.registrationService.registerToEvent(this.eventId, this.currentUserId)
      .subscribe({
        next: (registration) => {
          this.registering = false;
          this.registrationStatus = {
            isRegistered: true,
            registrationId: registration.id,
            status: registration.status,
            registrationDate: registration.registrationDate
          };
          this.showRegistrationForm = false;

          // Redirection après 1.5 secondes
          setTimeout(() => {
            this.router.navigate(['/my-registrations']);
          }, 1500);
        },
        error: (err) => {
          this.registering = false;
          console.error('Registration error:', err);
          alert('❌ Erreur lors de l\'inscription');
        }
      });
  }

  cancelRegistration(): void {
    if (!this.registrationStatus.registrationId) return;

    this.cancelling = true;
    this.registrationService.cancelRegistration(this.registrationStatus.registrationId)
      .subscribe({
        next: () => {
          this.cancelling = false;
          this.registrationStatus = { isRegistered: false };
        },
        error: (err) => {
          this.cancelling = false;
          console.error('Cancellation error:', err);
        }
      });
  }

  // Galerie d'images
  nextImage(): void {
    if (this.event?.mediaUrls && this.event.mediaUrls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.event.mediaUrls.length;
    }
  }

  prevImage(): void {
    if (this.event?.mediaUrls && this.event.mediaUrls.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? (this.event.mediaUrls.length - 1)
        : (this.currentImageIndex - 1);
    }
  }

  // CORRIGÉ : Gestion de la propriété phone
  get userProfile() {
    const userData = this.authService.getCurrentUser() as any; // Utilisez 'any' temporairement
    return {
      fullName: userData?.username || 'Utilisateur',
      email: userData?.email || '',
      phone: userData?.phone || '' // Maintenant ça fonctionne avec 'any'
    };
  }

  // Utilitaires
  formatDate(dateString: string): string {
    return this.eventService.formatEventDate(dateString);
  }

  formatShortDate(dateString: string): string {
    return this.eventService.formatShortDate(dateString);
  }

  formatTime(dateString: string): string {
    return this.eventService.formatTime(dateString);
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

  getStatusBadgeColor(status: string | undefined): string {
    switch (status) {
      case 'CONFIRMED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      default: return 'Non inscrit';
    }
  }
}
