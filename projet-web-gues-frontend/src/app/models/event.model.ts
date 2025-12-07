// src/app/models/event.model.ts
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;  // Format ISO: "2024-12-15T09:00:00"
  location: string;
  category: string;  // "CONFERENCE", "FORMATION", "CONCERT", etc.
  mediaUrls?: string[];
  maxParticipants: number;
  organizerId: number;
  currentParticipants: number;
  price: number; // ← DOIT EXISTER
  status?: string; // ← RECOMMANDÉ
  createdAt?: string; // ← RECOMMANDÉ
  isActive?: boolean;
}

export interface EventFilters {
  keyword?: string;
  category?: string;
  location?: string;
}
