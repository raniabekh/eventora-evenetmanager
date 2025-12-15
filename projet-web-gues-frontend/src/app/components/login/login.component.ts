// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    username: '',
    password: ''
  };

  rememberMe = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📱 Page login chargée');

    // Récupérer username et password depuis localStorage
    const registeredUsername = localStorage.getItem('registered_username');
    const registeredPassword = localStorage.getItem('registered_password');

    if (registeredUsername) {
      console.log('👤 Username récupéré:', registeredUsername);
      this.credentials.username = registeredUsername;
      localStorage.removeItem('registered_username'); // Nettoyer
    }

    if (registeredPassword) {
      console.log('🔑 Password récupéré');
      this.credentials.password = registeredPassword;
      localStorage.removeItem('registered_password'); // Nettoyer
    }
  }

  onLogin(): void {
    console.log('🔑 Tentative de connexion:', this.credentials.username);

    // Validation simple
    if (!this.credentials.username || !this.credentials.password) {
      this.error = 'Remplissez tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        console.log('✅ Connexion réussie:', response);
        this.loading = false;

        // Remember me
        if (this.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // ✅ REDIRECTION VERS LA PAGE D'ACCUEIL UNIQUE
        this.router.navigate(['/events']);
      },
      error: (err: any) => {
        console.error('❌ Erreur connexion:', err);
        this.loading = false;
        this.error = 'Identifiants incorrects';
      }
    });
  }
}
