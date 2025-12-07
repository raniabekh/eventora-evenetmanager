// src/app/components/events/search-filters/search-filters.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchFilters } from '../../../models/search-filters.model';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  @Input() categories: string[] = [];
  @Input() locations: string[] = [];
  @Input() initialFilters?: Partial<SearchFilters>;
  @Output() filtersChange = new EventEmitter<SearchFilters>();

  filters: SearchFilters = {
    searchTerm: '',
    category: null,
    location: ''
  };

  showAdvancedFilters = false;

  ngOnInit(): void {
    if (this.initialFilters) {
      this.filters = { ...this.filters, ...this.initialFilters };
    }
    this.loadSavedFilters();
  }

  onFilterChange(): void {
    this.saveFilters();
    this.filtersChange.emit({ ...this.filters });
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      category: null,
      location: ''
    };
    this.onFilterChange();
  }

  // AJOUTEZ CES MÉTHODES :

  // Vérifie s'il y a des filtres actifs
  hasActiveFilters(): boolean {
    return !!this.filters.searchTerm ||
      !!this.filters.category ||
      !!this.filters.location;
  }

  // Compte les filtres actifs
  countActiveFilters(): number {
    let count = 0;
    if (this.filters.searchTerm) count++;
    if (this.filters.category) count++;
    if (this.filters.location) count++;
    return count;
  }

  // Supprime un filtre spécifique
  removeFilter(filterName: keyof SearchFilters): void {
    if (filterName === 'category') {
      this.filters.category = null;
    } else if (filterName === 'searchTerm' || filterName === 'location') {
      this.filters[filterName] = '';
    }
    this.onFilterChange();
  }

  private saveFilters(): void {
    localStorage.setItem('eventFilters', JSON.stringify(this.filters));
  }

  private loadSavedFilters(): void {
    const saved = localStorage.getItem('eventFilters');
    if (saved) {
      try {
        const savedFilters = JSON.parse(saved);
        this.filters = { ...this.filters, ...savedFilters };
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }
}
