import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/regiter.component'; // ← IMPORTE REGISTER
import { EventListComponent } from './components/events/event-list/event-list.component';
import { EventDetailComponent } from './components/events/event-detail/event-detail.component';
import { MyRegistrationsComponent } from './components/registrations/my-registrations/my-registrations.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { OrganizerGuard } from './guards/organizer.guard'; // ← AJOUTEZ CET I

export const routes: Routes = [
  {
    path: 'organizer/dashboard',
    canActivate: [OrganizerGuard], // Optionnel pour le moment
    loadComponent: () => import('./components/organizer/organizer-dashboard/organizer-dashboard.component')
      .then(m => m.OrganizerDashboardComponent)
  },
  { path: 'login', component: LoginComponent },
  { path: 'events', component: EventListComponent },
  { path: 'register', component: RegisterComponent }, // ← AJOUTE CETTE LIGNE
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'my-registrations', component: MyRegistrationsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '**', redirectTo: '/events' }

];
