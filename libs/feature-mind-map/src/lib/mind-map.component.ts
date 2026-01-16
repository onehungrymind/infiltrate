/**
 * Mind Map Wrapper Component
 *
 * This component wraps the React-based 3D Kubernetes Mind Map for use in Angular.
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
  selector: 'lib-mind-map',
  standalone: true,
  imports: [CommonModule],
  template: '<div #reactContainer class="mind-map-container"></div>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .mind-map-container {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        position: relative;
      }
    `,
  ],
})
export class MindMapComponent implements AfterViewInit, OnDestroy {
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
      // Dynamically import React and the mind map
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const { default: KubernetesMindMap3D } = await import(
        './react/KubernetesMindMap3D'
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
      const mindMap = React.createElement(KubernetesMindMap3D);
      this.reactRoot.render(mindMap);
    } catch (error) {
      console.error('Failed to initialize Mind Map:', error);
    }
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
