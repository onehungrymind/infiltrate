/**
 * Skill Tree Wrapper Component
 *
 * This component wraps the React-based Kubernetes Skill Tree for use in Angular.
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
  selector: 'lib-skill-tree',
  standalone: true,
  imports: [CommonModule],
  template: '<div #reactContainer class="skill-tree-container"></div>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .skill-tree-container {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        position: relative;
      }
    `,
  ],
})
export class SkillTreeComponent implements AfterViewInit, OnDestroy {
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
      // Dynamically import React and the skill tree
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const { default: KubernetesSkillTree } = await import(
        './react/KubernetesSkillTree'
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
      const skillTree = React.createElement(KubernetesSkillTree);
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
