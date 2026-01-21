/**
 * Metro Maps Wrapper Component
 *
 * This component wraps the React-based Kasita Transit System for use in Angular.
 * It accepts data via inputs and renders the React visualization.
 */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MetroCityData } from './types';

@Component({
  selector: 'lib-metro-maps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metro-maps-wrapper">
      @if (loading) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading transit system...</p>
        </div>
      } @else {
        <div #reactContainer class="metro-maps-container"></div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .metro-maps-wrapper {
        width: 100%;
        height: 100%;
        min-height: 100vh;
      }
      .metro-maps-container {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        position: relative;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #0A0A0A;
        color: #6A6A6A;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #1A1A1A;
        border-top-color: #E63946;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class MetroMapsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  @Input() pathName = 'Transit System';
  @Input() cities: MetroCityData[] = [];
  @Input() loading = false;

  private reactRoot: any = null;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    if (!this.loading) {
      this.initializeReact();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && !this.loading) {
      if (changes['cities'] || changes['pathName']) {
        this.initializeReact();
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeReact(): Promise<void> {
    if (!this.reactContainer?.nativeElement) {
      return;
    }

    try {
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const { default: KasitaTransitSystem } = await import(
        './react/KasitaTransitSystem'
      );

      const container = this.reactContainer.nativeElement;

      // Ensure container has explicit dimensions
      if (!container.offsetWidth || !container.offsetHeight) {
        setTimeout(() => this.initializeReact(), 100);
        return;
      }

      // Only create root if it doesn't exist
      if (!this.reactRoot) {
        this.reactRoot = createRoot(container);
      }

      // Create and render React component
      const transitSystem = React.createElement(KasitaTransitSystem, {
        pathName: this.pathName,
        cities: this.cities,
      });
      this.reactRoot.render(transitSystem);
    } catch (error) {
      console.error('Failed to initialize Metro Maps:', error);
    }
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
