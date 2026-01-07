import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Header } from './shared/header/header';
import { Sidebar } from './shared/sidebar/sidebar';
import { ThemeService } from './services/theme.service';
import { LayoutService } from './services/layout.service';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  imports: [CommonModule, RouterModule, Header, Sidebar],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected title = 'dashboard';
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  private destroy$ = new Subject<void>();
  
  protected isLoginPage = signal(false);
  protected isSidebarCollapsed = false;

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

    // Subscribe to sidebar collapsed state
    this.layoutService.isSidebarCollapsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(collapsed => {
        this.isSidebarCollapsed = collapsed;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
