import { Injectable, NotFoundException } from '@nestjs/common';
import * as Handlebars from 'handlebars';

import {
  ContentBlock,
  Session,
  SessionSection,
} from '@kasita/common-models';

import { GymnasiumService } from '../gymnasium.service';
import {
  DEFAULT_DARK_CSS,
  DEFAULT_DARK_TEMPLATE,
} from '../templates/default-dark.template';

@Injectable()
export class SessionRendererService {
  private compiledTemplate: Handlebars.TemplateDelegate | null = null;

  constructor(private readonly gymnasiumService: GymnasiumService) {
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers for block rendering
   */
  private registerHelpers(): void {
    // Helper to render a block based on its type
    Handlebars.registerHelper('renderBlock', (block: ContentBlock) => {
      return new Handlebars.SafeString(this.renderBlock(block));
    });

    // Helper for equality comparison
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    // Helper to escape HTML in code blocks
    Handlebars.registerHelper('escapeHtml', (text: string) => {
      return Handlebars.Utils.escapeExpression(text);
    });

    // Helper for markdown-like formatting (basic)
    Handlebars.registerHelper('markdown', (text: string) => {
      if (!text) return '';
      // Basic markdown: **bold**, `code`, *italic*
      let html = Handlebars.Utils.escapeExpression(text);
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      html = html.replace(/`(.+?)`/g, '<code>$1</code>');
      html = html.replace(/\n/g, '<br>');
      return new Handlebars.SafeString(html);
    });
  }

  /**
   * Render a single content block to HTML
   */
  renderBlock(block: ContentBlock): string {
    switch (block.type) {
      case 'prose':
        return this.renderProseBlock(block);
      case 'heading':
        return this.renderHeadingBlock(block);
      case 'code':
        return this.renderCodeBlock(block);
      case 'command':
        return this.renderCommandBlock(block);
      case 'exercise':
        return this.renderExerciseBlock(block);
      case 'tryThis':
        return this.renderTryThisBlock(block);
      case 'callout':
        return this.renderCalloutBlock(block);
      case 'table':
        return this.renderTableBlock(block);
      case 'checklist':
        return this.renderChecklistBlock(block);
      case 'diagram':
        return this.renderDiagramBlock(block);
      case 'structure':
        return this.renderStructureBlock(block);
      case 'keyLearning':
        return this.renderKeyLearningBlock(block);
      case 'divider':
        return this.renderDividerBlock(block);
      default:
        return `<!-- Unknown block type: ${(block as any).type} -->`;
    }
  }

  private renderProseBlock(block: { type: 'prose'; content: string }): string {
    // Basic markdown-like processing
    let html = this.escapeHtml(block.content);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Split into paragraphs
    const paragraphs = html.split(/\n\n+/);
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  }

  private renderHeadingBlock(block: { type: 'heading'; level: 2 | 3 | 4; text: string; anchor?: string }): string {
    const tag = `h${block.level}`;
    const id = block.anchor ? ` id="${this.escapeHtml(block.anchor)}"` : '';
    return `<${tag}${id}>${this.escapeHtml(block.text)}</${tag}>`;
  }

  private renderCodeBlock(block: { type: 'code'; language: string; code: string; label?: string; filename?: string }): string {
    const escapedCode = this.escapeHtml(block.code);
    const labelHtml = block.label
      ? `<span class="code-label">${this.escapeHtml(block.label)}</span>`
      : '';

    return `
<div class="code-block">
  ${labelHtml}
  <pre><code class="language-${this.escapeHtml(block.language)}">${escapedCode}</code></pre>
</div>`;
  }

  private renderCommandBlock(block: { type: 'command'; command: string }): string {
    return `<div class="command">${this.escapeHtml(block.command)}</div>`;
  }

  private renderExerciseBlock(block: { type: 'exercise'; badge: string; title: string; goal?: string; content: string }): string {
    const goalHtml = block.goal
      ? `<div class="exercise-goal">${this.escapeHtml(block.goal)}</div>`
      : '';

    // Process content (basic markdown)
    let contentHtml = this.escapeHtml(block.content);
    contentHtml = contentHtml.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    contentHtml = contentHtml.replace(/`(.+?)`/g, '<code>$1</code>');
    contentHtml = contentHtml.replace(/\n/g, '<br>');

    return `
<div class="exercise">
  <div class="exercise-header">
    <span class="exercise-badge">${this.escapeHtml(block.badge)}</span>
    <span class="exercise-title">${this.escapeHtml(block.title)}</span>
  </div>
  ${goalHtml}
  <div class="exercise-content">${contentHtml}</div>
</div>`;
  }

  private renderTryThisBlock(block: { type: 'tryThis'; steps: string[] }): string {
    const stepsHtml = block.steps
      .map(step => {
        let html = this.escapeHtml(step);
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        return `<li>${html}</li>`;
      })
      .join('\n');

    return `
<div class="try-this">
  <div class="try-this-header">
    <span>💡 Try This</span>
  </div>
  <ol>${stepsHtml}</ol>
</div>`;
  }

  private renderCalloutBlock(block: { type: 'callout'; variant: 'tip' | 'note' | 'warning' | 'info'; title?: string; content: string }): string {
    const icons = {
      tip: '💡',
      note: '📝',
      warning: '⚠️',
      info: 'ℹ️',
    };
    const defaultTitles = {
      tip: 'Tip',
      note: 'Note',
      warning: 'Warning',
      info: 'Info',
    };

    const icon = icons[block.variant] || '📝';
    const title = block.title || defaultTitles[block.variant] || 'Note';

    let contentHtml = this.escapeHtml(block.content);
    contentHtml = contentHtml.replace(/`(.+?)`/g, '<code>$1</code>');
    contentHtml = contentHtml.replace(/\n/g, '<br>');

    return `
<div class="callout ${block.variant}">
  <div class="callout-header">${icon} ${this.escapeHtml(title)}</div>
  <p>${contentHtml}</p>
</div>`;
  }

  private renderTableBlock(block: { type: 'table'; headers: string[]; rows: string[][]; caption?: string }): string {
    const headersHtml = block.headers
      .map(h => `<th>${this.escapeHtml(h)}</th>`)
      .join('');

    const rowsHtml = block.rows
      .map(row => {
        const cells = row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      })
      .join('\n');

    const captionHtml = block.caption
      ? `<caption>${this.escapeHtml(block.caption)}</caption>`
      : '';

    return `
<table>
  ${captionHtml}
  <thead><tr>${headersHtml}</tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>`;
  }

  private renderChecklistBlock(block: { type: 'checklist'; title?: string; items: string[] }): string {
    const titleHtml = block.title
      ? `<h4>${this.escapeHtml(block.title)}</h4>`
      : '';

    const itemsHtml = block.items
      .map(item => {
        let html = this.escapeHtml(item);
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        return `<li>${html}</li>`;
      })
      .join('\n');

    return `
${titleHtml}
<ul class="checklist">${itemsHtml}</ul>`;
  }

  private renderDiagramBlock(block: { type: 'diagram'; content: string; format: 'ascii' | 'mermaid' }): string {
    // For now, just render as pre-formatted text
    // Mermaid support could be added later with client-side JS
    return `<div class="diagram">${this.escapeHtml(block.content)}</div>`;
  }

  private renderStructureBlock(block: { type: 'structure'; content: string }): string {
    return `<pre class="structure">${this.escapeHtml(block.content)}</pre>`;
  }

  private renderKeyLearningBlock(block: { type: 'keyLearning'; content: string }): string {
    let html = this.escapeHtml(block.content);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    return `<div class="key-learning"><strong>Key Learning:</strong> ${html}</div>`;
  }

  private renderDividerBlock(block: { type: 'divider'; label?: string }): string {
    if (block.label) {
      return `<div class="section-divider">${this.escapeHtml(block.label)}</div>`;
    }
    return '<hr>';
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Render a full session to HTML
   */
  async renderSession(sessionId: string, templateId?: string): Promise<string> {
    // Get session
    const session = await this.gymnasiumService.findSessionById(sessionId);

    // Get template (use default if not specified)
    let htmlTemplate = DEFAULT_DARK_TEMPLATE;
    let cssStyles = DEFAULT_DARK_CSS;

    if (templateId) {
      try {
        const template = await this.gymnasiumService.findTemplateById(templateId);
        htmlTemplate = template.htmlTemplate;
        cssStyles = template.cssStyles;
      } catch (e) {
        // Fall back to default if template not found
      }
    }

    // Compile template if needed
    const compiled = Handlebars.compile(htmlTemplate);

    // Render
    const html = compiled({
      session,
      styles: cssStyles,
      generatedAt: new Date().toISOString(),
    });

    return html;
  }

  /**
   * Render session to HTML using session object directly (for preview)
   */
  renderSessionDirect(session: Session, templateId?: string): string {
    const htmlTemplate = DEFAULT_DARK_TEMPLATE;
    const cssStyles = DEFAULT_DARK_CSS;

    const compiled = Handlebars.compile(htmlTemplate);

    return compiled({
      session,
      styles: cssStyles,
      generatedAt: new Date().toISOString(),
    });
  }
}
