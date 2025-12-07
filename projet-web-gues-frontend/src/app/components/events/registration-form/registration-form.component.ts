// src/app/components/events/registration-form/registration-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationFormData, RegistrationFormErrors } from '../../../models/registration-form.model';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  @Input() eventId!: number;
  @Input() userId!: number;
  @Input() eventTitle: string = '';
  @Input() userProfile?: { fullName?: string; email?: string; phone?: string };

  @Output() submitForm = new EventEmitter<RegistrationFormData>();
  @Output() cancel = new EventEmitter<void>();

  // Données du formulaire
  formData: RegistrationFormData = {
    eventId: 0,
    userId: 0,
    fullName: '',
    email: '',
    phone: '',
    acceptTerms: false,
    registrationDate: ''
  };

  // Erreurs de validation
  errors: RegistrationFormErrors = {};

  // État
  isSubmitting = false;
  showSuccess = false;

  ngOnInit(): void {
    // Initialiser avec les IDs
    this.formData.eventId = this.eventId;
    this.formData.userId = this.userId;

    // Pré-remplir avec le profil utilisateur si disponible
    if (this.userProfile) {
      this.formData.fullName = this.userProfile.fullName || '';
      this.formData.email = this.userProfile.email || '';
      this.formData.phone = this.userProfile.phone || '';
    }
  }

  // Validation du formulaire
  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Nom complet
    if (!this.formData.fullName.trim()) {
      this.errors.fullName = 'Le nom complet est requis';
      isValid = false;
    } else if (this.formData.fullName.trim().length < 2) {
      this.errors.fullName = 'Le nom doit contenir au moins 2 caractères';
      isValid = false;
    }

    // Email
    if (!this.formData.email.trim()) {
      this.errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.errors.email = 'Format d\'email invalide';
      isValid = false;
    }

    // Téléphone (optionnel mais si rempli, validation)
    if (this.formData.phone.trim() && !this.isValidPhone(this.formData.phone)) {
      this.errors.phone = 'Format de téléphone invalide';
      isValid = false;
    }

    // Conditions
    if (!this.formData.acceptTerms) {
      this.errors.acceptTerms = 'Vous devez accepter les conditions';
      isValid = false;
    }

    return isValid;
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.validateForm()) {
      this.isSubmitting = true;

      // Ajouter la date d'inscription
      this.formData.registrationDate = new Date().toISOString();

      // Simuler un délai pour l'UX
      setTimeout(() => {
        this.submitForm.emit({ ...this.formData });
        this.isSubmitting = false;
        this.showSuccess = true;

        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          this.showSuccess = false;
        }, 2000);
      }, 1000);
    }
  }

  // Annulation
  onCancel(): void {
    this.cancel.emit();
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.formData = {
      eventId: this.eventId,
      userId: this.userId,
      fullName: this.userProfile?.fullName || '',
      email: this.userProfile?.email || '',
      phone: this.userProfile?.phone || '',
      acceptTerms: false,
      registrationDate: ''
    };
    this.errors = {};
    this.showSuccess = false;
  }

  // Utilitaires de validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Accepte : 0612345678, 06 12 34 56 78, +33612345678
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  }

  // Formater le téléphone au fur et à mesure
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    if (value.length > 0) {
      value = value.match(/.{1,2}/g)?.join(' ') || value;
    }

    this.formData.phone = value;
  }

  // Gestion des erreurs
  hasError(field: keyof RegistrationFormErrors): boolean {
    return !!this.errors[field];
  }

  getError(field: keyof RegistrationFormErrors): string {
    return this.errors[field] || '';
  }
}
