import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { ThemeService } from './services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  imports: [RouterModule, Header],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'dashboard';
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  protected isLoginPage = signal(false);

  constructor() {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoginPage.set(this.router.url === '/login' || this.router.url.startsWith('/login'));
      });
  }

  ngOnInit(): void {
    // Initialize theme on app start
    this.themeService.theme();
    // Check initial route
    this.isLoginPage.set(this.router.url === '/login' || this.router.url.startsWith('/login'));
  }
}
