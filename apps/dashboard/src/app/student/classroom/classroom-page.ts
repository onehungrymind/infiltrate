import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil, switchMap, filter, tap, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import {
  ClassroomApiService,
  ClassroomContent,
  ReadingProgress,
  ReadingPreferences,
  MicroQuiz,
  ReadingViewComponent,
  TableOfContentsComponent,
  ReadingControlsComponent,
  MicroQuizComponent,
} from '@kasita/feature-classroom';

@Component({
  selector: 'app-classroom-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReadingViewComponent,
    TableOfContentsComponent,
    ReadingControlsComponent,
    MicroQuizComponent,
  ],
  template: `
    <div class="classroom-container" [class]="themeClass()">
      <!-- Header -->
      <header class="classroom-header">
        <button class="back-btn" (click)="goBack()">
          ← Back
        </button>
        <div class="header-title">
          @if (content()) {
            <span class="concept-label">{{ conceptName() }}</span>
            <h1>{{ content()!.title }}</h1>
          }
        </div>
        <lib-reading-controls
          [preferences]="preferences()"
          (preferencesChange)="onPreferencesChange($event)"
        />
      </header>

      <!-- Main content area -->
      <div class="classroom-body">
        <!-- Sidebar with TOC -->
        <aside class="classroom-sidebar">
          @if (content()) {
            <lib-table-of-contents
              [sections]="content()!.sections"
              [currentSectionId]="currentSectionId()"
              [progress]="progress()"
              (sectionClick)="scrollToSection($event)"
            />
          }
        </aside>

        <!-- Reading area -->
        <main class="classroom-main">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading content...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <p>{{ error() }}</p>
              <button (click)="loadContent()">Retry</button>
            </div>
          } @else if (content()) {
            <lib-reading-view
              [content]="content()!"
              [preferences]="preferences()"
              [progress]="progress()"
              (scrollPositionChange)="onScrollPositionChange($event)"
              (sectionChange)="onSectionChange($event)"
            />

            <!-- Micro Quiz at the end -->
            @if (quiz() && showQuiz()) {
              <lib-micro-quiz
                [quiz]="quiz()!"
                [subConceptId]="subConceptId()"
                (quizComplete)="onQuizComplete($event)"
              />
            }

            <!-- Mark complete button -->
            @if (!isComplete()) {
              <div class="complete-section">
                <button class="complete-btn" (click)="markAsComplete()">
                  Mark as Complete
                </button>
              </div>
            } @else {
              <div class="completed-badge">
                ✓ Completed
              </div>
            }
          } @else {
            <div class="empty-state">
              <p>No content available for this sub-concept yet.</p>
              <p class="hint">Content is being generated...</p>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styleUrl: './classroom-page.scss',
})
export class ClassroomPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly classroomApi = inject(ClassroomApiService);
  private readonly destroy$ = new Subject<void>();

  // Route params
  readonly subConceptId = signal<string>('');
  readonly conceptName = signal<string>('');
  readonly learningPathId = signal<string>('');

  // Data signals
  readonly content = signal<ClassroomContent | null>(null);
  readonly progress = signal<ReadingProgress | null>(null);
  readonly preferences = signal<ReadingPreferences>({
    id: '',
    userId: '',
    theme: 'light',
    fontSize: 'medium',
    lineSpacing: 'normal',
    fontFamily: 'sans',
  });
  readonly quiz = signal<MicroQuiz | null>(null);

  // UI state
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentSectionId = signal<string>('');
  readonly showQuiz = signal(false);

  // Computed
  readonly themeClass = computed(() => `theme-${this.preferences().theme}`);
  readonly isComplete = computed(
    () => this.progress()?.status === 'completed'
  );

  // Progress tracking
  private lastProgressUpdate = Date.now();

  ngOnInit(): void {
    // Load preferences first
    this.classroomApi
      .getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prefs) => this.preferences.set(prefs),
        error: () => {
          // Use defaults if preferences fail
        },
      });

    // Listen to route params
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          const id = params.get('subConceptId') || '';
          this.subConceptId.set(id);
          this.learningPathId.set(params.get('learningPathId') || '');
        }),
        filter((params) => !!params.get('subConceptId'))
      )
      .subscribe(() => this.loadContent());

    // Also check query params for concept name
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.conceptName.set(params.get('concept') || '');
      });

    // Periodic progress save (every 30 seconds)
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.content() && !!this.progress())
      )
      .subscribe(() => this.saveProgress());
  }

  ngOnDestroy(): void {
    // Save final progress before leaving
    this.saveProgress();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContent(): void {
    const subConceptId = this.subConceptId();
    if (!subConceptId) return;

    this.loading.set(true);
    this.error.set(null);

    this.classroomApi
      .getContentBySubConcept(subConceptId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((content) => {
          this.content.set(content);
          if (content) {
            // Load progress and quiz in parallel
            return Promise.all([
              this.classroomApi.getProgress(content.id).toPromise(),
              this.classroomApi.getMicroQuiz(subConceptId).toPromise(),
            ]);
          }
          return Promise.resolve([null, null]);
        })
      )
      .subscribe({
        next: ([progress, quiz]) => {
          this.progress.set(progress || null);
          this.quiz.set(quiz || null);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load content. Please try again.');
          this.loading.set(false);
          console.error('Failed to load classroom content:', err);
        },
      });
  }

  onScrollPositionChange(position: number): void {
    // Update progress
    const currentProgress = this.progress();
    if (currentProgress) {
      this.progress.set({ ...currentProgress, scrollPosition: position });
    }

    // Show quiz when scrolled to 95%+
    if (position >= 95) {
      this.showQuiz.set(true);
    }
  }

  onSectionChange(sectionId: string): void {
    this.currentSectionId.set(sectionId);
  }

  onPreferencesChange(prefs: Partial<ReadingPreferences>): void {
    this.preferences.update((current) => ({ ...current, ...prefs }));

    // Save to backend
    this.classroomApi
      .updatePreferences(prefs)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onQuizComplete(passed: boolean): void {
    if (passed) {
      this.markAsComplete();
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  markAsComplete(): void {
    const contentId = this.content()?.id;
    if (!contentId) return;

    this.classroomApi
      .markComplete(contentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (progress) => this.progress.set(progress),
        error: (err) => console.error('Failed to mark as complete:', err),
      });
  }

  goBack(): void {
    window.history.back();
  }

  private saveProgress(): void {
    const contentId = this.content()?.id;
    const currentProgress = this.progress();
    if (!contentId || !currentProgress) return;

    const now = Date.now();
    const readTime = Math.floor((now - this.lastProgressUpdate) / 1000);
    this.lastProgressUpdate = now;

    if (readTime > 0) {
      this.classroomApi
        .updateProgress(contentId, {
          scrollPosition: currentProgress.scrollPosition,
          readTime,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (progress) => this.progress.set(progress),
          error: (err) => console.error('Failed to save progress:', err),
        });
    }
  }
}
