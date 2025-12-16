import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const userId = authService.getUserId();
  const userRole = authService.getUserRole();

  const isPublic =
    req.method === 'GET' &&
    req.url.endsWith('/api/events');

  let headers: any = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isPublic && userId && userRole) {
    headers['X-User-Id'] = userId.toString();
    headers['X-User-Role'] = userRole;
  }

  const clonedReq = Object.keys(headers).length
    ? req.clone({ setHeaders: headers })
    : req;

  console.log('✅ INTERCEPTOR ACTIF →', clonedReq.url, headers);

  return next(clonedReq);
};

