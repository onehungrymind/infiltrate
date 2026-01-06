import { InjectionToken } from '@angular/core';

/**
 * Injection token for the API base URL
 * 
 * Provide this in your app configuration:
 * 
 * ```typescript
 * import { API_URL } from '@kasita/core-data';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     { provide: API_URL, useValue: environment.apiUrl }
 *   ]
 * };
 * ```
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3100/api', // Default fallback for development
});

