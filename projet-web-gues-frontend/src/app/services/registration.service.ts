// src/app/services/registration.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Registration, RegistrationStatus, EventStats } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // Données mockées pour les inscriptions
  private mockRegistrations: Registration[] = [
    {
      id: 1,
      eventId: 1,
      userId: 100,
      registrationDate: '2024-12-10T14:30:00',
      status: 'CONFIRMED'
    },
    {
      id: 2,
      eventId: 2,
      userId: 100,
      registrationDate: '2024-12-05T10:15:00',
      status: 'PENDING'
    },
    {
      id: 3,
      eventId: 3,
      userId: 100,
      registrationDate: '2024-12-01T09:00:00',
      status: 'CANCELLED'
    }
  ];

  constructor() {}

  // Vérifier si l'utilisateur est inscrit à un événement
  getRegistrationStatus(eventId: number, userId: number): Observable<RegistrationStatus> {
    console.log(`🔍 Vérification inscription: event=${eventId}, user=${userId}`);

    // Chercher une inscription active
    const registration = this.mockRegistrations.find(r =>
      r.eventId === eventId &&
      r.userId === userId &&
      r.status !== 'CANCELLED'
    );

    const status: RegistrationStatus = {
      isRegistered: !!registration,
      registrationId: registration?.id,
      status: registration?.status,
      registrationDate: registration?.registrationDate
    };

    console.log('📋 Statut inscription:', status);
    return of(status).pipe(delay(300));
  }

  // S'inscrire à un événement
  registerToEvent(eventId: number, userId: number): Observable<Registration> {
    console.log(`📝 Inscription: event=${eventId}, user=${userId}`);

    // Vérifier si déjà inscrit
    const existing = this.mockRegistrations.find(r =>
      r.eventId === eventId && r.userId === userId && r.status !== 'CANCELLED'
    );

    if (existing) {
      console.log('⚠️ Déjà inscrit à cet événement');
      return of(existing).pipe(delay(300));
    }

    // Créer une nouvelle inscription
    const newRegistration: Registration = {
      id: this.mockRegistrations.length + 1,
      eventId,
      userId,
      registrationDate: new Date().toISOString(),
      status: 'PENDING'
    };

    console.log('✅ Nouvelle inscription créée:', newRegistration);
    this.mockRegistrations.push(newRegistration);

    return of(newRegistration).pipe(delay(500));
  }

  // Annuler une inscription
  cancelRegistration(registrationId: number): Observable<void> {
    console.log(`❌ Annulation inscription ID: ${registrationId}`);

    const index = this.mockRegistrations.findIndex(r => r.id === registrationId);

    if (index !== -1) {
      this.mockRegistrations[index].status = 'CANCELLED';
      console.log('✅ Inscription annulée');
    } else {
      console.log('⚠️ Inscription non trouvée');
    }

    return of(void 0).pipe(delay(300));
  }

  // Récupérer les inscriptions d'un utilisateur
  getUserRegistrations(userId: number): Observable<Registration[]> {
    console.log(`📋 Récupération inscriptions pour user: ${userId}`);

    const userRegistrations = this.mockRegistrations.filter(r => r.userId === userId);
    console.log(`✅ ${userRegistrations.length} inscriptions trouvées`);

    return of(userRegistrations).pipe(delay(400));
  }

  // Récupérer les statistiques d'un événement
  getEventStats(eventId: number, totalCapacity: number): Observable<EventStats> {
    console.log(`📊 Statistiques événement: ${eventId}`);

    const confirmedRegistrations = this.mockRegistrations.filter(
      r => r.eventId === eventId && r.status === 'CONFIRMED'
    ).length;

    const stats: EventStats = {
      eventId,
      participantsCount: confirmedRegistrations,
      capacity: totalCapacity,
      availableSpots: Math.max(0, totalCapacity - confirmedRegistrations)
    };

    console.log('📈 Stats:', stats);
    return of(stats).pipe(delay(300));
  }

  // Vérifier si un événement est complet
  isEventFull(eventId: number, totalCapacity: number): Observable<boolean> {
    return new Observable(observer => {
      this.getEventStats(eventId, totalCapacity).subscribe(stats => {
        observer.next(stats.availableSpots <= 0);
        observer.complete();
      });
    });
  }

  // Nombre d'inscriptions par statut
  getRegistrationCounts(eventId: number): Observable<{confirmed: number, pending: number, cancelled: number}> {
    const confirmed = this.mockRegistrations.filter(r => r.eventId === eventId && r.status === 'CONFIRMED').length;
    const pending = this.mockRegistrations.filter(r => r.eventId === eventId && r.status === 'PENDING').length;
    const cancelled = this.mockRegistrations.filter(r => r.eventId === eventId && r.status === 'CANCELLED').length;

    return of({ confirmed, pending, cancelled });
  }
}
