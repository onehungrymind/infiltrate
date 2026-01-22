import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClassroomContent,
  ClassroomSection,
  ReadingPreferences,
  ReadingProgress,
} from '../../services/classroom-api.service';
import { SectionRendererComponent } from '../section-renderer/section-renderer.component';

@Component({
  selector: 'lib-reading-view',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  template: `
    <article
      class="reading-view"
      [class]="fontSizeClass()"
      [style.font-family]="fontFamily()"
      [style.line-height]="lineHeight()"
    >
      <!-- Summary -->
      <div class="summary">
        <p>{{ content.summary }}</p>
        <div class="meta">
          <span>{{ content.estimatedReadTime }} min read</span>
          <span>{{ content.wordCount | number }} words</span>
        </div>
      </div>

      <!-- Sections -->
      <div class="sections">
        @for (section of content.sections; track section.id) {
          <div
            [id]="'section-' + section.id"
            class="section"
            [attr.data-section-id]="section.id"
          >
            <lib-section-renderer [section]="section" [preferences]="preferences" />
          </div>
        }
      </div>
    </article>
  `,
  styleUrl: './reading-view.component.scss',
})
export class ReadingViewComponent implements OnInit, OnDestroy {
  @Input({ required: true }) content!: ClassroomContent;
  @Input({ required: true }) preferences!: ReadingPreferences;
  @Input() progress: ReadingProgress | null = null;

  @Output() scrollPositionChange = new EventEmitter<number>();
  @Output() sectionChange = new EventEmitter<string>();

  private readonly elementRef = inject(ElementRef);
  private scrollObserver: IntersectionObserver | null = null;
  private scrollHandler: (() => void) | null = null;

  readonly scrollPosition = signal(0);

  readonly fontSizeClass = signal('font-medium');
  readonly fontFamily = signal("'Inter', system-ui, sans-serif");
  readonly lineHeight = signal('1.8');

  ngOnInit(): void {
    this.updateStyles();
    this.setupScrollTracking();
    this.setupSectionObserver();

    // Restore scroll position if available
    if (this.progress?.scrollPosition) {
      this.scrollPosition.set(this.progress.scrollPosition);
      // Scroll to saved position after a brief delay
      setTimeout(() => {
        const main = this.elementRef.nativeElement.closest('.classroom-main');
        if (main) {
          const scrollHeight = main.scrollHeight - main.clientHeight;
          main.scrollTop = (this.progress!.scrollPosition / 100) * scrollHeight;
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.scrollHandler) {
      const main = this.elementRef.nativeElement.closest('.classroom-main');
      if (main) {
        main.removeEventListener('scroll', this.scrollHandler);
      }
    }
  }

  private updateStyles(): void {
    // Font size
    switch (this.preferences.fontSize) {
      case 'small':
        this.fontSizeClass.set('font-small');
        break;
      case 'large':
        this.fontSizeClass.set('font-large');
        break;
      default:
        this.fontSizeClass.set('font-medium');
    }

    // Font family
    switch (this.preferences.fontFamily) {
      case 'serif':
        this.fontFamily.set("'Georgia', 'Times New Roman', serif");
        break;
      case 'mono':
        this.fontFamily.set("'JetBrains Mono', 'Fira Code', monospace");
        break;
      default:
        this.fontFamily.set("'Inter', system-ui, sans-serif");
    }

    // Line spacing
    switch (this.preferences.lineSpacing) {
      case 'compact':
        this.lineHeight.set('1.5');
        break;
      case 'relaxed':
        this.lineHeight.set('2.0');
        break;
      default:
        this.lineHeight.set('1.8');
    }
  }

  private setupScrollTracking(): void {
    const main = this.elementRef.nativeElement.closest('.classroom-main');
    if (!main) return;

    this.scrollHandler = () => {
      const scrollTop = main.scrollTop;
      const scrollHeight = main.scrollHeight - main.clientHeight;
      const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      this.scrollPosition.set(Math.round(percentage));
      this.scrollPositionChange.emit(Math.round(percentage));
    };

    main.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private setupSectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: this.elementRef.nativeElement.closest('.classroom-main'),
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            this.sectionChange.emit(sectionId);
          }
          break;
        }
      }
    }, options);

    // Observe all sections
    setTimeout(() => {
      const sections = this.elementRef.nativeElement.querySelectorAll('.section');
      sections.forEach((section: Element) => {
        this.scrollObserver?.observe(section);
      });
    }, 100);
  }
}
