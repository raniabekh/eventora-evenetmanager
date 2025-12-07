// src/app/models/search-filters.model.ts
export interface SearchFilters {
  searchTerm: string;      // 🔍 Texte recherché
  category: string | null; // 🏷️ Catégorie sélectionnée
  location: string;        // 📍 Localisation
}
