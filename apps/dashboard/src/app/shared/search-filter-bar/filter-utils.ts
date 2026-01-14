import { SearchFilterState } from './search-filter-bar';

/**
 * Generic filter function that can be used for any entity type
 * Searches across multiple fields and applies additional filters
 */
export function filterEntities<T extends Record<string, any>>(
  entities: T[],
  state: SearchFilterState,
  searchFields: (keyof T)[],
  filterMatchers?: Record<string, (entity: T, filterValue: string | string[]) => boolean>
): T[] {
  let filtered = [...entities];

  // Apply search term filter
  if (state.searchTerm && state.searchTerm.trim().length > 0) {
    const searchLower = state.searchTerm.toLowerCase().trim();
    filtered = filtered.filter((entity) =>
      searchFields.some((field) => {
        const value = entity[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }

  // Apply additional filters
  if (filterMatchers) {
    Object.entries(state.filters).forEach(([field, filterValue]) => {
      if (filterValue && (Array.isArray(filterValue) ? filterValue.length > 0 : filterValue !== '')) {
        const matcher = filterMatchers[field];
        if (matcher) {
          filtered = filtered.filter((entity) => matcher(entity, filterValue));
        }
      }
    });
  }

  return filtered;
}

/**
 * Common filter matchers that can be reused across entities
 */
export const commonFilterMatchers = {
  /**
   * Exact match filter (e.g., status === 'approved')
   */
  exactMatch: <T>(fieldName: keyof T) => (entity: T, filterValue: string | string[]) => {
    if (Array.isArray(filterValue)) {
      return filterValue.includes(String(entity[fieldName]));
    }
    return entity[fieldName] === filterValue;
  },

  /**
   * Contains filter (case-insensitive)
   */
  contains: <T>(fieldName: keyof T) => (entity: T, filterValue: string | string[]) => {
    const value = String(entity[fieldName] || '').toLowerCase();
    if (Array.isArray(filterValue)) {
      return filterValue.some((fv) => value.includes(fv.toLowerCase()));
    }
    return value.includes(String(filterValue).toLowerCase());
  },

  /**
   * Boolean filter
   */
  boolean: <T>(fieldName: keyof T) => (entity: T, filterValue: string | string[]) => {
    const boolValue = filterValue === 'true';
    return entity[fieldName] === boolValue;
  },

  /**
   * Nested field filter (e.g., learningPath.name)
   */
  nestedField: <T>(path: string) => (entity: T, filterValue: string | string[]) => {
    const value = path.split('.').reduce((obj: any, key) => obj?.[key], entity);
    if (Array.isArray(filterValue)) {
      return filterValue.includes(String(value));
    }
    return String(value || '').toLowerCase().includes(String(filterValue).toLowerCase());
  },
};
