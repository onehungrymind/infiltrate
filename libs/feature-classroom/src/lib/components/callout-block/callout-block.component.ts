import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalloutBlock } from '../../services/classroom-api.service';

@Component({
  selector: 'lib-callout-block',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <div class="callout" [class]="'callout-' + callout.type">
      <div class="callout-icon">{{ getIcon() }}</div>
      <div class="callout-content">
        @if (callout.title || getDefaultTitle()) {
          <div class="callout-title">{{ callout.title || getDefaultTitle() }}</div>
        }
        <div class="callout-text" [innerHTML]="renderMarkdown(callout.content)"></div>
      </div>
    </div>
  `,
  styles: `
    .callout {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .callout-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .callout-content {
      flex: 1;
    }

    .callout-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .callout-text {
      line-height: 1.6;
    }

    .callout-text p {
      margin: 0 0 0.5rem;
    }

    .callout-text p:last-child {
      margin-bottom: 0;
    }

    .callout-text code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.9em;
    }

    .callout-text strong {
      font-weight: 600;
    }

    .callout-text ul,
    .callout-text ol {
      margin: 0.5rem 0;
      padding-left: 1.25rem;
    }

    .callout-text li {
      margin-bottom: 0.25rem;
    }

    /* Tip */
    .callout-tip {
      background-color: rgba(64, 192, 87, 0.1);
      border-color: #40c057;

      .callout-icon { color: #40c057; }
      .callout-title { color: #2f9e44; }
    }

    /* Warning */
    .callout-warning {
      background-color: rgba(250, 176, 5, 0.1);
      border-color: #fab005;

      .callout-icon { color: #fab005; }
      .callout-title { color: #e67700; }
    }

    /* Info */
    .callout-info {
      background-color: rgba(34, 139, 230, 0.1);
      border-color: #228be6;

      .callout-icon { color: #228be6; }
      .callout-title { color: #1971c2; }
    }

    /* Example */
    .callout-example {
      background-color: rgba(121, 80, 242, 0.1);
      border-color: #7950f2;

      .callout-icon { color: #7950f2; }
      .callout-title { color: #6741d9; }
    }

    /* Analogy */
    .callout-analogy {
      background-color: rgba(232, 89, 12, 0.1);
      border-color: #e8590c;

      .callout-icon { color: #e8590c; }
      .callout-title { color: #d9480f; }
    }

    /* Dark theme adjustments */
    :host-context(.theme-dark) {
      .callout-tip {
        background-color: rgba(64, 192, 87, 0.15);
        .callout-title { color: #51cf66; }
      }

      .callout-warning {
        background-color: rgba(250, 176, 5, 0.15);
        .callout-title { color: #fcc419; }
      }

      .callout-info {
        background-color: rgba(34, 139, 230, 0.15);
        .callout-title { color: #4dabf7; }
      }

      .callout-example {
        background-color: rgba(121, 80, 242, 0.15);
        .callout-title { color: #9775fa; }
      }

      .callout-analogy {
        background-color: rgba(232, 89, 12, 0.15);
        .callout-title { color: #ff922b; }
      }
    }
  `,
})
export class CalloutBlockComponent {
  @Input({ required: true }) callout!: CalloutBlock;

  getIcon(): string {
    const icons: Record<string, string> = {
      tip: '💡',
      warning: '⚠️',
      info: 'ℹ️',
      example: '📝',
      analogy: '🔗',
    };
    return icons[this.callout.type] || '📌';
  }

  getDefaultTitle(): string {
    const titles: Record<string, string> = {
      tip: 'Tip',
      warning: 'Warning',
      info: 'Note',
      example: 'Example',
      analogy: 'Real-World Analogy',
    };
    return titles[this.callout.type] || '';
  }

  renderMarkdown(content: string): string {
    if (!content) return '';
    let html = content;

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

    // Double newlines become paragraph breaks
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines become line breaks
    html = html.replace(/\n/g, '<br>');

    html = `<p>${html}</p>`;

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p><br>/g, '<p>');
    html = html.replace(/<br><\/p>/g, '</p>');

    return html;
  }
}
