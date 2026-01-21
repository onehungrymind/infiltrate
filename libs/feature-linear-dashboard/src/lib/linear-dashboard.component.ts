/**
 * Linear Dashboard Wrapper Component
 *
 * This component wraps the React-based Linear Dashboard for use in Angular.
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
import { Section } from './types';

@Component({
  selector: 'lib-linear-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="linear-dashboard-wrapper">
      @if (loading) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading learning path...</p>
        </div>
      } @else {
        <div #reactContainer class="linear-dashboard-container"></div>
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
      .linear-dashboard-wrapper {
        width: 100%;
        height: 100%;
        min-height: 100vh;
      }
      .linear-dashboard-container {
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
        background-color: #131F24;
        color: #acacac;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #2a3a42;
        border-top-color: #1cb0f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class LinearDashboardComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  @Input() pathName = 'Learning Path';
  @Input() pathDescription = 'Your learning journey';
  @Input() sections: Section[] = [];
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
      if (changes['sections'] || changes['pathName'] || changes['pathDescription']) {
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
      const { default: LinearDashboard } = await import('./react/KubernetesLinearDashboard');

      const container = this.reactContainer.nativeElement;

      // Ensure container has dimensions
      if (!container.offsetWidth || !container.offsetHeight) {
        setTimeout(() => this.initializeReact(), 100);
        return;
      }

      // Only create root if it doesn't exist
      if (!this.reactRoot) {
        this.reactRoot = createRoot(container);
      }

      // Create and render React component with data
      const dashboard = React.createElement(LinearDashboard, {
        pathName: this.pathName,
        pathDescription: this.pathDescription,
        sections: this.sections,
      });

      this.reactRoot.render(dashboard);
    } catch (error) {
      console.error('Failed to initialize Linear Dashboard:', error);
    }
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
