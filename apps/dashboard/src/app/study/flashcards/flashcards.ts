import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeUnit, LearningPath, UserProgress } from '@kasita/common-models';
import { KnowledgeUnitFacade, LearningPathsFacade, UserProgressFacade } from '@kasita/core-state';
import { AuthService } from '@kasita/core-data';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

interface StudyCard {
  knowledgeUnit: KnowledgeUnit;
  progress: UserProgress | null;
}

@Component({
  selector: 'app-study-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.scss',
})
export class StudyFlashcards implements OnInit, OnDestroy {
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private userProgressFacade = inject(UserProgressFacade);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  learningPaths: LearningPath[] = [];
  selectedPathId: string | null = null;
  showDueOnly = false;

  cards: StudyCard[] = [];
  currentIndex = 0;
  isFlipped = false;
  isLoading = true;

  private allKnowledgeUnits: KnowledgeUnit[] = [];
  private allProgress: UserProgress[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.previousCard();
        break;
      case 'ArrowRight':
        this.nextCard();
        break;
      case ' ':
        event.preventDefault();
        this.flipCard();
        break;
      case '1':
        this.rateCard(0); // Again
        break;
      case '2':
        this.rateCard(3); // Hard
        break;
      case '3':
        this.rateCard(4); // Good
        break;
      case '4':
        this.rateCard(5); // Easy
        break;
    }
  }

  private loadData(): void {
    this.isLoading = true;

    // Load learning paths
    this.learningPathsFacade.loadLearningPaths();
    this.learningPathsFacade.allLearningPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe((paths) => {
        this.learningPaths = paths;
      });

    // Load knowledge units
    this.knowledgeUnitFacade.loadKnowledgeUnits();

    // Load user progress
    const userId = this.authService.getUserId();
    if (userId) {
      this.userProgressFacade.loadUserProgressByUser(userId);
    }

    // Combine knowledge units and progress
    combineLatest([
      this.knowledgeUnitFacade.allKnowledgeUnits$,
      this.userProgressFacade.allUserProgress$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([units, progress]) => {
        this.allKnowledgeUnits = units;
        this.allProgress = progress;
        this.buildCards();
        this.isLoading = false;
      });
  }

  private buildCards(): void {
    let units = this.allKnowledgeUnits;

    // Filter by learning path if selected
    if (this.selectedPathId) {
      units = units.filter((u) => u.pathId === this.selectedPathId);
    }

    // Build cards with progress
    this.cards = units.map((unit) => {
      const progress = this.allProgress.find((p) => p.unitId === unit.id) || null;
      return { knowledgeUnit: unit, progress };
    });

    // Filter by due for review if enabled
    if (this.showDueOnly) {
      const now = new Date();
      this.cards = this.cards.filter((card) => {
        if (!card.progress) return true; // New cards are always due
        return new Date(card.progress.nextReviewDate) <= now;
      });
    }

    // Reset to first card if current index is out of bounds
    if (this.currentIndex >= this.cards.length) {
      this.currentIndex = Math.max(0, this.cards.length - 1);
    }

    this.isFlipped = false;
  }

  onPathChange(): void {
    this.buildCards();
    this.currentIndex = 0;
  }

  onDueOnlyChange(): void {
    this.buildCards();
    this.currentIndex = 0;
  }

  flipCard(): void {
    if (this.cards.length > 0) {
      this.isFlipped = !this.isFlipped;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  rateCard(quality: number): void {
    if (this.cards.length === 0) return;

    const card = this.cards[this.currentIndex];
    const userId = this.authService.getUserId();

    if (!userId) return;

    // Record the attempt
    this.userProgressFacade.recordAttempt({
      userId,
      unitId: card.knowledgeUnit.id,
      quality,
    });

    // Move to next card or finish
    if (this.currentIndex < this.cards.length - 1) {
      this.nextCard();
    } else {
      // Last card - reload to update progress
      this.userProgressFacade.loadUserProgressByUser(userId);
    }
  }

  get currentCard(): StudyCard | null {
    return this.cards[this.currentIndex] || null;
  }

  get progress(): number {
    if (this.cards.length === 0) return 0;
    return ((this.currentIndex + 1) / this.cards.length) * 100;
  }

  get masteryLabel(): string {
    const progress = this.currentCard?.progress;
    if (!progress) return 'New';
    return progress.masteryLevel.charAt(0).toUpperCase() + progress.masteryLevel.slice(1);
  }

  get confidenceLabel(): string {
    const progress = this.currentCard?.progress;
    if (!progress) return '';
    return `${progress.confidence}% confidence`;
  }
}
