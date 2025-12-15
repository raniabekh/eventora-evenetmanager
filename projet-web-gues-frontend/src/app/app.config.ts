// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// Définir l'interceptor comme fonction
const authInterceptor = (req: any, next: any) => {
  // URLs publiques (pas besoin d'authentification)
  const isPublicRequest =
    req.url.includes('/api/auth/') ||
    (req.url.includes('/api/events') && req.method === 'GET');

  // Récupérer les données d'authentification
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('currentUser');

  let clonedRequest = req;

  // Si ce n'est pas une requête publique et qu'on a un token
  if (!isPublicRequest && token) {
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };

    // Ajouter X-User-Id et X-User-Role si l'utilisateur est stocké
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          headers['X-User-Id'] = user.id.toString();
        }
        if (user?.role) {
          headers['X-User-Role'] = user.role;
        }
      } catch (e) {
        console.warn('Could not parse user data:', e);
      }
    }

    clonedRequest = req.clone({
      setHeaders: headers
    });

    console.log('🔐 Sending request with headers:', headers);
  }

  return next(clonedRequest);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
