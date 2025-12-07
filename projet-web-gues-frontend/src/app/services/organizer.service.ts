// src/app/services/organizer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  pastEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  averageAttendance: number;
  registrationTrend: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private stats = new BehaviorSubject<OrganizerStats>({
    totalEvents: 12,
    upcomingEvents: 5,
    ongoingEvents: 2,
    pastEvents: 5,
    totalParticipants: 845,
    totalRevenue: 12500,
    averageAttendance: 78,
    registrationTrend: 15.5
  });

  stats$ = this.stats.asObservable();

  // Pour simuler le rafraîchissement
  refreshStats(): void {
    const current = this.stats.value;
    this.stats.next({
      ...current,
      totalParticipants: current.totalParticipants + Math.floor(Math.random() * 10),
      totalRevenue: current.totalRevenue + Math.floor(Math.random() * 100)
    });
  }
}
