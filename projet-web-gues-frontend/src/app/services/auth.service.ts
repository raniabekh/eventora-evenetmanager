// services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

// AJOUTEZ LES TYPES DE RÔLE
export type UserRole = 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id?: number;
  userId?: string;
  username: string;
  email: string;
  role?: UserRole;  // ← CHANGEZ ICI : string → UserRole
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId?: string;
  role?: string;
  message?: string;
}

export interface UserWithProfile extends User {
  phone: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  // VARIABLE POUR LE DÉVELOPPEMENT SEULEMENT
  private devOverrideRole: UserRole | null = null;

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  // Inscription via Gateway
  register(userData: { username: string, email: string, password: string, role?: string }): Observable<AuthResponse> {
    console.log('🔵 Register via Gateway:', userData);

    return this.apiService.post<AuthResponse>('auth-service/api/auth/register', userData).pipe(
      tap((response) => {
        console.log('✅ Register success via Gateway:', response);
        if (response.token) {
          this.storeAuthData(response);
        }
      })
    );
  }

  // Connexion via Gateway
  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    console.log('🔵 Login via Gateway:', credentials);

    return this.apiService.post<AuthResponse>('auth-service/api/auth/login', credentials).pipe(
      tap((response: AuthResponse) => {
        console.log('✅ Login success via Gateway:', response);
        this.storeAuthData(response);
      })
    );
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    this.currentUser = null;
    this.devOverrideRole = null; // Réinitialiser le rôle dev
    console.log('👋 User logged out');
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Récupérer l'utilisateur courant AVEC OVERRIDE POUR DEV
  getCurrentUser(): User | null {
    if (!this.currentUser) return null;

    // Si on a un override pour le développement, l'appliquer
    if (this.devOverrideRole) {
      return {
        ...this.currentUser,
        role: this.devOverrideRole
      };
    }

    return this.currentUser;
  }

  // Récupérer le nom d'utilisateur
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Récupérer le rôle AVEC OVERRIDE POUR DEV
  getRole(): UserRole | null {
    if (this.devOverrideRole) {
      return this.devOverrideRole;
    }

    const role = localStorage.getItem('role');
    return role as UserRole || null;
  }

  // MÉTHODE POUR LE DÉVELOPPEMENT SEULEMENT
  // Permet de forcer un rôle pour tester les interfaces
  setDevRole(role: UserRole | null): void {
    this.devOverrideRole = role;
    console.log(`🔀 Dev role set to: ${role}`);

    // Mettre à jour le localStorage pour la persistance
    if (role) {
      localStorage.setItem('devRole', role);
    } else {
      localStorage.removeItem('devRole');
    }

    // Rafraîchir la page pour appliquer les changements
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  // Stocker les données d'authentification
  private storeAuthData(authResponse: AuthResponse): void {
    if (authResponse.token) {
      localStorage.setItem('token', authResponse.token);
    }
    if (authResponse.username) {
      localStorage.setItem('username', authResponse.username);
    }
    if (authResponse.email) {
      localStorage.setItem('email', authResponse.email);
    }
    if (authResponse.userId) {
      localStorage.setItem('userId', authResponse.userId);
    }
    if (authResponse.role) {
      localStorage.setItem('role', authResponse.role);
    }

    // Stocker l'objet utilisateur
    this.currentUser = {
      id: authResponse.userId ? parseInt(authResponse.userId) : undefined,
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role as UserRole
    };

    localStorage.setItem('user', JSON.stringify(this.currentUser));

    console.log('🔐 Auth data stored:', this.currentUser);
  }

  // Charger l'utilisateur depuis le localStorage
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        this.currentUser = null;
      }
    }

    // Charger aussi le rôle dev si présent
    const devRole = localStorage.getItem('devRole') as UserRole;
    if (devRole) {
      this.devOverrideRole = devRole;
      console.log(`🔀 Loaded dev role from storage: ${devRole}`);
    }
  }

  // MÉTHODE MOCK POUR LE DÉVELOPPEMENT (optionnelle)
  // Permet de simuler une connexion rapide sans API
  mockLogin(role: UserRole = 'ORGANIZER'): void {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      username: 'organizer_' + Date.now(),
      email: `organizer${Date.now()}@eventora.com`,
      userId: '100',
      role: role
    };

    this.storeAuthData(mockResponse);
    console.log(`✅ Mock login as ${role}`);
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: UserRole): boolean {
    const userRole = this.getRole();
    return userRole === role;
  }

  // Vérifier si l'utilisateur est un organisateur
  isOrganizer(): boolean {
    return this.hasRole('ORGANIZER');
  }

  // Vérifier si l'utilisateur est un participant
  isParticipant(): boolean {
    return this.hasRole('PARTICIPANT');
  }
}
