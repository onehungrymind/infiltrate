import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [RouterModule, Header],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'dashboard';
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Initialize theme on app start
    this.themeService.theme();
  }
}
