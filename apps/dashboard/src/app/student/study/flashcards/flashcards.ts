import { CommonModule } from '@angular/common';
import { Component, computed, effect,HostListener, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KnowledgeUnit, LearningPath, UserProgress } from '@kasita/common-models';
import { AuthService } from '@kasita/core-data';
import { KnowledgeUnitFacade, LearningPathsFacade, UserProgressFacade } from '@kasita/core-state';

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
export class StudyFlashcards implements OnInit {
  private knowledgeUnitFacade = inject(KnowledgeUnitFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private userProgressFacade = inject(UserProgressFacade);
  private authService = inject(AuthService);

  // Signals from NgRx
  private allKnowledgeUnits = toSignal(this.knowledgeUnitFacade.allKnowledgeUnits$, { initialValue: [] as KnowledgeUnit[] });
  private allProgress = toSignal(this.userProgressFacade.allUserProgress$, { initialValue: [] as UserProgress[] });
  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });

  // Local state signals
  selectedPathId = signal<string | null>(null);
  showDueOnly = signal(false);
  currentIndex = signal(0);
  isFlipped = signal(false);

  // Computed signals
  cards = computed(() => {
    let units = this.allKnowledgeUnits();
    const pathId = this.selectedPathId();

    // Filter by learning path if selected
    if (pathId) {
      units = units.filter((u) => u.pathId === pathId);
    }

    // Build cards with progress
    const progress = this.allProgress();
    let cards: StudyCard[] = units.map((unit) => ({
      knowledgeUnit: unit,
      progress: progress.find((p) => p.unitId === unit.id) || null,
    }));

    // Filter by due for review if enabled
    if (this.showDueOnly()) {
      const now = new Date();
      cards = cards.filter((card) => {
        if (!card.progress) return true;
        return new Date(card.progress.nextReviewDate) <= now;
      });
    }

    return cards;
  });

  isLoading = computed(() => {
    return this.allKnowledgeUnits().length === 0;
  });

  currentCard = computed(() => {
    const cards = this.cards();
    const index = this.currentIndex();
    return cards[index] || null;
  });

  progress = computed(() => {
    const cards = this.cards();
    if (cards.length === 0) return 0;
    return ((this.currentIndex() + 1) / cards.length) * 100;
  });

  masteryLabel = computed(() => {
    const card = this.currentCard();
    if (!card?.progress) return 'New';
    return card.progress.masteryLevel.charAt(0).toUpperCase() + card.progress.masteryLevel.slice(1);
  });

  confidenceLabel = computed(() => {
    const card = this.currentCard();
    if (!card?.progress) return '';
    return `${card.progress.confidence}% confidence`;
  });

  constructor() {
    // Reset currentIndex when cards change and index is out of bounds
    effect(() => {
      const cards = this.cards();
      const index = this.currentIndex();
      if (index >= cards.length && cards.length > 0) {
        this.currentIndex.set(cards.length - 1);
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
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
        this.rateCard(0);
        break;
      case '2':
        this.rateCard(3);
        break;
      case '3':
        this.rateCard(4);
        break;
      case '4':
        this.rateCard(5);
        break;
    }
  }

  private loadData(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.knowledgeUnitFacade.loadKnowledgeUnits();

    const userId = this.authService.getUserId();
    if (userId) {
      this.userProgressFacade.loadUserProgressByUser(userId);
    }
  }

  onPathChange(pathId: string | null): void {
    this.selectedPathId.set(pathId);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
  }

  onDueOnlyChange(dueOnly: boolean): void {
    this.showDueOnly.set(dueOnly);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
  }

  flipCard(): void {
    if (this.cards().length > 0) {
      this.isFlipped.update(v => !v);
    }
  }

  nextCard(): void {
    if (this.currentIndex() < this.cards().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.isFlipped.set(false);
    }
  }

  previousCard(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isFlipped.set(false);
    }
  }

  rateCard(quality: number): void {
    const cards = this.cards();
    if (cards.length === 0) return;

    const card = cards[this.currentIndex()];
    const userId = this.authService.getUserId();

    if (!userId) return;

    this.userProgressFacade.recordAttempt({
      userId,
      unitId: card.knowledgeUnit.id,
      quality,
    });

    if (this.currentIndex() < cards.length - 1) {
      this.nextCard();
    } else {
      this.userProgressFacade.loadUserProgressByUser(userId);
    }
  }
}
