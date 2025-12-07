// src/app/models/event-detail.model.ts
import { Event } from './event.model';

export interface EventDetail extends Event {
  // Propriétés OBLIGATOIRES pour le template
  image: string;
  isFeatured: boolean;
  registeredCount: number;
  capacity: number;
  price: number;
  startTime: string;
  endTime: string;
  address: string;
  schedule: string;
  speakers: Speaker[];
  ageRestriction?: number;
  organizer: string; // Renommez organizerName en organizer si besoin

  // Vos champs existants
  organizerName?: string;
  organizerEmail?: string;
  contactPhone?: string;
  requirements?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Speaker {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface RegistrationStatus {
  isRegistered: boolean;
  registrationId?: number;
  status?: string;
  registrationDate?: string;
}
