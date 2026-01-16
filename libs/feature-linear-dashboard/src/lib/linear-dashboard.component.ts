/**
 * Linear Dashboard Wrapper Component
 *
 * This component wraps the React-based Kubernetes Linear Dashboard for use in Angular.
 * It handles the React/Angular bridge using react-dom/client.
 */

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'lib-linear-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: '<div #reactContainer class="linear-dashboard-container"></div>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .linear-dashboard-container {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        position: relative;
      }
    `,
  ],
})
export class LinearDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  private reactRoot: any = null;

  ngAfterViewInit(): void {
    this.initializeReact();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeReact(): Promise<void> {
    try {
      // Dynamically import React and the dashboard
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const { default: KubernetesLinearDashboard } = await import(
        './react/KubernetesLinearDashboard'
      );

      if (!this.reactContainer?.nativeElement) {
        console.error('React container not found');
        return;
      }

      const container = this.reactContainer.nativeElement;

      // Ensure container has explicit dimensions
      if (!container.offsetWidth || !container.offsetHeight) {
        // Wait for container to be sized
        setTimeout(() => this.initializeReact(), 100);
        return;
      }

      // Create React root
      this.reactRoot = createRoot(container);

      // Create and render React component
      const dashboard = React.createElement(KubernetesLinearDashboard);
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
