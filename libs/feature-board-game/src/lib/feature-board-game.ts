/**
 * Board Game Wrapper Component
 *
 * This component wraps the React-based Board Game for use in Angular.
 */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'lib-board-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board-game-wrapper">
      @if (loading) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading board game...</p>
        </div>
      } @else {
        <div #reactContainer class="board-game-container"></div>
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
      .board-game-wrapper {
        width: 100%;
        height: 100%;
        min-height: 100vh;
      }
      .board-game-container {
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
        background: #121212;
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
export class BoardGameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('reactContainer', { static: false })
  reactContainer!: ElementRef<HTMLDivElement>;

  @Input() loading = false;

  private reactRoot: any = null;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    if (!this.loading) {
      this.initializeReact();
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
      const { default: KubernetesBoardGame } = await import(
        './react/KubernetesBoardGame'
      );

      const container = this.reactContainer.nativeElement;

      if (!container.offsetWidth || !container.offsetHeight) {
        setTimeout(() => this.initializeReact(), 100);
        return;
      }

      if (!this.reactRoot) {
        this.reactRoot = createRoot(container);
      }

      const boardGame = React.createElement(KubernetesBoardGame);
      this.reactRoot.render(boardGame);
    } catch (error) {
      console.error('Failed to initialize Board Game:', error);
    }
  }

  private cleanup(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}