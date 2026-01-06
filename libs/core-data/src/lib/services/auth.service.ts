import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly MOCK_USER: User = {
    id: 'user-1',
    email: 'demo@kasita.com',
    name: 'Demo User',
  };

  // Use signal for reactive current user state
  private currentUserSignal = signal<User | null>(null);

  // Observable for components that prefer observables
  // Returns current user value synchronously
  get currentUser$(): Observable<User | null> {
    return new Observable((subscriber) => {
      subscriber.next(this.currentUserSignal());
      subscriber.complete();
    });
  }

  constructor() {
    // Check localStorage on init
    const storedUser = localStorage.getItem('kasita_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
      } catch {
        // Invalid stored user, ignore
      }
    }
  }

  /**
   * Mock login - accepts any credentials and returns the mock user
   * @param _email - Email (not used in mock implementation)
   * @param _password - Password (not used in mock implementation)
   */
  login(_email: string, _password: string): Observable<User> {
    // Simulate API call delay
    return of(this.MOCK_USER).pipe(
      delay(500),
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem('kasita_user', JSON.stringify(user));
      }),
    );
  }

  /**
   * Logout - clears user data
   */
  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('kasita_user');
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  /**
   * Get current user ID (for API calls)
   */
  getUserId(): string {
    return this.currentUserSignal()?.id || 'user-1'; // Default fallback for demo
  }
}

