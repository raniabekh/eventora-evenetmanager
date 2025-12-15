// src/app/components/events/registration-form/registration-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationService, RegistrationRequest } from '../../../services/registration.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  @Input() eventId!: number;
  @Input() eventTitle: string = '';

  @Output() submitForm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Données du formulaire
  formData = {
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    acceptTerms: false
  };

  // États
  isLoading = false;
  errors: string[] = [];
  showSuccess = false;

  constructor(
    private registrationService: RegistrationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.prefillUserData();
  }

  // Pré-remplir avec les données utilisateur
  prefillUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.formData.participantName = currentUser.username || '';
      this.formData.participantEmail = currentUser.email || '';
    }
  }

  // Validation
  validateForm(): boolean {
    this.errors = [];

    if (!this.formData.participantName.trim()) {
      this.errors.push('Le nom complet est requis');
    }

    if (!this.formData.participantEmail.trim()) {
      this.errors.push('L\'email est requis');
    } else if (!this.isValidEmail(this.formData.participantEmail)) {
      this.errors.push('Format d\'email invalide');
    }

    if (this.formData.participantPhone && !this.isValidPhone(this.formData.participantPhone)) {
      this.errors.push('Format de téléphone invalide');
    }

    if (!this.formData.acceptTerms) {
      this.errors.push('Vous devez accepter les conditions');
    }

    return this.errors.length === 0;
  }

  // Soumission
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const registrationRequest: RegistrationRequest = {
      participantName: this.formData.participantName,
      participantEmail: this.formData.participantEmail,
      participantPhone: this.formData.participantPhone || undefined,
      acceptTerms: this.formData.acceptTerms
    };

    this.registrationService.registerToEvent(this.eventId, registrationRequest)
      .subscribe({
        next: (registration) => {
          this.isLoading = false;
          this.showSuccess = true;

          // Attendre 1 seconde avant d'émettre l'événement
          setTimeout(() => {
            this.submitForm.emit({
              success: true,
              registration: registration
            });
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errors = [error.error?.message || 'Erreur lors de l\'inscription'];
          this.submitForm.emit({
            success: false,
            error: error,
            message: this.errors[0]
          });
        }
      });
  }

  // Annulation
  onCancel(): void {
    this.cancel.emit();
  }

  // Utilitaires de validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Format français: 0612345678, 06 12 34 56 78, +33612345678
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:\d{2}){4}$/;
    return phoneRegex.test(cleanPhone);
  }

  // Formater le téléphone en temps réel
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    if (value.length > 0) {
      const formatted = [];
      if (value.startsWith('0')) {
        formatted.push(value.substring(0, 2));
        if (value.length > 2) formatted.push(value.substring(2, 4));
        if (value.length > 4) formatted.push(value.substring(4, 6));
        if (value.length > 6) formatted.push(value.substring(6, 8));
        if (value.length > 8) formatted.push(value.substring(8, 10));
        value = formatted.join(' ');
      }
    }

    this.formData.participantPhone = value;
  }

  // Méthodes pour le template
  hasError(fieldName: string): boolean {
    return this.errors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  }

  getError(fieldName: string): string {
    return this.errors.find(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    ) || '';
  }
}
