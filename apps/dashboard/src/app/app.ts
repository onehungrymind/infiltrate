import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd,Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { LayoutService } from './services/layout.service';
import { ThemeService } from './services/theme.service';
import { Header } from './shared/header/header';
import { Sidebar } from './shared/sidebar/sidebar';

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
  
  protected isStandalonePage = signal(false);
  protected isSidebarCollapsed = false;

  constructor() {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkStandalonePage();
      });
  }

  private checkStandalonePage() {
    const url = this.router.url;
    // Pages that should not show sidebar/header
    const standaloneRoutes = ['/login', '/session/'];
    this.isStandalonePage.set(standaloneRoutes.some(route => url === route || url.startsWith(route)));
  }

  ngOnInit(): void {
    // Initialize theme on app start
    this.themeService.theme();
    // Check initial route
    this.checkStandalonePage();

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
