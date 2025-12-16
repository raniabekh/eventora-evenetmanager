// src/app/components/events/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { RegistrationService } from '../../../services/registration.service';
import { AuthService } from '../../../services/auth.service';
import { Event } from '../../../models/event.model';

// IMPORT DU FORMULAIRE
import { RegistrationFormComponent } from '../registration-form/registration-form.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RegistrationFormComponent // AJOUTER ICI
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  eventId: number = 0;
  loading = true;
  error = '';

  // État d'inscription
  isRegistered = false;
  currentRegistration: any = null;
  registering = false;
  cancelling = false;

  // Galerie d'images
  currentImageIndex = 0;

  // MODALE DE FORMULAIRE
  showRegistrationForm = false;
  showSuccessModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private registrationService: RegistrationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = +params['id'];
      this.loadEvent();
      this.checkRegistration();
    });
  }

  loadEvent(): void {
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event || null;
        this.loading = false;
        console.log('✅ Event loaded:', event);
      },
      error: (err) => {
        console.error('❌ Error loading event:', err);
        this.error = 'Événement non trouvé';
        this.loading = false;
      }
    });
  }

  checkRegistration(): void {
    if (!this.isLoggedIn()) return;

    const userId = this.authService.getUserId();
    if (!userId) return;

    this.registrationService.getUserRegistrations()
      .subscribe({
        next: (registrations) => {
          const registration = registrations.find(reg => reg.eventId === this.eventId);
          this.isRegistered = !!registration;
          this.currentRegistration = registration || null;
          console.log('📋 Registration status:', { isRegistered: this.isRegistered });
        },
        error: (err) => {
          console.error('❌ Error checking registration:', err);
        }
      });
  }

  // ========== GESTION DU FORMULAIRE D'INSCRIPTION ==========

  // Ouvrir le formulaire
  openRegistrationForm(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/events/${this.eventId}` }
      });
      return;
    }

    if (this.isRegistered) {
      alert('Vous êtes déjà inscrit à cet événement !');
      return;
    }

    // Vérifier si l'événement est complet
    if (this.isEventFull()) {
      alert('Désolé, cet événement est complet !');
      return;
    }

    // Afficher le formulaire
    this.showRegistrationForm = true;
  }

  // Fermer le formulaire
  closeRegistrationForm(): void {
    this.showRegistrationForm = false;
  }

  // Gérer la soumission du formulaire
  onRegistrationSubmit(result: any): void {
    if (result.success) {
      this.isRegistered = true;
      this.currentRegistration = result.registration;
      this.showRegistrationForm = false;

      // Afficher une modal de succès
      this.showSuccessModal = true;

      // Rediriger après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/my-registrations']);
      }, 3000);
    } else {
      // Gérer l'erreur
      alert('Erreur lors de l\'inscription: ' + result.message);
      this.showRegistrationForm = false;
    }
  }

  // Annuler l'inscription
  cancelRegistration(): void {
    if (!this.currentRegistration?.id) {
      console.error('No registration ID found');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      return;
    }

    this.cancelling = true;
    this.registrationService.cancelRegistration(this.currentRegistration.id)
      .subscribe({
        next: () => {
          this.cancelling = false;
          this.isRegistered = false;
          this.currentRegistration = null;
          alert('✅ Inscription annulée avec succès');
          console.log('✅ Registration cancelled');

          // Recharger l'événement pour mettre à jour le compteur
          this.loadEvent();
        },
        error: (err) => {
          this.cancelling = false;
          console.error('❌ Cancellation error:', err);
          alert('❌ Erreur lors de l\'annulation');
        }
      });
  }

  // ========== UTILITAIRES ==========

  // Galerie d'images
  nextImage(): void {
    if (this.event?.mediaUrls && this.event.mediaUrls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.event.mediaUrls.length;
    }
  }

  prevImage(): void {
    if (this.event?.mediaUrls && this.event.mediaUrls.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.event.mediaUrls.length - 1
        : this.currentImageIndex - 1;
    }
  }

  // Vérifier si l'événement est complet
  isEventFull(): boolean {
    if (!this.event) return false;
    return this.event.currentParticipants >= this.event.maxParticipants;
  }

  // Calculer le pourcentage de remplissage
  getOccupancyPercentage(): number {
    if (!this.event || this.event.maxParticipants === 0) return 0;
    return Math.round((this.event.currentParticipants / this.event.maxParticipants) * 100);
  }

  // Méthodes pass-through
  formatDate = (date: string) => this.eventService.formatEventDate(date);
  formatShortDate = (date: string) => this.eventService.formatShortDate(date);
  formatTime = (date: string) => this.eventService.formatTime(date);
  getCategoryIcon = (category: string) => this.eventService.getCategoryIcon(category);
  getCategoryColor = (category: string) => this.eventService.getCategoryColor(category);
  getPriceDisplay = (price: number) => this.eventService.getPriceDisplay(price);
  getEventImage = (event: Event) => this.eventService.getEventImage(event);
  isLoggedIn = () => this.authService.isLoggedIn();

  // Fermer la modal de succès
  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/my-registrations']);
  }
}
