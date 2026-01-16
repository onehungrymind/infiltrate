import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  field: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
  fullWidth?: boolean;  // If true, filter takes full width on its own row
  row?: number;         // Group filters into rows (filters with same row number are grouped)
}

export interface SearchFilterState {
  searchTerm: string;
  filters: Record<string, string | string[]>;
}

@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filter-bar.html',
  styleUrl: './search-filter-bar.scss',
})
export class SearchFilterBar {
  @Input() placeholder = 'Search...';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() showClearButton = true;
  @Output() searchChange = new EventEmitter<SearchFilterState>();

  searchTerm = '';
  filters: Record<string, string | string[]> = {};

  onSearchChange() {
    this.emitChange();
  }

  onFilterChange(field: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filters[field] = select.value;
    this.emitChange();
  }

  clearAll() {
    this.searchTerm = '';
    this.filters = {};
    // Reset all select elements
    this.emitChange();
  }

  hasActiveFilters(): boolean {
    const hasSearch = this.searchTerm.length > 0;
    const hasFilters = Object.values(this.filters).some(v =>
      Array.isArray(v) ? v.length > 0 : v !== ''
    );
    return hasSearch || hasFilters;
  }

  /**
   * Groups filters by row number for rendering
   * Filters without a row number are placed in row 0
   */
  getFiltersByRow(): Map<number, FilterConfig[]> {
    const rows = new Map<number, FilterConfig[]>();
    for (const config of this.filterConfigs) {
      const rowNum = config.row ?? 0;
      if (!rows.has(rowNum)) {
        rows.set(rowNum, []);
      }
      rows.get(rowNum)!.push(config);
    }
    return rows;
  }

  /**
   * Get sorted row numbers for iteration
   */
  getRowNumbers(): number[] {
    return Array.from(this.getFiltersByRow().keys()).sort((a, b) => a - b);
  }

  private emitChange() {
    this.searchChange.emit({
      searchTerm: this.searchTerm,
      filters: { ...this.filters },
    });
  }
}
