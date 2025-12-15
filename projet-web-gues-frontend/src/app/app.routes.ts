// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { OrganizerGuard } from './guards/organizer.guard';
import { ParticipantGuard } from './guards/participant.guard';

export const routes: Routes = [
  // Page d'accueil - redirige selon le rôle
  {
    path: '',
    loadComponent: () => import('./components/role-redirect/role-redirect.component')
      .then(m => m.RoleRedirectComponent)
  },

  // ===== PUBLIC ROUTES (pas besoin d'authentification) =====
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./components/events/event-list/event-list.component')
      .then(m => m.EventListComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/events/event-detail/event-detail.component')
      .then(m => m.EventDetailComponent)
  },

  // ===== PARTICIPANT ROUTES (nécessite d'être connecté en tant que participant) =====
  {
    path: 'my-registrations',
    canActivate: [AuthGuard, ParticipantGuard],
    loadComponent: () => import('./components/registrations/my-registrations/my-registrations.component')
      .then(m => m.MyRegistrationsComponent)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard, ParticipantGuard],
    loadComponent: () => import('./components/notifications/notifications.component')
      .then(m => m.NotificationsComponent)
  },

  // ===== ORGANIZER ROUTES (nécessite d'être connecté en tant qu'organisateur) =====
  {
    path: 'organizer/dashboard',
    canActivate: [AuthGuard, OrganizerGuard],
    loadComponent: () => import('./components/organizer/organizer-dashboard/organizer-dashboard.component')
      .then(m => m.OrganizerDashboardComponent)
  },
  {
    path: 'organizer/manage-events',
    canActivate: [AuthGuard, OrganizerGuard],
    loadComponent: () => import('./components/organizer/manage-events/manage-events.component')
      .then(m => m.ManageEventsComponent)
  },
  {
    path: 'create-event',
    canActivate: [AuthGuard, OrganizerGuard],
    loadComponent: () => import('./components/organizer/create-event/create-event.component')
      .then(m => m.CreateEventComponent)
  },
  {
    path: 'organizer/events/edit/:id',
    canActivate: [AuthGuard, OrganizerGuard],
    loadComponent: () => import('./components/organizer/create-event/create-event.component')
      .then(m => m.CreateEventComponent)
  },
  {
    path: 'organizer/notifications',
    canActivate: [AuthGuard, OrganizerGuard],
    loadComponent: () => import('./components/organizer/notifications/organizer-notifications.component')
      .then(m => m.OrganizerNotificationsComponent)
  },

  // 404 - Redirection vers la page appropriée
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
