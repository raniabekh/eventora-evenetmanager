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
  currentParticipants: number; // ← Déjà présent
  price: number; // ← Déjà présent
  status?: string; // "ACTIVE", "INACTIVE", "CANCELLED"
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  availablePlaces?: number; // ← AJOUTER
  imageUrl?: string; // ← AJOUTER
}

export interface EventFilters {
  keyword?: string;
  category?: string;
  location?: string;
  minDate?: string;
  maxDate?: string;
  maxPrice?: number;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  price: number;
  maxParticipants: number;
  imageUrl?: string;
  mediaUrls?: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  price?: number;
  maxParticipants?: number;
  imageUrl?: string;
  mediaUrls?: string[];
  isActive?: boolean;
}
