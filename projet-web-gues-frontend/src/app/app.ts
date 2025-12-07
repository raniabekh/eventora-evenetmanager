// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Eventora';
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Récupérer l'utilisateur courant
    this.user = this.authService.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/events']);
  }

  // Méthode pour switcher le rôle en développement
  switchRole(): void {
    const currentUser = this.authService.getCurrentUser();
    const currentRole = currentUser?.role as UserRole;

    // Déterminer le nouveau rôle
    let newRole: UserRole;
    if (currentRole === 'ORGANIZER') {
      newRole = 'PARTICIPANT';
    } else if (currentRole === 'PARTICIPANT') {
      newRole = 'ORGANIZER';
    } else {
      newRole = 'ORGANIZER'; // Par défaut
    }

    // Appliquer le changement
    this.authService.setDevRole(newRole);
  }

  // Méthode pour faire un mock login rapide (dev seulement)
  mockLogin(role: UserRole = 'ORGANIZER'): void {
    if (this.authService['mockLogin']) {
      this.authService['mockLogin'](role);
      this.user = this.authService.getCurrentUser();

      // Rediriger vers la bonne page selon le rôle
      if (role === 'ORGANIZER') {
        this.router.navigate(['/organizer/dashboard']);
      } else {
        this.router.navigate(['/events']);
      }
    }
  }
}
