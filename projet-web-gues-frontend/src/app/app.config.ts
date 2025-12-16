import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

const authInterceptor = (req: any, next: any) => {
  const isPublicRequest =
    req.url.includes('/api/auth/') ||
    (req.url.includes('/api/events') && req.method === 'GET');

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('currentUser');

  let clonedRequest = req;

  if (!isPublicRequest && token) {
    const headers: any = { Authorization: `Bearer ${token}` };

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) headers['X-User-Id'] = String(user.id);
        if (user?.role) headers['X-User-Role'] = user.role;
      } catch {}
    }

    clonedRequest = req.clone({ setHeaders: headers });
  }

  return next(clonedRequest);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
