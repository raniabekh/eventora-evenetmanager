// interceptors/auth.interceptor.ts
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // URLs qui ne nécessitent PAS d'authentification
    const publicUrls = [
      '/api/auth/',
      '/api/events'  // GET seulement
    ];

    const isPublic = publicUrls.some(url => req.url.includes(url)) && req.method === 'GET';

    // Cloner la requête avec les headers
    let clonedRequest = req;

    // Récupérer les informations d'authentification
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    // Préparer les headers
    const headers: any = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ajouter X-User-Id et X-User-Role pour les endpoints protégés
    if (!isPublic && userId && userRole) {
      headers['X-User-Id'] = userId.toString();
      headers['X-User-Role'] = userRole;
    }

    // Si on a des headers à ajouter
    if (Object.keys(headers).length > 0) {
      clonedRequest = req.clone({
        setHeaders: headers
      });

      console.log('🔐 Headers envoyés:', headers);
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ HTTP Error:', error);

        // Gérer les erreurs 401 (Unauthorized)
        if (error.status === 401) {
          console.log('Session expirée, redirection vers login');
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { sessionExpired: 'true' }
          });
        }

        // Gérer les erreurs 403 (Forbidden)
        if (error.status === 403) {
          console.log('Accès interdit');
          this.router.navigate(['/']);
        }

        return throwError(() => error);
      })
    );
  }
}

// EXPORT CORRECT - soit une fonction, soit la classe directement
// Option 1: Export de fonction (recommandé pour withInterceptors)
export const authInterceptor = (authService: AuthService, router: Router) => {
  return new AuthInterceptor(authService, router);
};

// Option 2: Export de classe + factory function (alternative)
export function provideAuthInterceptor() {
  return {
    provide: AuthInterceptor,
    useClass: AuthInterceptor,
    deps: [AuthService, Router]
  };
}
