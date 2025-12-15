// src/app/guards/participant.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ParticipantGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Si c'est un participant, autoriser l'accès
    if (this.authService.isParticipant()) {
      return true;
    }

    // Si c'est un organisateur, rediriger vers son dashboard
    if (this.authService.isOrganizer()) {
      this.router.navigate(['/organizer/dashboard']);
      return false;
    }

    // Sinon, rediriger vers login
    this.router.navigate(['/login']);
    return false;
  }
}
