import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DiagramBlock } from '../../services/classroom-api.service';

@Component({
  selector: 'lib-diagram-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagram-block" [class.dark]="theme === 'dark'">
      @if (diagram.type === 'mermaid') {
        <div class="mermaid-container" #mermaidContainer>
          @if (loading()) {
            <div class="loading">Loading diagram...</div>
          } @else if (error()) {
            <div class="error-fallback">
              <div class="error-header">
                <span class="error-icon">⚠</span>
                <span>Diagram (view source)</span>
              </div>
              <pre class="diagram-source">{{ diagram.source }}</pre>
            </div>
          } @else {
            <div class="mermaid-svg" [innerHTML]="svgContent()"></div>
          }
        </div>
      } @else {
        <!-- ASCII diagram -->
        <pre class="ascii-diagram">{{ diagram.source }}</pre>
      }

      @if (diagram.caption) {
        <div class="diagram-caption">{{ diagram.caption }}</div>
      }
    </div>
  `,
  styles: `
    .diagram-block {
      margin: 1.5rem 0;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--bg-secondary);
    }

    .mermaid-container {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      overflow-x: auto;
    }

    .mermaid-svg {
      display: flex;
      justify-content: center;

      :deep(svg) {
        max-width: 100%;
        height: auto;
      }
    }

    .loading {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .error-fallback {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background-color: #1e1e1e;

      .error-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #2d2d2d;
        border-bottom: 1px solid #3d3d3d;
        color: #888;
        font-size: 0.75rem;

        .error-icon {
          color: #f59e0b;
        }
      }

      .diagram-source {
        margin: 0;
        padding: 1rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8rem;
        line-height: 1.5;
        color: #e0e0e0;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }

    .ascii-diagram {
      padding: 1.5rem;
      margin: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.4;
      overflow-x: auto;
      color: var(--text-primary);
    }

    .diagram-caption {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-align: center;
      font-style: italic;
    }

    .dark {
      .mermaid-svg {
        filter: invert(1) hue-rotate(180deg);
      }
    }
  `,
})
export class DiagramBlockComponent implements OnInit, OnChanges {
  @Input({ required: true }) diagram!: DiagramBlock;
  @Input() theme: 'light' | 'dark' | 'sepia' = 'light';

  private readonly elementRef = inject(ElementRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly svgContent = signal<SafeHtml>('');

  private mermaidInitialized = false;

  ngOnInit(): void {
    if (this.diagram.type === 'mermaid') {
      this.renderMermaid();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagram'] && !changes['diagram'].firstChange) {
      if (this.diagram.type === 'mermaid') {
        this.renderMermaid();
      }
    }
  }

  private async renderMermaid(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    try {
      // Try to dynamically import mermaid if available
      const mermaidModule = await import('mermaid').catch((importError) => {
        console.error('Failed to import mermaid:', importError);
        return null;
      });

      if (!mermaidModule) {
        // Mermaid not installed, show source as fallback
        this.error.set(true);
        this.loading.set(false);
        return;
      }

      const mermaid = mermaidModule.default;

      // Initialize mermaid (v11 compatible)
      if (!this.mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: this.theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        this.mermaidInitialized = true;
      }

      // Generate a unique ID for this diagram
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Clean up the diagram source for better mermaid compatibility:
      let cleanSource = this.diagram.source.trim();

      // Remove <br/> and <br> tags inside node labels - they cause parsing issues
      // Instead, we'll use spaces or remove them entirely
      cleanSource = cleanSource.replace(/<br\s*\/?>/gi, ' ');

      // Handle common HTML entities
      cleanSource = cleanSource.replace(/&nbsp;/gi, ' ');
      cleanSource = cleanSource.replace(/&amp;/gi, '&');
      cleanSource = cleanSource.replace(/&lt;/gi, '<');
      cleanSource = cleanSource.replace(/&gt;/gi, '>');

      // Clean up multiple spaces
      cleanSource = cleanSource.replace(/  +/g, ' ');

      // Render the diagram
      const { svg } = await mermaid.render(id, cleanSource);
      // Bypass Angular's sanitization for mermaid-generated SVG (trusted content)
      this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svg));
      this.loading.set(false);
    } catch (err) {
      console.error('Failed to render mermaid diagram:', err, '\nSource:', this.diagram.source);
      this.error.set(true);
      this.loading.set(false);
    }
  }
}
