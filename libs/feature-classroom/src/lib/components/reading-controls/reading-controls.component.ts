import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingPreferences } from '../../services/classroom-api.service';

@Component({
  selector: 'lib-reading-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reading-controls">
      <!-- Theme toggle -->
      <button
        class="control-btn"
        [title]="'Theme: ' + preferences.theme"
        (click)="cycleTheme()"
      >
        @switch (preferences.theme) {
          @case ('light') { ☀️ }
          @case ('dark') { 🌙 }
          @case ('sepia') { 📜 }
        }
      </button>

      <!-- Font size -->
      <div class="control-group">
        <button
          class="control-btn"
          [disabled]="preferences.fontSize === 'small'"
          title="Decrease font size"
          (click)="decreaseFontSize()"
        >
          A-
        </button>
        <button
          class="control-btn"
          [disabled]="preferences.fontSize === 'large'"
          title="Increase font size"
          (click)="increaseFontSize()"
        >
          A+
        </button>
      </div>

      <!-- Font family -->
      <button
        class="control-btn font-toggle"
        [title]="'Font: ' + preferences.fontFamily"
        (click)="cycleFontFamily()"
      >
        @switch (preferences.fontFamily) {
          @case ('sans') { Aa }
          @case ('serif') { <span class="serif">Aa</span> }
          @case ('mono') { <span class="mono">Aa</span> }
        }
      </button>

      <!-- Line spacing -->
      <button
        class="control-btn"
        [title]="'Spacing: ' + preferences.lineSpacing"
        (click)="cycleLineSpacing()"
      >
        ≡
      </button>
    </div>
  `,
  styles: `
    .reading-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-btn {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 0.375rem 0.625rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: var(--bg-secondary);
        border-color: var(--accent-color);
        color: var(--accent-color);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .control-group {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      overflow: hidden;

      .control-btn {
        border: none;
        border-radius: 0;

        &:first-child {
          border-right: 1px solid var(--border-color);
        }
      }
    }

    .font-toggle {
      .serif {
        font-family: Georgia, serif;
      }

      .mono {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
      }
    }
  `,
})
export class ReadingControlsComponent {
  @Input({ required: true }) preferences!: ReadingPreferences;
  @Output() preferencesChange = new EventEmitter<Partial<ReadingPreferences>>();

  cycleTheme(): void {
    const themes: Array<'light' | 'dark' | 'sepia'> = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(this.preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.preferencesChange.emit({ theme: nextTheme });
  }

  increaseFontSize(): void {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(this.preferences.fontSize);
    if (currentIndex < sizes.length - 1) {
      this.preferencesChange.emit({ fontSize: sizes[currentIndex + 1] });
    }
  }

  decreaseFontSize(): void {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(this.preferences.fontSize);
    if (currentIndex > 0) {
      this.preferencesChange.emit({ fontSize: sizes[currentIndex - 1] });
    }
  }

  cycleFontFamily(): void {
    const families: Array<'sans' | 'serif' | 'mono'> = ['sans', 'serif', 'mono'];
    const currentIndex = families.indexOf(this.preferences.fontFamily);
    const nextFamily = families[(currentIndex + 1) % families.length];
    this.preferencesChange.emit({ fontFamily: nextFamily });
  }

  cycleLineSpacing(): void {
    const spacings: Array<'compact' | 'normal' | 'relaxed'> = [
      'compact',
      'normal',
      'relaxed',
    ];
    const currentIndex = spacings.indexOf(this.preferences.lineSpacing);
    const nextSpacing = spacings[(currentIndex + 1) % spacings.length];
    this.preferencesChange.emit({ lineSpacing: nextSpacing });
  }
}
