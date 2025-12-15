// src/app/components/role-redirect/role-redirect.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>Redirection en cours...</p>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RoleRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.redirectBasedOnRole();
  }

  redirectBasedOnRole(): void {
    setTimeout(() => {
      if (!this.authService.isLoggedIn()) {
        // Non connecté → page de connexion
        this.router.navigate(['/login']);
        return;
      }

      const role = this.authService.getUserRole();

      if (role === 'ORGANIZER') {
        this.router.navigate(['/organizer/dashboard']);
      } else if (role === 'PARTICIPANT') {
        this.router.navigate(['/events']);
      } else {
        // Rôle inconnu → page de connexion
        this.router.navigate(['/login']);
      }
    }, 500); // Petit délai pour l'UX
  }
}
