import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'sidebarCollapsed';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private collapsedSubject = new BehaviorSubject<boolean>(this.loadInitialState());
  
  /**
   * Observable that emits the current sidebar collapsed state
   */
  public isSidebarCollapsed$: Observable<boolean> = this.collapsedSubject.asObservable();

  /**
   * Get the current sidebar collapsed state
   */
  public get isSidebarCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  /**
   * Toggle the sidebar collapsed state
   */
  public toggleSidebar(): void {
    const newState = !this.isSidebarCollapsed;
    this.setSidebarCollapsed(newState);
  }

  /**
   * Set the sidebar collapsed state
   * @param collapsed - Whether the sidebar should be collapsed
   */
  public setSidebarCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    this.persistState(collapsed);
  }

  /**
   * Load initial state from localStorage
   * @returns Initial collapsed state (default: false)
   */
  private loadInitialState(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (error) {
      // localStorage may be unavailable (private browsing, quota exceeded)
      console.warn('Failed to load sidebar state from localStorage. Sidebar will default to expanded state. Error:', error);
    }
    return false; // Default to expanded
  }

  /**
   * Persist state to localStorage
   * @param collapsed - The collapsed state to persist
   */
  private persistState(collapsed: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch (error) {
      // localStorage may be unavailable (private browsing, quota exceeded)
      // Continue with in-memory state only - user preference will not persist across sessions
      console.warn('Failed to persist sidebar state to localStorage. User preference will not be saved across page reloads. Error:', error);
    }
  }
}

