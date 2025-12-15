// src/app/components/organizer/create-event/create-event.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizerService } from '../../../services/organizer.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  // Mode édition ou création
  isEditMode = false;
  eventId: number | null = null;

  // Données événement
  eventData = {
    title: '',
    description: '',
    category: 'CONFERENCE',
    date: '',
    time: '09:00',
    location: '',
    maxParticipants: 50,
    price: 0,
    imageUrl: '',
    isActive: true
  };

  // Catégories
  categories = [
    { value: 'CONFERENCE', label: 'Conférence' },
    { value: 'FORMATION', label: 'Formation' },
    { value: 'CONCERT', label: 'Concert' },
    { value: 'SPORT', label: 'Sport' },
    { value: 'NETWORKING', label: 'Networking' },
    { value: 'WORKSHOP', label: 'Atelier' }
  ];

  // États
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private organizerService: OrganizerService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEventData();
    }

    // Initialiser la date par défaut (demain)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.eventData.date = tomorrow.toISOString().split('T')[0];
  }

  loadEventData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (event) {
          // Remplir le formulaire
          this.eventData.title = event.title;
          this.eventData.description = event.description || '';
          this.eventData.category = event.category;
          this.eventData.date = event.date.split('T')[0];
          this.eventData.time = event.date.split('T')[1].substring(0, 5);
          this.eventData.location = event.location;
          this.eventData.maxParticipants = event.maxParticipants;
          this.eventData.price = event.price || 0;
          this.eventData.imageUrl = event.imageUrl || '';
          this.eventData.isActive = event.isActive !== false;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.error = 'Impossible de charger l\'événement';
        this.loading = false;
      }
    });
  }

  // Validation
  validateForm(): boolean {
    if (!this.eventData.title.trim()) {
      this.error = 'Le titre est requis';
      return false;
    }

    if (!this.eventData.date) {
      this.error = 'La date est requise';
      return false;
    }

    if (!this.eventData.location.trim()) {
      this.error = 'Le lieu est requis';
      return false;
    }

    if (this.eventData.maxParticipants < 1) {
      this.error = 'Le nombre de participants doit être positif';
      return false;
    }

    if (this.eventData.price < 0) {
      this.error = 'Le prix ne peut pas être négatif';
      return false;
    }

    return true;
  }

  // Soumission
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;

    // Préparer les données
    const eventDate = new Date(`${this.eventData.date}T${this.eventData.time}:00`);

    const eventToSubmit = {
      title: this.eventData.title,
      description: this.eventData.description,
      category: this.eventData.category,
      date: eventDate.toISOString(),
      location: this.eventData.location,
      maxParticipants: this.eventData.maxParticipants,
      price: this.eventData.price,
      imageUrl: this.eventData.imageUrl || undefined,
      isActive: this.eventData.isActive
    };

    if (this.isEditMode && this.eventId) {
      // Mise à jour
      this.organizerService.updateEvent(this.eventId, eventToSubmit).subscribe({
        next: () => {
          this.submitting = false;
          alert('✅ Événement mis à jour avec succès');
          this.router.navigate(['/organizer/dashboard']);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Erreur lors de la mise à jour';
        }
      });
    } else {
      // Création
      this.organizerService.createEvent(eventToSubmit).subscribe({
        next: () => {
          this.submitting = false;
          alert('✅ Événement créé avec succès');
          this.router.navigate(['/organizer/dashboard']);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }

  // Annulation
  onCancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/organizer/dashboard']);
    }
  }

  // Utilitaires
  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get estimatedRevenue(): number {
    const attendanceRate = 0.7; // 70% de remplissage estimé
    const estimatedParticipants = Math.floor(this.eventData.maxParticipants * attendanceRate);
    return estimatedParticipants * this.eventData.price;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
