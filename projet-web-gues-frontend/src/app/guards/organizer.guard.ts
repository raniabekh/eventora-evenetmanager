// src/app/guards/organizer.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizerGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Si c'est un organisateur, autoriser l'accès
    if (this.authService.isOrganizer()) {
      return true;
    }

    // Si c'est un participant, rediriger vers events (mais events est protégé)
    // Donc rediriger vers la page d'accueil
    if (this.authService.isParticipant()) {
      this.router.navigate(['/']); // La page d'accueil redirigera
      return false;
    }

    // Sinon, rediriger vers login
    this.router.navigate(['/login']);
    return false;
  }
}
