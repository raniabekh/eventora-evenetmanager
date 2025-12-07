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
    // Ajouter le token aux requêtes (sauf login/register)
    const token = this.authService.getToken();

    let authReq = req;
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs 401 (Unauthorized)
        if (error.status === 401) {
          console.log('Session expirée, redirection vers login');
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { sessionExpired: 'true' }
          });
        }

        return throwError(() => error);
      })
    );
  }
}
