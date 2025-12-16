export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;  // ISO: "2024-12-15T09:00:00"
  location: string;
  category: string;

  mediaUrls?: string[];
  imageUrl?: string;          // ✅ ajouté

  maxParticipants: number;
  organizerId: number;

  currentParticipants: number; // ✅ important
  availablePlaces?: number;    // ✅ optionnel (calculable côté front)

  price: number;

  status?: string; // "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED"
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
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
  status?: string;
}

