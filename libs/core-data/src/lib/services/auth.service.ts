import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config/api-url.token';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // Use signal for reactive current user state
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Observable for components that prefer observables
  get currentUser$(): Observable<User | null> {
    return new Observable((subscriber) => {
      subscriber.next(this.currentUserSignal());
      subscriber.complete();
    });
  }

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check for existing token on service initialization
    this.checkAuthStatus();
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('authToken', response.access_token);
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        this.currentUserSignal.set(user);
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/']);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Register a new user
   */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { name, email, password }).pipe(
      tap((response) => {
        localStorage.setItem('authToken', response.access_token);
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        this.currentUserSignal.set(user);
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/']);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Logout - clears user data and token
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSignal.set(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
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
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user ID (for API calls)
   */
  getUserId(): string {
    return this.currentUserSignal()?.id || '';
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid by calling /me endpoint
      this.http.get<{ id: string; email: string }>(`${this.apiUrl}/auth/me`).pipe(
        tap((userData) => {
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: '', // Will be updated when we fetch full profile
          };
          this.currentUserSignal.set(user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError((error) => {
          console.warn('Auth token validation failed:', error);
          // Token is invalid, remove it and set unauthenticated
          localStorage.removeItem('authToken');
          this.isAuthenticatedSubject.next(false);
          this.currentUserSignal.set(null);
          return of(null);
        })
      ).subscribe({
        error: (error) => {
          console.warn('Auth service initialization error:', error);
          // Ensure app can still bootstrap even if auth check fails
          this.isAuthenticatedSubject.next(false);
          this.currentUserSignal.set(null);
        }
      });
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }
}

