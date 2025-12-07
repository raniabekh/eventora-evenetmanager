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
    const user = this.authService.getCurrentUser();

    // VERSION SIMPLE POUR LE DEV
    if (user && user.role === 'ORGANIZER') {
      return true;
    }

    // Rediriger vers la page événements pour participants
    this.router.navigate(['/events']);
    return false;
  }
}
