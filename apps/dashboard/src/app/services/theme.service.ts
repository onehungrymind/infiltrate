import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'kasita-theme';
  
  // Signal for reactive theme state
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // HARDCODED TO LIGHT FOR TESTING
    // Force light theme immediately
    this.theme.set('light');
    this.applyTheme('light');
    
    // Remove any dark classes that might be there
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    
    // Apply theme when it changes (but it won't change since toggleTheme is disabled)
    effect(() => {
      const theme = this.theme();
      // Always force to light
      if (theme !== 'light') {
        this.theme.set('light');
      }
      this.applyTheme('light');
    });
  }

  private getInitialTheme(): Theme {
    // HARDCODED TO LIGHT FOR TESTING
    return 'light';
  }

  toggleTheme(): void {
    // HARDCODED TO LIGHT FOR TESTING - do nothing
    // const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    // this.theme.set(newTheme);
    // this.applyTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    
    // Tailwind's darkMode: 'class' checks for .dark on any ancestor
    // We only need to modify the html element
    html.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
    
    // Also update body for our custom CSS
    document.body.classList.remove('dark', 'light');
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.add('light');
    }
  }
}

