/**
 * Mind Map Wrapper Component
 *
 * This component wraps the React-based 3D Mind Map for use in Angular.
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
import { MindMapNode, MindMapConnection } from './types';

@Component({
  selector: 'lib-mind-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mind-map-wrapper">
      @if (loading) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading mind map...</p>
        </div>
      } @else {
        <div #reactContainer class="mind-map-container"></div>
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
      .mind-map-wrapper {
        width: 100%;
        height: 100%;
        min-height: 100vh;
      }
      .mind-map-container {
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
        background-color: #0a1628;
        color: #94a3b8;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #1e3a5f;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class MindMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  @Input() pathName = 'Knowledge Map';
  @Input() nodes: MindMapNode[] = [];
  @Input() connections: MindMapConnection[] = [];
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
      if (changes['nodes'] || changes['connections'] || changes['pathName']) {
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
      const { default: KubernetesMindMap3D } = await import(
        './react/KubernetesMindMap3D'
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

      // Create and render React component with data
      const mindMap = React.createElement(KubernetesMindMap3D, {
        pathName: this.pathName,
        nodes: this.nodes,
        connections: this.connections,
      });
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
