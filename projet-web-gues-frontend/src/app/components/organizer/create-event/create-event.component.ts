// src/app/components/organizer/create-event/create-event.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizerService } from '../../../services/organizer.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  isEditMode = false;
  eventId: number | null = null;
  eventForm!: FormGroup;

  // Catégories
  categories = [
    { value: 'CONFERENCE', label: 'Conférence', icon: '🎤' },
    { value: 'FORMATION', label: 'Formation', icon: '📚' },
    { value: 'CONCERT', label: 'Concert', icon: '🎵' },
    { value: 'SPORT', label: 'Sport', icon: '🏟️' },
    { value: 'NETWORKING', label: 'Networking', icon: '🤝' },
    { value: 'WORKSHOP', label: 'Atelier', icon: '🛠️' }
  ];

  loading = false;
  submitting = false;
  errorMessage = '';

  private defaultTime = '09:00';

  constructor(
    private organizerService: OrganizerService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // Vérifier si on est en mode édition
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEventData();
    }
  }

  buildForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['CONFERENCE', Validators.required],
      date: [tomorrow.toISOString().split('T')[0], Validators.required],
      time: [this.defaultTime, Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      maxParticipants: [50, [Validators.required, Validators.min(1), Validators.max(1000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  loadEventData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (event) {
          const [datePart, timePart] = event.date.split('T');
          this.eventForm.patchValue({
            title: event.title,
            description: event.description || '',
            category: event.category,
            date: datePart,
            time: timePart?.substring(0, 5) || this.defaultTime,
            location: event.location,
            maxParticipants: event.maxParticipants,
            price: event.price || 0,
            imageUrl: event.imageUrl || '',
            isActive: event.isActive !== false
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.errorMessage = 'Impossible de charger l\'événement';
        this.loading = false;
      }
    });
  }

  // Soumission
  submitEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.errorMessage = 'Merci de corriger les champs requis.';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    const formValue = this.eventForm.value;
    const eventDate = new Date(`${formValue.date}T${formValue.time}:00`);

    const eventToSubmit = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      date: eventDate.toISOString(),
      location: formValue.location,
      maxParticipants: formValue.maxParticipants,
      price: formValue.price,
      imageUrl: formValue.imageUrl || undefined,
      isActive: formValue.isActive
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
          this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
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
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/organizer/dashboard']);
    }
  }

  resetForm(): void {
    this.eventForm.reset({
      title: '',
      description: '',
      category: 'CONFERENCE',
      date: new Date().toISOString().split('T')[0],
      time: this.defaultTime,
      location: '',
      maxParticipants: 50,
      price: 0,
      imageUrl: '',
      isActive: true
    });
    this.errorMessage = '';
  }

  // Utilitaires
  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  isPastDate(): boolean {
    const selectedDate = this.eventForm?.get('date')?.value;
    if (!selectedDate) return false;
    return new Date(selectedDate) < new Date(this.today);
  }

  decrementParticipants(): void {
    const control = this.eventForm.get('maxParticipants');
    const value = control?.value || 1;
    control?.setValue(Math.max(1, value - 1));
  }

  incrementParticipants(): void {
    const control = this.eventForm.get('maxParticipants');
    const value = control?.value || 1;
    control?.setValue(Math.min(1000, value + 1));
  }

  getEstimatedRevenue(): number {
    const price = this.eventForm.get('price')?.value || 0;
    const capacity = this.eventForm.get('maxParticipants')?.value || 0;
    const attendanceRate = 0.7;
    return Math.floor(capacity * attendanceRate * price);
  }

  get selectedCategory() {
    const value = this.eventForm?.get('category')?.value;
    return this.categories.find(cat => cat.value === value);
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get titleError(): string | null {
    const control = this.eventForm.get('title');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) return 'Le titre est requis';
      if (control.errors?.['minlength']) return 'Le titre doit faire au moins 5 caractères';
    }
    return null;
  }

  get descriptionError(): string | null {
    const control = this.eventForm.get('description');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) return 'La description est requise';
      if (control.errors?.['minlength']) return 'La description doit faire au moins 10 caractères';
    }
    return null;
  }

  get dateError(): string | null {
    const control = this.eventForm.get('date');
    if (control?.touched && control.invalid) {
      return 'La date est requise';
    }
    return null;
  }

  get locationError(): string | null {
    const control = this.eventForm.get('location');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) return 'Le lieu est requis';
      if (control.errors?.['minlength']) return 'Le lieu doit faire au moins 3 caractères';
    }
    return null;
  }

  get maxParticipantsError(): string | null {
    const control = this.eventForm.get('maxParticipants');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) return 'Nombre de participants requis';
      if (control.errors?.['min']) return 'Doit être au moins 1';
      if (control.errors?.['max']) return 'Ne peut pas dépasser 1000';
    }
    return null;
  }

  get priceError(): string | null {
    const control = this.eventForm.get('price');
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) return 'Le prix est requis';
      if (control.errors?.['min']) return 'Le prix ne peut pas être négatif';
    }
    return null;
  }

  get isSubmitting(): boolean {
    return this.submitting;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
