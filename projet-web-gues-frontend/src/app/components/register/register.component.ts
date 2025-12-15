import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    role: 'PARTICIPANT'
  };

  confirmPassword: string = '';
  acceptTerms: boolean = true;
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegister(): void {
    this.error = '';
    this.success = '';

    // Validation
    const errors = [];
    if (!this.userData.username.trim()) errors.push('Username requis');
    if (!this.userData.email.trim()) errors.push('Email requis');
    if (!this.isValidEmail(this.userData.email)) errors.push('Email invalide');
    if (!this.userData.password.trim()) errors.push('Mot de passe requis');
    if (this.userData.password.length < 6) errors.push('Mot de passe trop court (min 6)');
    if (this.userData.password !== this.confirmPassword) errors.push('Mots de passe différents');
    if (!this.userData.role) errors.push('Rôle requis');

    if (errors.length > 0) {
      this.error = errors.join(', ');
      return;
    }

    console.log('🚀 Inscription avec:', this.userData);
    this.loading = true;

    // Appel au service d'inscription
    this.authService.register(this.userData).subscribe({
      next: (response: any) => {
        console.log('✅ Inscription réussie:', response);
        this.loading = false;
        this.success = 'Compte créé ! Redirection...';

        // ✅ REDIRECTION DIRECTE VERS /events (comme login)
        // Le AuthService gère déjà le stockage du token et user
        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('❌ Erreur inscription:', err);
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 0) {
          this.error = 'Serveur inaccessible. Vérifiez le backend.';
        } else {
          this.error = 'Erreur lors de l\'inscription';
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
