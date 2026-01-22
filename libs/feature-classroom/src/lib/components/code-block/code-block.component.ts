import { Component, Input, signal, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlock } from '../../services/classroom-api.service';

// Import Prism core and languages
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-sql';

@Component({
  selector: 'lib-code-block',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  template: `
    <div class="code-block">
      <div class="code-header">
        @if (code.filename) {
          <span class="filename">{{ code.filename }}</span>
        }
        <span class="language">{{ code.language }}</span>
        <button class="copy-btn" (click)="copyCode()" [class.copied]="copied()">
          {{ copied() ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <pre class="code-content"><code [innerHTML]="highlightedCode()"></code></pre>
      @if (code.caption) {
        <div class="code-caption">{{ code.caption }}</div>
      }
    </div>
  `,
  styles: `
    .code-block {
      margin: 1.5rem 0;
      border-radius: 8px;
      overflow: hidden;
      background-color: #1e1e1e;
    }

    .code-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      background-color: #2d2d2d;
      border-bottom: 1px solid #3d3d3d;

      .filename {
        color: #e0e0e0;
        font-size: 0.875rem;
        font-family: 'JetBrains Mono', monospace;
      }

      .language {
        color: #888;
        font-size: 0.75rem;
        text-transform: uppercase;
        margin-left: auto;
      }

      .copy-btn {
        background: none;
        border: 1px solid #555;
        color: #888;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #888;
          color: #ccc;
        }

        &.copied {
          border-color: #4caf50;
          color: #4caf50;
        }
      }
    }

    .code-content {
      margin: 0;
      padding: 1rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      color: #e0e0e0;
    }

    .code-content code {
      font-family: inherit;
    }

    /* Prism.js VS Code Dark+ inspired theme */
    .code-content .token.comment,
    .code-content .token.prolog,
    .code-content .token.doctype,
    .code-content .token.cdata { color: #6a9955; font-style: italic; }

    .code-content .token.punctuation { color: #d4d4d4; }

    .code-content .token.property,
    .code-content .token.tag,
    .code-content .token.boolean,
    .code-content .token.number,
    .code-content .token.constant,
    .code-content .token.symbol { color: #b5cea8; }

    .code-content .token.selector,
    .code-content .token.attr-name,
    .code-content .token.string,
    .code-content .token.char,
    .code-content .token.builtin { color: #ce9178; }

    .code-content .token.operator,
    .code-content .token.entity,
    .code-content .token.url,
    .code-content .language-css .token.string,
    .code-content .style .token.string { color: #d4d4d4; }

    .code-content .token.atrule,
    .code-content .token.attr-value,
    .code-content .token.keyword { color: #c586c0; }

    .code-content .token.function,
    .code-content .token.class-name { color: #dcdcaa; }

    .code-content .token.regex,
    .code-content .token.important,
    .code-content .token.variable { color: #d16969; }

    .code-content .token.important,
    .code-content .token.bold { font-weight: bold; }

    .code-content .token.italic { font-style: italic; }

    .code-content .token.entity { cursor: help; }

    .code-content .highlight-line {
      background-color: rgba(255, 255, 0, 0.1);
      display: block;
    }

    .code-caption {
      padding: 0.5rem 1rem;
      background-color: #2d2d2d;
      color: #888;
      font-size: 0.875rem;
      border-top: 1px solid #3d3d3d;
      font-style: italic;
    }
  `,
})
export class CodeBlockComponent {
  @Input({ required: true }) code!: CodeBlock;

  readonly copied = signal(false);

  highlightedCode(): string {
    const code = this.code.code || '';
    const language = this.mapLanguage(this.code.language || 'text');

    // Use Prism for syntax highlighting
    let html: string;
    if (Prism.languages[language]) {
      html = Prism.highlight(code, Prism.languages[language], language);
    } else {
      // Fallback to escaped HTML if language not supported
      html = this.escapeHtml(code);
    }

    // Apply line highlighting
    if (this.code.highlightLines?.length) {
      html = this.applyLineHighlighting(html, this.code.highlightLines);
    }

    return html;
  }

  private mapLanguage(lang: string): string {
    // Map common language names to Prism language keys
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'js': 'javascript',
      'py': 'python',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      'html': 'markup',
      'xml': 'markup',
    };
    return langMap[lang.toLowerCase()] || lang.toLowerCase();
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.code.code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private applyLineHighlighting(html: string, lines: number[]): string {
    const htmlLines = html.split('\n');
    return htmlLines
      .map((line, index) => {
        const lineNum = index + 1;
        if (lines.includes(lineNum)) {
          return `<span class="highlight">${line}</span>`;
        }
        return line;
      })
      .join('\n');
  }
}
