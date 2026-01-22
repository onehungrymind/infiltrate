import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClassroomSection,
  ReadingPreferences,
} from '../../services/classroom-api.service';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { DiagramBlockComponent } from '../diagram-block/diagram-block.component';
import { CalloutBlockComponent } from '../callout-block/callout-block.component';

@Component({
  selector: 'lib-section-renderer',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    CodeBlockComponent,
    DiagramBlockComponent,
    CalloutBlockComponent,
  ],
  template: `
    @switch (section.type) {
      @case ('prose') {
        <div class="prose-section" [innerHTML]="renderMarkdown(section.content || '')"></div>
      }
      @case ('code') {
        @if (section.code) {
          <lib-code-block [code]="section.code" />
        }
      }
      @case ('diagram') {
        @if (section.diagram) {
          <lib-diagram-block [diagram]="section.diagram" [theme]="preferences.theme" />
        }
      }
      @case ('callout') {
        @if (section.callout) {
          <lib-callout-block [callout]="section.callout" />
        }
      }
      @case ('example') {
        <div class="example-section">
          <div class="example-header">Example</div>
          <div class="example-content" [innerHTML]="renderMarkdown(section.content || '')"></div>
        </div>
      }
      @default {
        <div class="unknown-section">
          <p>Unknown section type: {{ section.type }}</p>
        </div>
      }
    }
  `,
  styles: `
    .prose-section {
      color: var(--text-primary);
    }

    .prose-section h1 {
      font-size: 1.75em;
      font-weight: 700;
      margin: 1.75rem 0 1rem;
      color: var(--text-primary);
      border-bottom: 2px solid var(--accent-color);
      padding-bottom: 0.5rem;
    }

    .prose-section h2 {
      font-size: 1.4em;
      font-weight: 600;
      margin: 2rem 0 1rem;
      padding-top: 1.5rem;
      color: var(--text-primary);
      border-top: 1px solid var(--border-color);
    }

    .prose-section h2:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .prose-section h3 {
      font-size: 1.2em;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
      color: var(--text-primary);
    }

    .prose-section p {
      margin: 0 0 1rem;
      line-height: 1.7;
    }

    .prose-section ul,
    .prose-section ol {
      margin: 0 0 1rem;
      padding-left: 1.5rem;
    }

    .prose-section li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .prose-section strong {
      font-weight: 600;
      color: var(--text-primary);
    }

    .prose-section code {
      background-color: var(--bg-secondary);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.9em;
    }

    .prose-section blockquote {
      border-left: 3px solid var(--accent-color);
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
    }

    .prose-section a {
      color: var(--accent-color);
      text-decoration: none;
    }

    .prose-section a:hover {
      text-decoration: underline;
    }

    .example-section {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      margin: 1rem 0;
    }

    .example-section .example-header {
      background-color: var(--accent-color);
      color: white;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .example-section .example-content {
      padding: 1rem;
    }

    .unknown-section {
      padding: 1rem;
      background-color: var(--bg-secondary);
      border-radius: 4px;
      color: var(--text-muted);
    }
  `,
})
export class SectionRendererComponent {
  @Input({ required: true }) section!: ClassroomSection;
  @Input({ required: true }) preferences!: ReadingPreferences;

  renderMarkdown(content: string): string {
    // Simple markdown rendering
    // In a real app, you'd use a proper markdown library like marked or ngx-markdown
    let html = content;

    // Auto-detect titles: lines that look like headers (short line followed by paragraph)
    // Pattern: A short line (under 80 chars, no period) at start or after blank line, followed by longer content
    html = html.replace(/^([A-Z][^.\n]{5,75})(\n)([A-Z])/gm, '## $1$2$3');

    // Headers (order matters: longest match first)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Paragraphs (simple approach)
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[123]>)/g, '$1');
    html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
  }
}
