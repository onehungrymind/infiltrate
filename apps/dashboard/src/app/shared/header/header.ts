import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@kasita/core-data';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);

  currentUser = this.authService.getCurrentUser();

  logout(): void {
    this.authService.logout();
    // Navigate will be handled by guard
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
