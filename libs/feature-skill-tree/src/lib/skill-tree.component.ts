/**
 * Skill Tree Wrapper Component
 *
 * This component wraps the React-based Skill Tree for use in Angular.
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
import { SkillNode } from './types';

@Component({
  selector: 'lib-skill-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skill-tree-wrapper">
      @if (loading) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading skill tree...</p>
        </div>
      } @else {
        <div #reactContainer class="skill-tree-container"></div>
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
      .skill-tree-wrapper {
        width: 100%;
        height: 100%;
        min-height: 100vh;
      }
      .skill-tree-container {
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
        background: radial-gradient(ellipse at center, #0f2847 0%, #0a1628 70%);
        color: #94a3b8;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #2a3444;
        border-top-color: #4ade80;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class SkillTreeComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  @Input() pathName = 'Skill Tree';
  @Input() skills: Record<string, SkillNode> = {};
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
      if (changes['skills'] || changes['pathName']) {
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
      const { default: KubernetesSkillTree } = await import(
        './react/KubernetesSkillTree'
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
      const skillTree = React.createElement(KubernetesSkillTree, {
        pathName: this.pathName,
        skills: this.skills,
      });
      this.reactRoot.render(skillTree);
    } catch (error) {
      console.error('Failed to initialize Skill Tree:', error);
    }
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
