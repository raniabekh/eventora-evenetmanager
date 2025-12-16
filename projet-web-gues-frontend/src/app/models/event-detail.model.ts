import { Event } from './event.model';

export interface EventDetail extends Event {
  image: string;
  isFeatured: boolean;

  registeredCount: number;
  capacity: number;

  startTime: string;
  endTime: string;

  address: string;
  schedule: string;

  speakers: Speaker[];
  ageRestriction?: number;

  organizer: string;

  organizerName?: string;
  organizerEmail?: string;
  contactPhone?: string;
  requirements?: string;
  tags?: string[];
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

