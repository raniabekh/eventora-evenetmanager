import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizerService } from '../../../services/organizer.service';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  eventForm!: FormGroup;
  isEditMode = false;
  eventId?: number;

  isSubmitting = false;
  hasError = false;
  errorMessage = '';

  categories = [
    { value: 'CONFERENCE', label: 'Conférence', icon: '🎤' },
    { value: 'FORMATION', label: 'Formation', icon: '🎓' },
    { value: 'CONCERT', label: 'Concert', icon: '🎵' },
    { value: 'SPORT', label: 'Sport', icon: '⚽' },
    { value: 'NETWORKING', label: 'Networking', icon: '🤝' },
    { value: 'WORKSHOP', label: 'Atelier', icon: '🛠️' }
  ];

  constructor(
    private fb: FormBuilder,
    private organizerService: OrganizerService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      time: ['09:00', Validators.required],
      location: ['', Validators.required],
      maxParticipants: [50, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      isActive: [true]
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEvent();
    }
  }

  loadEvent(): void {
    this.eventService.getEventById(this.eventId!).subscribe(event => {
      if (!event) return;

      const [date, time] = event.date.split('T');

      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        category: event.category,
        date,
        time: time.substring(0, 5),
        location: event.location,
        maxParticipants: event.maxParticipants,
        price: event.price,
        imageUrl: event.imageUrl,
        isActive: event.isActive
      });
    });
  }

  submitEvent(): void {
    if (this.eventForm.invalid) return;

    this.isSubmitting = true;
    this.hasError = false;

    const form = this.eventForm.value;
    const dateTime = new Date(`${form.date}T${form.time}:00`).toISOString();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      date: dateTime,
      maxParticipants: form.maxParticipants,
      price: form.price,
      imageUrl: form.imageUrl,
      isActive: form.isActive
    };

    const request$ = this.isEditMode
      ? this.organizerService.updateEvent(this.eventId!, payload)
      : this.organizerService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/organizer/dashboard']);
      },
      error: err => {
        this.isSubmitting = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message || 'Erreur serveur';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer/dashboard']);
  }

  resetForm(): void {
    this.eventForm.reset({
      maxParticipants: 50,
      price: 0,
      time: '09:00',
      isActive: true
    });
  }

  isPastDate(): boolean {
    const date = this.eventForm.get('date')?.value;
    return date ? new Date(date) < new Date() : false;
  }

  getEstimatedRevenue(): number {
    return this.eventForm.value.maxParticipants * this.eventForm.value.price * 0.7;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // === ERREURS POUR LE TEMPLATE ===
  get titleError() {
    const c = this.eventForm.get('title');
    return c?.touched && c.invalid ? 'Titre requis (min 3 caractères)' : null;
  }

  get descriptionError() {
    const c = this.eventForm.get('description');
    return c?.touched && c.invalid ? 'Description trop courte' : null;
  }

  get dateError() {
    const c = this.eventForm.get('date');
    return c?.touched && c.invalid ? 'Date requise' : null;
  }

  get locationError() {
    const c = this.eventForm.get('location');
    return c?.touched && c.invalid ? 'Lieu requis' : null;
  }

  get maxParticipantsError() {
    const c = this.eventForm.get('maxParticipants');
    return c?.touched && c.invalid ? 'Valeur invalide' : null;
  }

  get priceError() {
    const c = this.eventForm.get('price');
    return c?.touched && c.invalid ? 'Prix invalide' : null;
  }

  get selectedCategory() {
    return this.categories.find(c => c.value === this.eventForm.value.category);
  }

  // ➖ Diminuer le nombre de participants
  decrementParticipants(): void {
    const control = this.eventForm.get('maxParticipants');
    if (!control) return;

    const value = control.value || 1;
    if (value > 1) {
      control.setValue(value - 1);
    }
  }

// ➕ Augmenter le nombre de participants
  incrementParticipants(): void {
    const control = this.eventForm.get('maxParticipants');
    if (!control) return;

    const value = control.value || 1;
    if (value < 1000) {
      control.setValue(value + 1);
    }
  }

}
