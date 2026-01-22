import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassroomSection, ReadingProgress } from '../../services/classroom-api.service';

@Component({
  selector: 'lib-table-of-contents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="toc">
      <h3 class="toc-title">Contents</h3>

      <ul class="toc-list">
        @for (section of proseSections; track section.id) {
          <li
            class="toc-item"
            [class.active]="section.id === currentSectionId"
            (click)="sectionClick.emit(section.id)"
          >
            <span class="toc-dot" [class.read]="isSectionRead(section.id)"></span>
            <span class="toc-text">{{ getSectionTitle(section) }}</span>
          </li>
        }
      </ul>

      @if (progress) {
        <div class="toc-progress">
          <div class="progress-label">
            <span>Reading Progress</span>
            <span>{{ progress.scrollPosition }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progress.scrollPosition"></div>
          </div>
          @if (progress.totalReadTime > 0) {
            <div class="time-spent">
              {{ formatTime(progress.totalReadTime) }} reading
            </div>
          }
        </div>
      }
    </nav>
  `,
  styles: `
    .toc {
      position: sticky;
      top: 0;
    }

    .toc-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin: 0 0 1rem;
    }

    .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .toc-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.5rem 0;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: var(--accent-color);
      }

      &.active {
        color: var(--accent-color);

        .toc-dot {
          background-color: var(--accent-color);
        }
      }
    }

    .toc-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--border-color);
      margin-top: 0.4rem;
      flex-shrink: 0;
      transition: background-color 0.2s ease;

      &.read {
        background-color: var(--success-color);
      }
    }

    .toc-text {
      font-size: 0.875rem;
      line-height: 1.4;
      color: var(--text-secondary);

      .toc-item.active & {
        color: var(--accent-color);
        font-weight: 500;
      }
    }

    .toc-progress {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 4px;
      background-color: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
    }

    .time-spent {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
  `,
})
export class TableOfContentsComponent {
  @Input({ required: true }) sections!: ClassroomSection[];
  @Input() currentSectionId = '';
  @Input() progress: ReadingProgress | null = null;

  @Output() sectionClick = new EventEmitter<string>();

  get proseSections(): ClassroomSection[] {
    // Filter to only prose sections for TOC
    return this.sections.filter(
      (s) => s.type === 'prose' || s.type === 'example'
    );
  }

  getSectionTitle(section: ClassroomSection): string {
    if (!section.content) return `Section ${section.order}`;

    // Try to extract a heading from the content
    const headingMatch = section.content.match(/^#+\s*(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Otherwise use first line or truncate
    const firstLine = section.content.split('\n')[0];
    const text = firstLine.replace(/[#*_`]/g, '').trim();
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
  }

  isSectionRead(sectionId: string): boolean {
    // Simple heuristic: section is read if we've scrolled past it
    const sectionIndex = this.sections.findIndex((s) => s.id === sectionId);
    const currentIndex = this.sections.findIndex(
      (s) => s.id === this.currentSectionId
    );
    return sectionIndex < currentIndex;
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}
